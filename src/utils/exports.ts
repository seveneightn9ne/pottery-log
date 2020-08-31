import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { Alert, AsyncStorage } from 'react-native';
import { Action } from '../action';
import store from '../reducers/store';
import { FullState, ImageState } from '../reducers/types';
import { reloadFromImport } from '../thunks/loadInitial';
import { deprecatedSaveToFileImpure } from './deprecated_imageutils';
import * as uploader from './uploader';

const EXPORT_KEY_PREFIX = ['@Pots', '@Pot:', '@ImageStore'];

const keyIsExportable = (key: string) => {
  for (const prefix of EXPORT_KEY_PREFIX) {
    if (key.indexOf(prefix) === 0) {
      return true;
    }
  }
  return false;
};
const keyIsImportable = keyIsExportable;

async function startImport(): Promise<void> {
  const docResult = await DocumentPicker.getDocumentAsync();
  if (docResult.type === 'success' && docResult.uri) {
    return uploader.startImport(docResult.uri);
  } else if (docResult.type === 'cancel') {
    store.dispatch({ type: 'import-cancel' });
  }
  return Promise.resolve();
}

async function startUrlImport(url: string) {
  return uploader.startUrlImport(url);
}

/**
 * Dispatches:
 *  'import-cancel' if the user declines the import.
 *  reloadFromImport thunk after the metadata has been imported.
 *  'import-failure' if the input is not valid JSON, with the `error`.
 * @param metadata JSON of the keys & values to put in AsyncStorage
 */
async function importMetadata(metadata: string) {
  // No good; infinite loop
  // setTimeout(() => dispatcher.dispatch({ type: 'import-metadata-again', metadata }), 100);
  Alert.alert(
    'Ready to import. This will erase any existing data. Are you sure?',
    undefined,
    [
      {
        text: 'Nevermind',
        style: 'cancel',
        onPress: () => store.dispatch({ type: 'import-cancel' }),
      },
      {
        text: 'Continue',
        onPress: () => importMetadataNow(metadata),
      },
    ],
    { cancelable: false },
  );
}

async function importMetadataNow(metadata: string) {
  try {
    const existingKeys = await AsyncStorage.getAllKeys();
    for (const existingKey of existingKeys) {
      if (keyIsImportable(existingKey)) {
        await AsyncStorage.removeItem(existingKey);
      }
    }

    const kvs: { [k: string]: string } = JSON.parse(metadata);
    const kvpairs = Object.keys(kvs)
      .filter(keyIsImportable)
      .map((k) => [k, kvs[k]]);
    await AsyncStorage.multiSet(kvpairs);
    store.dispatch(reloadFromImport());
  } catch (error) {
    setTimeout(() => store.dispatch({ type: 'import-failure', error }), 0);
  }
}

function importImage(remoteUri: string) {
  deprecatedSaveToFileImpure(remoteUri, true /* isRemote */);
  setTimeout(
    () =>
      store.dispatch({
        type: 'image-timeout',
        uri: remoteUri,
      }),
    30000,
  );
}

const isStillExporting = (exportId: number, getState: () => FullState) => {
  const state = getState();
  return (
    state && state.exports.exporting && state.exports.exportId === exportId
  );
};

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

async function getExportMetadata() {
  const allKeys = (await AsyncStorage.getAllKeys()).filter(keyIsExportable);
  const pairs = await AsyncStorage.multiGet(allKeys);
  const snapshot: { [key: string]: string } = {};
  pairs.forEach((pair) => {
    snapshot[pair[0]] = pair[1];
  });
  return snapshot;
}

export {
  startImport,
  startUrlImport,
  importMetadata,
  importMetadataNow,
  importImage,
  isStillExporting,
  exportImage,
  status,
  getExportMetadata,
};
