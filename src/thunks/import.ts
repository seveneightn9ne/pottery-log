import * as DocumentPicker from 'expo-document-picker';
import _ from 'lodash';
import { Action } from '../action';
import { FullState, ImageMapState } from '../reducers/types';
import {
  confirmImport,
  importImageRetrying,
  importMetadataNow,
} from '../utils/imports';
import * as uploader from '../utils/uploader';
import { reloadFromImport } from './loadInitial';
import { PLThunkAction, PLThunkDispatch, t } from './types';

export const PARALLEL_IMAGE_IMPORTS = 2; // Down from 3 to prevent OOM

export function importFromFile(): PLThunkAction {
  return t(
    'importFromFile',
    {},
    async (dispatch: PLThunkDispatch, getState: () => FullState) => {
      try {
        dispatch(status('Starting import...'));

        const docResult = await DocumentPicker.getDocumentAsync();
        if (docResult.type === 'cancel' || !docResult.uri) {
            dispatch(cancel());
            return;
        }

        const {metadata, imageMap} = await uploader.startFileImport(docResult.uri);

        await confirmImport(
          // onConfirm
          () => doImport(dispatch, getState, metadata, imageMap),
          // onCancel
          async () => dispatch(cancel()),
        );
      } catch (error) {
          dispatch(fail(error));
      }
    },
  );
}

export function importFromUrl(url: string): PLThunkAction {
  return t(
    'importFromUrl',
    { url },
    async (dispatch: PLThunkDispatch, getState: () => FullState) => {
      try {
        dispatch(status('Starting import...'));
        const {metadata, imageMap} = await uploader.startUrlImport(url);

        await confirmImport(
          // onConfirm
          () => doImport(dispatch, getState, metadata, imageMap),
          // onCancel
          async () => dispatch(cancel()),
        );
      } catch (error) {
        dispatch(fail(error));
      }
    });
  }

export function resumeImport(): PLThunkAction {
  return t('resumeImport', {}, async (dispatch: PLThunkDispatch, getState: () => FullState) => {
    dispatch({type: 'import-resume-affirm'});
    const { resumable } = getState().imports;
    if (!resumable || !resumable.imageMap) {
      return;
    }
    // None of the images are started - if they were, they certainly aren't now
    // Note this is also deep cloning
    const imageMap: ImageMapState = _.mapValues(resumable.imageMap, (v) => ({
      ...v,
      started: undefined,
    }));

    try {
      await importImages(dispatch, getState, imageMap);
      dispatch(finish());
      dispatch({type: 'page-list'});
    } catch (error) {
      dispatch(fail(error));
    }
  });
}

/**
 * Called as the callback to confirmImport
 */
async function doImport(
  dispatch: PLThunkDispatch,
  getState: () => FullState,
  metadata: string,
  imageMap: ImageMapState,
) {
  dispatch(status('Importing pots...', _.cloneDeep(imageMap)));

  // Saves metadata to AsyncStorage
  await importMetadataNow(metadata);

  // Loads AsyncStorage into memory
  await dispatch(reloadFromImport());

  // Saves images to local storage
  await importImages(dispatch, getState, _.cloneDeep(imageMap));

  dispatch(finish());
  dispatch({type: 'page-list'});
}

async function importImages(dispatch: PLThunkDispatch, getState: () => FullState, imageMap: ImageMapState) {
  const numImages = Object.keys(imageMap).length;
  if (numImages === 0) {
    return;
  }
  dispatch(status(`Importing images (0/${numImages})`, _.cloneDeep(imageMap)));
  let finished = 0;
  const promises: Array<Promise<void>> = [];
  const onFinishOne = (imageName: string, fileUri: string) => {
      finished += 1;
      if (fileUri) {
        // fileUri might not exist if this worker was circumvented by another one with the same image
        dispatch({
          type: 'image-file-created',
          name: imageName,
          fileUri: fileUri,
        });
        dispatch(status(`Importing images (${finished}/${numImages})`, _.cloneDeep(imageMap)));
      }
  };
  _.times(PARALLEL_IMAGE_IMPORTS, () => {
      // importImageWorkers all share the same copy of imageMap for coordination
      // They also have to use the same copy referenced in onFinishOne so that we save updated state
      promises.push(importImageWorker(getState, imageMap, onFinishOne));
  });
  await Promise.all(promises);
}

async function importImageWorker(getState: () => FullState, imageMap: ImageMapState, onFinishOne: (imageName: string, fileUri: string) => void) {
    const imagesToStart = Object.keys(imageMap).sort().filter( // sort makes it deterministic for tests
        (n) => !imageMap[n].started,
    );
    if (imagesToStart.length === 0) {
        return;
    }
    const imageName = imagesToStart[0];
    const image = imageMap[imageName];
    image.started = true; // "started" doesn't have to be persisted so no need to dispatch status here

    const fileUri = await importImageRetrying(image.uri, getState);

    delete imageMap[imageName];
    onFinishOne(imageName, fileUri);

    await importImageWorker(getState, imageMap, onFinishOne);
}

function finish(): Action {
  return {
      type: 'import-status',
      importing: false,
      statusMessage: 'Finished import.',
  };
}

function cancel(): Action {
  return {
    type: 'import-status',
    importing: false,
    statusMessage: 'Cancelled import.',
  };
}

function fail(e: string | Error): Action {
    return {
        type: 'import-status',
        importing: false,
        statusMessage: 'Import failed.\n' + e,
    };
}

function status(statusMessage: string, imageMap?: ImageMapState): Action {
    return {
        type: 'import-status',
        importing: true,
        statusMessage,
        imageMap,
    };
}
