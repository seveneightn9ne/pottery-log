// @flow
import {ReduceStore} from 'flux/utils';
import dispatcher from '../AppDispatcher.js';
import {startExport, exportImage, finishExport, saveExport, startImport, importImage, importMetadata } from '../export.js';
import { ImageStore, nameFromUri } from './ImageStore.js';
import { Linking } from 'react-native';
import * as _ from 'lodash';

interface ExportState {
  exporting: boolean,
  exportId: ?number,
  exportingImages: ?boolean,
  //awaitingFile: ?number,
  imagesExported: ?number,
  totalImages: ?number,
  statusMessage: ?string,
  exportUri: ?string,

  importing: boolean,
  imageMap: ?any, // {[k: string]: string}
  imagesImported: ?number,
}

class ExportStore extends ReduceStore<ExportState> {
  constructor() {
    super(dispatcher);
  }
  getInitialState(): ExportState {
    return {exporting: false, importing: false};
  }

  reduce(state: ExportState, action: Object): ExportState {
    //console.log("will check: " + action.type);
    switch (action.type) {
        case 'export-initiate': {
            const id = Date.now();
            startExport(id);
            return {
                exporting: true,
                importing: false,
                exportId: id,
                statusMessage: 'Starting export...',
            };
        }
        case 'export-failure': {
            if (action.id != state.exportId) {
                return state;
            }
            return {
                exporting: false,
                importing: false,
                statusMessage: 'Export failed.\n' + action.error,
            }
        }
        case 'page-list': {
            return {
                exporting: false,
                importing: false,
            }
        }
        case 'export-started': {
            if (!state.exporting || state.exportId != action.id) {
                return state;
            }
            const {images} = ImageStore.getState();
            let totalImages = 0;
            let awaitingFile = 0;
            _.forOwn(images, imageState => {
               const willExport = exportImage(state.exportId, imageState);
               if (willExport) {
                   totalImages += 1;
               } else {
                   awaitingFile += 1;
               }
            });
            return {
                ...state,
                exportingImages: true,
                imagesExported: 0,
                totalImages: totalImages,
                //awaitingFile: awaitingFile,
                statusMessage: `Exporting images (0/${totalImages})...`,
            }
        }
        case 'image-file-created': {
            //console.log('IFC debug', state);
            if (state.importing && state.imageMap[action.name]) {
                //console.log("Will check off this image.");
                const newState = {...state, imageMap: {...state.imageMap}};
                delete newState.imageMap[action.name];
                if (Object.keys(newState.imageMap).length == 0) {
                    console.log("Import finished!");
                    // Import finished!
                    setTimeout(() => dispatcher.dispatch({type: 'page-list'}), 0);
                    return {
                        importing: false,
                        exporting: false,
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
                if(!hasStartedOne) {console.log("All the images have been scheduled.", newState.imageMap);}
                newState.imagesImported += 1;
                newState.statusMessage = `Importing images (${newState.imagesImported}/${newState.totalImages})...`;
                //console.log(newState.statusMessage);
                return newState;
            }
            console.log("Not importing this.");
            if (!state.exportingImages) {
                return state;
            }
            //const awaitingFile = state.awaitingFile - 1;
            const totalImages = state.totalImages + 1;
            exportImage(state.exportId, {fileUri: action.fileUri});
            return {
                ...state,
                totalImages: totalImages,
                //awaitingFile: awaitingFile,
                statusMessage: `Exporting images (${state.imagesExported}/${totalImages})...`,

            }
        }
        /*case 'image-file-failure': {
            if (!state.exportingImages) {
                return state;
            }
            return {
                ...state,
                awaitingFile: state.awaitingFile - 1,
            }
        }*/
        case 'image-file-failed': {
            if (!state.importing) {
                return state;
            }
            const name = nameFromUri(action.uri);
            if (state.imageMap[name]) {
                console.log("RETRYING IMAGE " + name);
                importImage(action.uri);
            }
            return state;
        }
        case 'export-image': {
            if (!state.exportingImages || state.exportId != action.id) {
                return state;
            }
            const newState = {
                ...state,
                imagesExported: state.imagesExported + 1,
                statusMessage: `Exporting images (${state.imagesExported + 1}/${state.totalImages})...`,
            };
            if (newState.imagesExported >= state.totalImages /*&& state.awaitingFile <= 0*/) {
                newState.statusMessage = 'Finishing export...'
                finishExport(state.exportId);
            }
            return newState;
        }
        case 'export-finished': {
            if (state.exportId != action.id) {
                return state;
            }
            // Linking.openURL(action.uri);
      
            return {
                ...state,
                statusMessage: 'Export finished!',
                exportUri: action.uri,
            }
        }
        case 'import-initiate': {
            startImport();
            return {
                ...state,
                exporting: false,
                importing: true,
                statusMessage: 'Starting import...',
            }
        }
        case 'import-started': {
            if (!state.importing) {
                return state;
            }
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
            if (!state.importing) {
                return state;
            }
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
        case 'image-timeout': {
            if (!state.importing) {
                return state;
            }
            const name = nameFromUri(action.uri);
            if (name in state.imageMap) {
                // It must be restarted.
                console.log("Timed out on " + name + ", restarting.");
                importImage(action.uri);
            }
            return state;
        }
        case 'import-cancel': {
            if (!state.importing) {
                return state;
            }
            return {
                importing: false,
                exporting: false,
            };
        }
        case 'import-failure': {
            return {
                exporting: false,
                importing: false,
                statusMessage: 'Import failed.\n' + action.error,
            }
        }
        default:
            return state;
    }
  }
}

export default new ExportStore();
