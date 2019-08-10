import * as FileSystem from 'expo-file-system';
import _ from 'lodash';
import store from '../reducers/store';
import { ImageState } from '../reducers/types';
import * as uploader from './uploader';

/**
 * Errors are always caught. Dispatches 'image-file-created' or 'image-file-failed'.
 */
export function deprecatedSaveToFileImpure(
  uri: string,
  isRemote = false,
): Promise<void> {
  return saveToFilePure(uri, isRemote)
    .then((fileUri) => {
      store.dispatch({
        type: 'image-file-created',
        name: nameFromUri(fileUri),
        fileUri,
      });
    })
    .catch((e) => {
      console.warn('saveToFile failure:', e);
      store.dispatch({ type: 'image-file-failed', uri });
    });
}

/** Promise is rejected on any failure to save the file */
export async function saveToFilePure(
  uri: string,
  isRemote = false,
): Promise<string> {
  if (!uri) {
    throw Error('No URI passed to saveToFile');
  }
  const name = nameFromUri(uri);
  const random = Math.floor(Math.random() * 1000000 + 1);
  if (FileSystem.documentDirectory == null) {
    // Should be impossible, just for typescript to know it's not null
    throw Error('No document directory');
  }
  const dir = FileSystem.documentDirectory + random;
  try {
    await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
  } catch (e) {
    const result = await FileSystem.getInfoAsync(dir);
    if (!result.exists) {
      throw Error('The directory was not created: ' + dir);
    }
    // Otherwise, we got an error but the directory was created, so we can continue
  }
  const fileUri = dir + '/' + name;
  if (isRemote) {
    await FileSystem.downloadAsync(uri, fileUri);
  } else {
    await FileSystem.copyAsync({ from: uri, to: fileUri });
  }
  return fileUri;
}

export function nameFromUri(uri: string): string {
  const uriParts = uri.split('/');
  const nameAndParam = uriParts[uriParts.length - 1];
  return nameAndParam.split('?')[0];
}

export async function deleteUnusedImage(image: ImageState) {
  if (image.remoteUri) {
    try {
      console.log('Deleting remote image: ', image.remoteUri);
      await uploader.remove(image.remoteUri);
    } catch (e) {
      console.warn('Failed to remove remote uri:', image.remoteUri);
      console.warn(e);
    }
  }
  if (image.fileUri) {
    try {
      console.log('Deleting file: ', image.fileUri);
      await FileSystem.deleteAsync(image.fileUri, { idempotent: true });
    } catch (e) {
      console.warn('Failed to delete unused image:', image.fileUri);
      console.warn(e);
    }
  }
}

export function resetDirectory(uri: string): string {
  const parts = uri.split('/');
  const fileName = parts[parts.length - 1];
  const maybeRandomDir = parts[parts.length - 2];
  let newDir = FileSystem.documentDirectory;
  if (newDir == null) {
    throw Error('FileSystem.documentDirectory is null');
  }
  if (!newDir.endsWith('/')) {
    newDir += '/';
  }
  if (/^\d+$/.test(maybeRandomDir)) {
    // that does look like a random dir, i.e. not part of the documentDirectory
    newDir += maybeRandomDir + '/';
  }
  return newDir + fileName;
}
