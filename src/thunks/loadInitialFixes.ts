import _ from 'lodash';
import { Image2 } from '../models/Pot';
import { ImageStoreState, PotsStoreState } from '../reducers/types';
import * as imageutils from '../utils/imageutils';

export function fixPotsAndImages(
  pots: PotsStoreState,
  images: ImageStoreState,
): { pots: PotsStoreState; images: ImageStoreState } {
  // Delete images with no URIs
  images = deleteImagesWithNoUri(images);

  // Make images refer to the pots they're used by
  // Delete images that aren't referenced by any pots
  // Including delete file/remote
  images = fixImagesPotListsAndDeleteUnused(images, pots);

  // Remove pot references to images that don't exist
  pots = removeBrokenImageRefs(pots, images);

  return { pots, images };
}

function deleteImagesWithNoUri(images: ImageStoreState): ImageStoreState {
  const toDelete: string[] = [];
  _.forOwn(images.images, (image) => {
    if (!image.remoteUri && !image.fileUri && !image.localUri) {
      toDelete.push(image.name);
    }
  });
  if (toDelete.length) {
    console.log('Deleting images with no uri: ', toDelete);
  }
  const newImages = { ...images, images: { ...images.images } };
  toDelete.forEach((imageName) => delete newImages.images[imageName]);
  return newImages;
}

function fixImagesPotListsAndDeleteUnused(
  images: ImageStoreState,
  pots: PotsStoreState,
): ImageStoreState {
  const newState = { ...images, images: { ...images.images } };
  _.forOwn(images.images, (image) => {
    const newImage = { ...image };
    newImage.pots = potsUsingImage(image.name, pots);
    if (newImage.pots.length === 0) {
      // No pots are using the image
      console.log('Deleting unused image: ', image.name);
      imageutils.deleteUnusedImage(newImage);
      delete newState.images[image.name];
    } else {
      newState.images[image.name] = newImage;
    }
  });
  return newState;
}

function removeBrokenImageRefs(
  pots: PotsStoreState,
  images: ImageStoreState,
): PotsStoreState {
  const newPots = { ...pots, pots: { ...pots.pots } };
  _.forOwn(pots.pots, (pot) => {
    const newImages3 = [...pot.images3];
    _.remove(newImages3, (img) => !images.images[img]);
    newPots.pots[pot.uuid] = { ...pots.pots[pot.uuid], images3: newImages3 };
  });
  return newPots;
}

function potsUsingImage(image: string, potState: PotsStoreState): string[] {
  if (!potState.hasLoaded) {
    throw new Error('Cannot call potsUsingImage before pot store loaded');
  }
  const potsUsingImage: string[] = [];
  _.values(potState.pots).map((pot) => {
    pot.images3.forEach((img: string) => {
      if (img === image) {
        potsUsingImage.push(pot.uuid);
      }
    });
  });
  return potsUsingImage;
}

export function migrateFromImages2(
  state: ImageStoreState,
  image: Image2,
  potId: string,
): ImageStoreState {
  const newState = { loaded: true, images: { ...state.images } };
  const name = imageutils.nameFromUri(image.localUri);

  if (newState.images[name]) {
    // This image exists for another pot already
    if (newState.images[name].pots.indexOf(potId) === -1) {
      console.log(
        'images2-3 migration: adding a pot to the existing image: ',
        name,
        potId,
      );
      newState.images[name] = {
        ...newState.images[name],
        pots: [...newState.images[name].pots, potId],
      };
    } else {
      console.log(
        'images2-3 migration: doing nothing for this image because it exists already: ',
        name,
      );
    }
  } else {
    console.log('images2-3 migration: Adding a new image: ', name);
    // New image
    newState.images[name] = {
      ...image,
      name,
      pots: [potId],
    };
  }

  return newState;
}
