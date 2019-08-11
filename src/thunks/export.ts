import { FileSystem } from 'expo';
import _ from 'lodash';
import { AsyncStorage } from 'react-native';
import { Action } from '../action';
import { FullState, ImageState } from '../reducers/types';
import { keyIsExportable } from '../utils/exports';
import { saveToFilePure } from '../utils/imageutils';
import * as uploader from '../utils/uploader';
import { PLThunkAction, PLThunkDispatch, t } from './types';

export function exportEverything(): PLThunkAction {
  return t(
    'exportEverything',
    {},
    async (dispatch: PLThunkDispatch, getState: () => FullState) => {
      const id = Date.now();
      try {
        // export-initiate

        dispatch(status(id, 'Starting export...'));

        const metadata = await getExportMetadata();
        if (!isStillExporting(id, getState)) {
          return;
        }

        const images = getState().images.images;
        await uploader.startExport(id, metadata, images);
        if (!isStillExporting(id, getState)) {
          return;
        }

        // export-started

        const { imagesToExport, imagesToSave } = prepareImages(images);

        if (imagesToSave.length > 0) {
          dispatch(status(id, `Saving ${imagesToSave.length} images...`));
        }

        // Save all yet-unsaved images & add to imagesToExport
        await Promise.all(
          imagesToSave.map(async (i) => {
            let fileUri;
            if (i.remoteUri) {
              fileUri = await saveToFilePure(i.remoteUri, true /* isRemote */);
            } else if (i.localUri) {
              fileUri = await saveToFilePure(i.localUri, false /* isRemote */);
            } else {
              console.log('Cannot export image with no URI ', i);
              return;
            }
            imagesToExport.push({
              ...i,
              fileUri,
            });
          }),
        );
        if (!isStillExporting(id, getState)) {
          return;
        }

        // Now imagesToExport has all the images
        const totalImages = imagesToExport.length;

        if (totalImages === 0) {
          await finish(dispatch, id);
          return;
        }

        dispatch(status(id, `Exporting images (0/${totalImages})...`));

        // export-image
        let imagesExported = 0;

        const promises = imagesToExport.map((image) =>
          exportImage(image)
            .then(() => {
              imagesExported += 1;
              dispatch(
                status(
                  id,
                  `Exporting images (${imagesExported}/${totalImages})...`,
                ),
              );
            })
            .catch((e: Error) => fail(dispatch, id)(e.message)),
        );

        await Promise.all(promises);
        if (!isStillExporting(id, getState)) {
          return;
        }

        if (imagesExported !== totalImages) {
          uploader.debug('images-exported-partial', {
            imagesExported,
            totalImages,
          });
          fail(dispatch, id)('Some images failed to export');
        }

        await finish(dispatch, id);
      } catch (e) {
        fail(dispatch, id)(e);
      }
    },
  );
}

async function finish(dispatch: PLThunkDispatch, id: number) {
  dispatch(status(id, 'Finishing export...'));
  const uri = await uploader.finishExport(id);
  dispatch({
    type: 'export-finished',
    exportId: id,
    uri,
  });
}

function fail(dispatch: PLThunkDispatch, id: number) {
  return (e: string | Error) => {
    dispatch({
      type: 'export-status',
      exporting: false,
      exportId: id,
      status: 'Export failed.\n' + e,
    });
  };
}

async function exportImage(image: ImageState) {
  if (!image.fileUri) {
    return;
  }
  const info = await FileSystem.getInfoAsync(image.fileUri);
  if (info.exists) {
    return uploader.exportImage(image.fileUri);
  } else {
    throw new Error('Image file does not exist');
  }
}

const status = (id: number, statusText: string): Action => {
  return {
    type: 'export-status',
    exportId: id,
    exporting: true,
    status: statusText,
  };
};

const prepareImages = (images: { [name: string]: ImageState }) => {
  const imagesToExport: ImageState[] = [];
  const imagesToSave: ImageState[] = [];
  _.forOwn(images, (imageState) => {
    if (imageState.fileUri) {
      imagesToExport.push(imageState);
    } else {
      imagesToSave.push(imageState);
    }
  });
  return { imagesToExport, imagesToSave };
};

const isStillExporting = (exportId: number, getState: () => FullState) => {
  const state = getState();
  return (
    state && state.exports.exporting && state.exports.exportId === exportId
  );
};

async function getExportMetadata() {
  const allKeys = (await AsyncStorage.getAllKeys()).filter(keyIsExportable);
  const pairs = await AsyncStorage.multiGet(allKeys);
  const snapshot: { [key: string]: string } = {};
  pairs.forEach((pair) => {
    snapshot[pair[0]] = pair[1];
  });
  return snapshot;
}
