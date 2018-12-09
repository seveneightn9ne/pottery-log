// @flow
import {ReduceStore} from 'flux/utils';
import dispatcher from '../AppDispatcher.js';
import {startExport, exportImage, finishExport, saveExport} from '../export.js';
import { ImageStore } from './ImageStore.js';
import * as _ from 'lodash';

interface ExportState {
  exporting: boolean,
  exportingImages: ?boolean,
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
    switch (action.type) {
        case 'export-initiate': {
            startExport();
            return {
                exporting: true,
                statusMessage: 'Starting export...',
            };
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
        case 'export-started': {
            if (!state.exporting) {
                return state;
            }
            const {images} = ImageStore.getState();
            let totalImages = 0;
            _.forOwn(images, imageState => {
               const willExport = exportImage(imageState);
               if (willExport) {
                   totalImages += 1;
               }
            });
            return {
                exporting: true,
                exportingImages: true,
                imagesExported: 0,
                totalImages: totalImages,
                statusMessage: 'Exporting images...',
            }
        }
        case 'image-file-created': {
            if (!state.exportingImages) {
                return state;
            }
            exportImage({fileUri: action.fileUri});
            return {
                ...state,
                totalImages: state.totalImages + 1,
            }
        }
        case 'export-image': {
            if (!state.exportingImages) {
                return state;
            }
            const newState = {
                ...state,
                imagesExported: state.imagesExported + 1,
            };
            if (newState.imagesExported >= state.totalImages) {
                newState.statusMessage = 'Finishing export...'
                finishExport();
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
        default:
            return state;
    }
  }
}

export default new ExportStore();
