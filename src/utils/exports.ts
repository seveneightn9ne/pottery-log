import { DocumentPicker } from 'expo';
import { Alert, AsyncStorage } from 'react-native';
import { ImageState } from '../action';
import dispatcher from '../AppDispatcher';
import { saveToFile } from './imageutils';
import * as uploader from './uploader';

async function getExportMetadata() {
  const allKeys = await AsyncStorage.getAllKeys();
  const pairs = await AsyncStorage.multiGet(allKeys);
  const snapshot: { [key: string]: string } = {};
  pairs.forEach((pair) => {
    snapshot[pair[0]] = pair[1];
  });
  return snapshot;
}

async function startExport(id: number) {
  const metadata = await getExportMetadata();
  uploader.startExport(id, metadata);
}

function exportImage(id: number, imageState: Partial<ImageState>) {
  if (!imageState.fileUri) {
    const uri = imageState.remoteUri || imageState.localUri;
    const isRemote = uri === imageState.remoteUri;
    if (uri) {
      saveToFile(uri, isRemote);
    }
    return false;
  }
  uploader.exportImage(id, imageState.fileUri);
  return true;
}

async function finishExport(id: number) {
  return uploader.finishExport(id);
}

async function startImport() {
  const docResult = await DocumentPicker.getDocumentAsync();
  if (docResult.type === 'success') {
    return uploader.startImport(docResult.uri);
  } else if (docResult.type === 'cancel') {
    dispatcher.dispatch({ type: 'import-cancel' });
  }
}

async function startUrlImport(url: string) {
  return uploader.startUrlImport(url);
}

/**
 * Dispatches:
 *  'import-cancel' if the user declines the import.
 *  'imported-metadata' after the metadata has been imported.
 *  'import-failure' if the input is not valid JSON, with the `error`.
 * @param metadata JSON of the keys & values to put in AsyncStorage
 */
async function importMetadata(metadata: string) {
  try {
    const kvs = JSON.parse(metadata);
    await AsyncStorage.clear();
    const kvpairs = Object.keys(kvs).map((k) => [k, kvs[k]]);
    await AsyncStorage.multiSet(kvpairs);
    dispatcher.dispatch({ type: 'imported-metadata' });
  } catch (error) {
    setTimeout(() => dispatcher.dispatch({ type: 'import-failure', error }), 0);
  }
}

function importImage(remoteUri: string) {
  // console.log("importImage");
  saveToFile(remoteUri, true /* isRemote */);
  setTimeout(() => dispatcher.dispatch({
    type: 'image-timeout',
    uri: remoteUri,
  }), 30000);
}

export { startExport, exportImage, finishExport, startImport, startUrlImport, importMetadata, importImage };

