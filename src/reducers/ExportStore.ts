import _ from 'lodash';
import { Action } from '../action';
import { exportImage, finishExport, startExport } from '../utils/exports';
// import { debug } from '../utils/uploader';
import { ExportState, FullState } from './types';

export function getInitialState(): ExportState {
  return { exporting: false };
}

export function reduceExport(
  state: ExportState = getInitialState(),
  action: Action,
  fullState: FullState,
): ExportState {
  // console.log("will check: " + action.type);
  if (action.type === 'export-initiate') {
    const id = Date.now();
    startExport(id, fullState.images.images);
    return {
      exporting: true,
      exportId: id,
      statusMessage: 'Starting export...',
    };
  }

  if (action.type === 'page-list') {
    return getInitialState();
  }
  if (action.type === 'page-settings') {
    // Make sure it's re-initialized when you navigate here
    return getInitialState();
  }
  if (
    !state.exporting ||
    ('exportId' in action && action.exportId !== state.exportId)
  ) {
    return state;
  }
  switch (action.type) {
    case 'export-started': {
      let totalImages = 0;
      // let awaitingFile = 0;
      _.forOwn(action.images, (imageState) => {
        const { willExport } = exportImage(state.exportId, imageState);
        if (willExport) {
          totalImages += 1;
        } else {
          // awaitingFile += 1;
        }
      });
      if (totalImages > 0) {
        return {
          ...state,
          exportingImages: true,
          imagesExported: 0,
          totalImages,
          // awaitingFile: awaitingFile,
          statusMessage: `Exporting images (0/${totalImages})...`,
        };
      } else {
        // No images, export is finished
        // TODO: some may be awaitingFile
        finishExport(state.exportId);
        return {
          ...state,
          imagesExported: 0,
          totalImages: 0,
          statusMessage: 'Finishing export...',
        };
      }
    }
    case 'image-file-created': {
      if (!('exportingImages' in state)) {
        return state;
      }
      // const awaitingFile = state.awaitingFile - 1;
      const totalImages = state.totalImages + 1;
      exportImage(state.exportId, { fileUri: action.fileUri });
      return {
        ...state,
        totalImages,
        // awaitingFile: awaitingFile,
        statusMessage: `Exporting images (${
          state.imagesExported
        }/${totalImages})...`,
      };
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
      if (!('exportingImages' in state)) {
        return state;
      }
      const newState = {
        ...state,
        imagesExported: state.imagesExported + 1,
        statusMessage: `Exporting images (${state.imagesExported + 1}/${
          state.totalImages
        })...`,
      };
      if (
        newState.imagesExported >=
        state.totalImages /*&& state.awaitingFile <= 0*/
      ) {
        newState.statusMessage = 'Finishing export...';
        delete newState.exportingImages;
        finishExport(state.exportId);
      }
      return newState;
    }
    case 'export-image-failure': {
      // uploader.debug
      return {
        exporting: false,
        statusMessage: 'Export failed.\n' + action.reason,
      };
    }
    case 'export-finished': {
      return {
        exporting: false,
        statusMessage: 'Export finished!',
        exportUri: action.uri,
      };
    }
    case 'export-failure': {
      return {
        exporting: false,
        statusMessage: 'Export failed.\n' + action.error,
      };
    }
    default:
      return state;
  }
}
