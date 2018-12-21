// @flow
import Expo from 'expo';
import { Alert, AsyncStorage } from 'react-native';
import dispatcher from './AppDispatcher';
import * as uploader from './uploader';
import {ImageStore, nameFromUri} from './stores/ImageStore';

function shouldShowSettings() {
  let m = {
    "72B2295B-5DEC-4AB2-A007-F6C1A4045B3E": true,
    "1b6e8899-adab-419d-9cb9-ff454c8d86ee": true,
  };
  return (m[Expo.Constants.deviceId] === true)
}

async function getExportMetadata() {
  let allKeys = await AsyncStorage.getAllKeys();
  let pairs = await AsyncStorage.multiGet(allKeys);
  let snapshot = {};
  pairs.forEach((pair) => {
    snapshot[pair[0]] = pair[1];
  });
  return snapshot;
}

async function startExport(id: number) {
  const metadata = await getExportMetadata();
  uploader.startExport(id, metadata);
}

function exportImage(id: number, imageState) {
  if (!imageState.fileUri) {
    const uri = imageState.remoteUri || imageState.localUri;
    const isRemote = uri == imageState.remoteUri;
    ImageStore.saveToFile(imageState.remoteUri, isRemote);
    return false;
  }
  uploader.exportImage(id, imageState.fileUri);
  return true;
}

async function finishExport(id: number) {
  return uploader.finishExport(id);
}

async function startImport() {
  const docResult = await Expo.DocumentPicker.getDocumentAsync();
  if (docResult.type == 'success') {
    return uploader.startImport(docResult.uri);
  } else if (docResult.type == 'cancel') {
    dispatcher.dispatch({type: 'import-cancel'});
  }
}

async function importMetadata(metadata: string) {
  try {
    const kvs = JSON.parse(metadata);

    Alert.alert('Ready to import. This will erase any existing data. Are you sure?', undefined,
       [{text: 'Nevermind', style: 'cancel', onPress: () => 
          dispatcher.dispatch({type: 'import-cancel'})},
        {text: 'Continue', onPress: async () => {
          await AsyncStorage.clear();
          const kvpairs = Object.keys(kvs).map((k) => [k, kvs[k]]);
          await AsyncStorage.multiSet(kvpairs);
          dispatcher.dispatch({type: 'imported-metadata'});
        }},
      ]);
  } catch (error) {
    setTimeout(() => dispatcher.dispatch({type: 'import-failure', error}), 0);
  }
}

function importImage(remoteUri: string, isRetry = false) {
  //console.log("importImage");
  ImageStore.saveToFile(remoteUri, true /* isRemote */, !!isRetry);
  setTimeout(() => dispatcher.dispatch({
    type: 'image-timeout',
    uri: remoteUri,
  }), 30000);
}

export { startExport, exportImage, finishExport, startImport, importMetadata, importImage };
