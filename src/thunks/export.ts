import _ from 'lodash';
import { FullState, ImageState } from '../reducers/types';
import {
  exportImage,
  getExportMetadata,
  isStillExporting,
  status,
} from '../utils/exports';
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
        await uploader.startExport(metadata);
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
        let fails = 0;

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
            .catch((e: Error) => {
              fails += 1;
              console.warn(e);
              fail(dispatch, id)(`Failed to export an image: ${e.message}\nPlease try again.`))
            },
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
          if (imagesExported + fails < totalImages) {
            // If they do add up, fail() has already been called with a better error message
            fail(dispatch, id)('Some images failed to export. Please try again.');
          }
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
  const uri = await uploader.finishExport();
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

const prepareImages = (images: { [name: string]: ImageState }) => {
  const imagesToExport: ImageState[] = [];
  const imagesToSave: ImageState[] = [];
  _.forOwn(images, (imageState) => {
    if (imageState.fileUri) {
      imagesToExport.push(imageState);
    } else if (imageState.localUri || imageState.remoteUri) {
      imagesToSave.push(imageState);
    } else {
      console.log('Cannot export image with no URI ', imageState);
    }
  });
  return { imagesToExport, imagesToSave };
};
