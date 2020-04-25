import store from '../reducers/store';
import {nameFromUri, saveToFilePure} from './imageutils';

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
