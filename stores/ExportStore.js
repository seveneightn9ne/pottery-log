// @flow
import {ReduceStore} from 'flux/utils';
import dispatcher from '../AppDispatcher.js';
import {startExport, exportImage, finishExport, saveExport, startImport, importImage, importMetadata } from '../export.js';
import { ImageStore } from './ImageStore.js';
import { Linking } from 'react-native';
import * as _ from 'lodash';

interface ExportState {
  exporting: boolean,
  exportId: ?number,
  exportingImages: ?boolean,
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
            _.forOwn(images, imageState => {
               const willExport = exportImage(state.exportId, imageState);
               if (willExport) {
                   totalImages += 1;
               }
            });
            return {
                ...state,
                exportingImages: true,
                imagesExported: 0,
                totalImages: totalImages,
                statusMessage: `Exporting images (0/${totalImages})...`,
            }
        }
        case 'image-file-created': {
            if (state.importing) {
                const newState = {...state, imageMap: {...state.imageMap}};
                delete newState.imageMap[action.name];
                if (Object.keys(newState.imageMap).length == 0) {
                    // Import finished!
                    setTimeout(() => dispatcher.dispatch({type: 'page-list'}), 0);
                    return {
                        importing: false,
                        exporting: false,
                    };
                }
                newState.imagesImported += 1;
                newState.statusMessage = `Importing images (${newState.imagesImported}/${newState.totalImages})...`;
                return newState;
            }
            if (!state.exportingImages || state.exportId != action.id) {
                return state;
            }
            exportImage(state.exportId, {fileUri: action.fileUri});
            return {
                ...state,
                totalImages: state.totalImages + 1,
                statusMessage: `Exporting images (${state.imagesExported}/${state.totalImages + 1})...`,

            }
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
            if (newState.imagesExported >= state.totalImages) {
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

            return {
                ...state,
                imageMap: action.imageMap,
                statusMessage: 'Importing pots...',
            };
        }
        case 'imported-metadata': {
            if (!state.importing) {
                return state;
            }
            let numImages = 0;
            _.forOwn(state.imageMap, (remoteUri, name) => {
                importImage(remoteUri);
                numImages += 1;
            });
            return {
                ...state,
                totalImages: numImages,
                imagesImported: 0,
                statusMessage: `Importing images (0/${numImages})...`,
            };
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
