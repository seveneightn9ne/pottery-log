import _ from 'lodash';
import { AsyncStorage } from 'react-native';
import { ImageStoreState } from '../reducers/types';
import { saveToFile } from './images';
import { PLThunkDispatch } from './types';

export default async function loadInitialImages(): Promise<ImageStoreState> {
  const json = await AsyncStorage.getItem('@ImageStore');

  if (!json) {
    console.log('There was no ImageStore to load.');
    return { images: {}, loaded: true };
  }
  // Don't catch this because we would rather throw to see wtf happened here
  const parsed = JSON.parse(json);
  return { images: parsed.images || {}, loaded: true };
}

export async function saveImagesToFiles(
  dispatch: PLThunkDispatch,
  images: ImageStoreState,
): Promise<void[]> {
  const promises: Array<Promise<void>> = [];
  _.forOwn(images.images, async (image) => {
    if (image.fileUri) {
      return;
    }
    if (image.remoteUri) {
      promises.push(dispatch(saveToFile(image.remoteUri, true /* isRemote */)));
      return;
    }
    if (image.localUri) {
      promises.push(dispatch(saveToFile(image.localUri, false /* isRemote */)));
    }
  });
  return Promise.all(promises);
}
