import { DocumentPicker } from 'expo';
import { AsyncStorage } from 'react-native';
import { ImageState } from '../action';
import dispatcher from '../AppDispatcher';
import { saveToFile } from './imageutils';
import * as uploader from './uploader';

const EXPORT_KEY_PREFIX = ['@Pots', '@Pot:', '@ImageStore'];

const keyIsExportable = (key: string) => {
  for (let i=0; i < EXPORT_KEY_PREFIX.length; i++){
    if (key.indexOf(EXPORT_KEY_PREFIX[i]) === 0) {
      return true;
    }
  }
  return false;
}
const keyIsImportable = keyIsExportable;

async function getExportMetadata() {
  const allKeys = (await AsyncStorage.getAllKeys()).filter(keyIsExportable);
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
  // No good; infinite loop
  // setTimeout(() => dispatcher.dispatch({ type: 'import-metadata-again', metadata }), 100);
  Alert.alert('Ready to import. This will erase any existing data. Are you sure?', undefined,
    [{
      text: 'Nevermind', style: 'cancel', onPress: () =>
        dispatcher.dispatch({ type: 'import-cancel' }),
    },
    {
      text: 'Continue', onPress: () => importMetadataNow(metadata),
    },
    ],
    { cancelable: false });
}

async function importMetadataNow(metadata: string) {
  try {
    const existingKeys = await AsyncStorage.getAllKeys();
    for (let existingKey in existingKeys) {
      if (keyIsImportable(existingKey)) {
        await AsyncStorage.removeItem(existingKey);
      }
    }

    const kvs: {[k: string]: string} = JSON.parse(metadata);
    const kvpairs = Object.keys(kvs).filter(keyIsImportable).map((k) => [k, kvs[k]]);
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

export { startExport, exportImage, finishExport, startImport, startUrlImport, importMetadata, importMetadataNow, importImage };

