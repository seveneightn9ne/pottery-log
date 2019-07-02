import _ from 'lodash';
import { Action } from '../action';
import { IMPORT_STORAGE_KEY as STORAGE_KEY } from '../thunks/loadInitial';
import {
  importImage,
  importMetadataNow,
  startImport,
  startUrlImport,
} from '../utils/exports';
import { nameFromUri } from '../utils/imageutils';
import { StorageWriter } from '../utils/sync';
import store from './store';
import {
  ImageMapState,
  ImageMapValue,
  ImportState,
  ImportStatePersisted,
} from './types';

export const PARALLEL_IMAGE_IMPORTS = 2; // Down from 3 to prevent OOM

export function getInitialState(): ImportState {
  return { importing: false };
}

/**
 * Import flow:
 * Button press - either:
 *   -> upload - 'import-initiate'
 *     -> choose a file
 *       -> upload file
 *         -> 'import-started'
 *   -> url - 'import-initiate-url'
 *     -> upload URL
 *        -> 'import-started'
 * -> confirmation popup
 * -> save metadata
 * -> reloadFromImport
 * -> 'imported-metadata'
 * -> saveToFile x3
 *   -> 'image-file-created'
 *     -> saveToFile x1
 *     -> no more? 'page-list'
 *   -> 'image-timeout'
 *     -> retry saveToFile
 */

export function reduceImport(
  state: ImportState = getInitialState(),
  action: Action,
): ImportState {
  // Actions when we might not be importing already
  switch (action.type) {
    case 'import-initiate': {
      startImport();
      return {
        importing: true,
        statusMessage: 'Starting import...',
      };
    }
    case 'import-initiate-url': {
      startUrlImport(action.url);
      return {
        importing: true,
        statusMessage: 'Starting import...',
      };
    }
    case 'import-resume': {
      return {
        importing: false,
        resumable: action.data,
      };
    }
    case 'import-resume-affirm': {
      if (!state.resumable) {
        return state;
      }
      const newState = resume(state.resumable);
      persist(newState);
      return newState;
    }
    case 'import-resume-cancel': {
      const newState = {
        importing: false,
      };
      persist(newState);
      return newState;
    }
  }
  if (!state.importing) {
    return state;
  }
  // Actions that require importing
  switch (action.type) {
    case 'import-started': {
      importMetadataNow(action.metadata);
      const imageMap: ImageMapState = {};
      _.forOwn(action.imageMap, (uri, name) => {
        imageMap[name] = { uri };
      });

      const newState = {
        ...state,
        imageMap,
        statusMessage: 'Importing pots...',
      };
      persist(newState);
      return newState;
    }
    /*case 'import-metadata-again': {
            if (state.statusMessage === 'Importing pots...') {
                importMetadata(action.metadata);
            }
            return state;
        }*/
    case 'imported-metadata': {
      let numImages = 0;
      let started = 0;
      const imageMap: ImageMapState = { ...state.imageMap };
      _.forOwn(imageMap, (data, name) => {
        // console.log("will import " + remoteUri);
        if (started < PARALLEL_IMAGE_IMPORTS) {
          importImage(data.uri);
          imageMap[name] = {
            uri: data.uri,
            started: true,
          };
          started += 1;
        }
        numImages += 1;
      });
      if (numImages === 0) {
        // Done already!
        setTimeout(() => store.dispatch({ type: 'page-list' }), 0);
        const newState = {
          importing: false,
        };
        persist(newState);
        return newState;
      }
      console.log('Scheduled ' + numImages + ' for import');
      const newState = {
        ...state,
        imageMap,
        totalImages: numImages,
        imagesImported: 0,
        statusMessage: `Importing images (0/${numImages})...`,
      };
      persist(newState);
      return newState;
    }
    case 'image-file-created': {
      if (!state.imageMap || state.imagesImported === undefined) {
        // Not even started importing images yet
        return state;
      }
      if (!state.imageMap[action.name]) {
        console.log("Skipping image that's already imported.");
        return state;
      }
      // console.log("Will check off this image.");
      const newState = { ...state, imageMap: { ...state.imageMap } };
      delete newState.imageMap[action.name];
      if (Object.keys(newState.imageMap).length === 0) {
        console.log('Import finished!');
        // Import finished!
        setTimeout(() => store.dispatch({ type: 'page-list' }), 0);
        const newState = {
          importing: false,
        };
        persist(newState);
        return newState;
      }
      let hasStartedOne = false;
      _.forOwn(newState.imageMap, (data, name) => {
        if (!hasStartedOne && !data.started) {
          hasStartedOne = true;
          newState.imageMap[name] = { ...data, started: true };
          importImage(data.uri);
        }
      });
      if (!hasStartedOne) {
        console.log('All the images have been scheduled.', newState.imageMap);
      }
      newState.imagesImported = (state.imagesImported || 0) + 1;
      newState.statusMessage = `Importing images (${newState.imagesImported}/${
        newState.totalImages
      })...`;
      // console.log(newState.statusMessage);
      persist(newState);
      return newState;
    }
    case 'image-file-failed': {
      if (!state.imageMap) {
        return state;
      }
      const name = nameFromUri(action.uri);
      if (state.imageMap[name]) {
        console.log('RETRYING IMAGE ' + name);
        importImage(action.uri);
      }
      return state;
    }
    case 'image-timeout': {
      if (!state.imageMap) {
        return state;
      }
      const name = nameFromUri(action.uri);
      if (name in state.imageMap) {
        // It must be restarted.
        console.log('Timed out on ' + name + ', restarting.');
        importImage(action.uri);
      }
      return state;
    }
    case 'import-cancel': {
      const newState = {
        importing: false,
      };
      persist(newState);
      return newState;
    }
    case 'import-failure': {
      const newState = {
        importing: false,
        statusMessage: 'Import failed.\n' + action.error,
      };
      persist(newState);
      return newState;
    }
    /*
        case 'page-settings': {
            const newState = {
                importing: false,
            };
            if (state.importing) {
                this.persist(newState);
            }
            return newState;
        }*/
    default:
      return state;
  }
}

/* initiate any actions to put the import back in progress, returns new state */
function resume(state: ImportStatePersisted): ImportState {
  if (!('imageMap' in state)) {
    return state;
  }
  const newState: ImportState = { ...state, imageMap: { ...state.imageMap } };
  delete newState.resumable;

  // Start any images that have the 'started' state, and count them
  let started = 0;
  const importable: string[] = [];
  _.forOwn(state.imageMap, (data: ImageMapValue, name) => {
    if (data.started) {
      importImage(data.uri);
      started += 1;
    } else {
      importable.push(name);
    }
  });

  // If we haven't started enough, start more and mark as started.
  for (let i = started; i < PARALLEL_IMAGE_IMPORTS; i++) {
    const name = importable[i - started];
    if (
      name &&
      state.imageMap &&
      newState.imageMap /* sure to be from above */
    ) {
      importImage(state.imageMap[name].uri);
      newState.imageMap[name].started = true;
    }
  }

  return newState;
}

async function persist(state: ImportStatePersisted) {
  if (!state.importing) {
    StorageWriter.delete(STORAGE_KEY);
    return;
  }
  StorageWriter.put(STORAGE_KEY, JSON.stringify(state));
}
