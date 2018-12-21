// @flow
import {ReduceStore} from 'flux/utils';
import dispatcher from '../AppDispatcher';
import { startImport, importImage, importMetadata } from '../export.ts';
import { ImageStore, nameFromUri } from './ImageStore';
import { Linking } from 'react-native';
import * as _ from 'lodash';

interface ImportState {
  importing: boolean,
  totalImages?: number,
  statusMessage?: string,
  imageMap: ?any, // {[k: string]: string}
  imagesImported?: number,
}

class ImportStore extends ReduceStore<ImportState> {
  constructor() {
    super(dispatcher);
  }
  getInitialState(): ImportState {
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

  reduce(state: ImportState, action: Object): ImportState {
    if (action.type == 'import-initiate') {
        startImport();
        return {
            importing: true,
            statusMessage: 'Starting import...',
        }
    }
    if (!state.importing) {
        return state;
    }
    switch (action.type) {
        case 'import-started': {
            importMetadata(action.metadata);
            const imageMap = {};
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
            const imageMap = {...state.imageMap};
            _.forOwn(state.imageMap, (data, name) => {
                //console.log("will import " + remoteUri);
                if (started < 3) {
                    importImage(data.uri);
                    imageMap[name] = {
                        uri: data.uri,
                        started: true,
                    }
                    started += 1;
                }
                numImages += 1;
            });
            console.log("Scheduled " + numImages + " for import");
            return {
                ...state,
                imageMap,
                totalImages: numImages,
                imagesImported: 0,
                statusMessage: `Importing images (0/${numImages})...`,
            };
        }
        case 'image-file-created': {
            if (!state.imageMap[action.name]) {
                console.log("Skipping image that's already imported.");
                return state;
            }
            //console.log("Will check off this image.");
            const newState = {...state, imageMap: {...state.imageMap}};
            delete newState.imageMap[action.name];
            if (Object.keys(newState.imageMap).length == 0) {
                console.log("Import finished!");
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
                console.log("All the images have been scheduled.", newState.imageMap);
            }
            newState.imagesImported += 1;
            newState.statusMessage = `Importing images (${newState.imagesImported}/${newState.totalImages})...`;
            //console.log(newState.statusMessage);
            return newState;
        }
        case 'image-file-failed': {
            const name = nameFromUri(action.uri);
            if (state.imageMap[name]) {
                console.log("RETRYING IMAGE " + name);
                importImage(action.uri);
            }
            return state;
        }
        case 'image-timeout': {
            const name = nameFromUri(action.uri);
            if (name in state.imageMap) {
                // It must be restarted.
                console.log("Timed out on " + name + ", restarting.");
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
            }
        }
        case 'page-list': {
            return {
                importing: false,
            }
        }
        default:
            return state;
    }
  }
}

export default new ImportStore();
