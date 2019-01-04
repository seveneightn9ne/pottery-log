import {ReduceStore} from 'flux/utils';
import _ from 'lodash';
import { Action } from '../action';
import dispatcher from '../AppDispatcher';
import { importImage, importMetadata, startImport } from '../utils/exports';
import { nameFromUri } from '../utils/imageutils';

interface ImageMapState {[name: string]: {uri: string; started?: true}; }
export interface ImportState {
  importing: boolean;
  totalImages?: number;
  statusMessage?: string;
  imageMap?: ImageMapState;
  imagesImported?: number;
}

class ImportStore extends ReduceStore<ImportState, Action> {
  constructor() {
    super(dispatcher);
  }
  public getInitialState(): ImportState {
    return {importing: false};
  }

  /**
   * Import flow:
   * Button press
   * -> 'import-initiate'
   * -> choose a file
   * -> upload file
   * -> 'import-started'
   * -> confirmation popup
   * -> set metadata
   * -> 'imported-metadata'
   * -> saveToFile x3
   *   -> 'image-file-created'
   *     -> saveToFile x1
   *     -> no more? 'page-list'
   *   -> 'image-timeout'
   *     -> retry saveToFile
   */

  public reduce(state: ImportState, action: Action): ImportState {
    if (action.type === 'import-initiate') {
        startImport();
        return {
            importing: true,
            statusMessage: 'Starting import...',
        };
    }
    if (!state.importing) {
        return state;
    }
    switch (action.type) {
        case 'import-started': {
            importMetadata(action.metadata);
            const imageMap: ImageMapState = {};
            _.forOwn(action.imageMap, (uri, name) => {
                imageMap[name] = {uri};
            });

            return {
                ...state,
                imageMap,
                statusMessage: 'Importing pots...',
            };
        }
        case 'imported-metadata': {
            let numImages = 0;
            let started = 0;
            const imageMap: ImageMapState = {...state.imageMap};
            _.forOwn(imageMap, (data, name) => {
                // console.log("will import " + remoteUri);
                if (started < 3) {
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
                setTimeout(() => dispatcher.dispatch({type: 'page-list'}), 0);
                return {
                    importing: false,
                };
            }
            console.log('Scheduled ' + numImages + ' for import');
            return {
                ...state,
                imageMap,
                totalImages: numImages,
                imagesImported: 0,
                statusMessage: `Importing images (0/${numImages})...`,
            };
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
            const newState = {...state, imageMap: {...state.imageMap}};
            delete newState.imageMap[action.name];
            if (Object.keys(newState.imageMap).length === 0) {
                console.log('Import finished!');
                // Import finished!
                setTimeout(() => dispatcher.dispatch({type: 'page-list'}), 0);
                return {
                    importing: false,
                };
            }
            let hasStartedOne = false;
            _.forOwn(newState.imageMap, (data, name) => {
                if (!hasStartedOne && !data.started) {
                    hasStartedOne = true;
                    newState.imageMap[name] = {...data, started: true};
                    importImage(data.uri);
                }
            });
            if (!hasStartedOne) {
                console.log('All the images have been scheduled.', newState.imageMap);
            }
            newState.imagesImported = (state.imagesImported || 0) + 1;
            newState.statusMessage = `Importing images (${newState.imagesImported}/${newState.totalImages})...`;
            // console.log(newState.statusMessage);
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
            return {
                importing: false,
            };
        }
        case 'import-failure': {
            return {
                importing: false,
                statusMessage: 'Import failed.\n' + action.error,
            };
        }
        case 'page-settings': {
            return {
                importing: false,
            };
        }
        default:
            return state;
    }
  }
}

export default new ImportStore();
