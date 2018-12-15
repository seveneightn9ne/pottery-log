// @flow
import {ReduceStore} from 'flux/utils';
import dispatcher from '../AppDispatcher.js';
import {startExport, exportImage, finishExport, saveExport } from '../export.js';
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
}

class ExportStore extends ReduceStore<ExportState> {
  constructor() {
    super(dispatcher);
  }
  getInitialState(): ExportState {
    return {exporting: false};
  }

  reduce(state: ExportState, action: Object): ExportState {
    //console.log("will check: " + action.type);
    if (action.type == 'export-initiate') {
        const id = Date.now();
        startExport(id);
        return {
            exporting: true,
            importing: false,
            exportId: id,
            statusMessage: 'Starting export...',
        };
    }
    if (!state.exporting || (action.exportId && action.exportId != state.exportId)) {
        return state;
    }
    switch (action.type) {
        case 'export-started': {
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
        case 'export-image': {
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
            return {
                ...state,
                statusMessage: 'Export finished!',
                exportUri: action.uri,
            }
        }
        case 'export-failure': {
            return {
                exporting: false,
                statusMessage: 'Export failed.\n' + action.error,
            }
        }
        case 'page-list': {
            return {
                exporting: false,
            }
        }
        default:
            return state;
    }
  }
}

export default new ExportStore();
