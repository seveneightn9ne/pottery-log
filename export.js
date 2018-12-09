// @flow
import Expo from 'expo';
import { AsyncStorage } from 'react-native';
import dispatcher from './AppDispatcher.js';
import * as uploader from './uploader.js';
import {ImageStore, nameFromUri} from './stores/ImageStore.js';

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

async function storageImport(fileUri: string) {
  console.log("Start storageImport");
  const {uri} = await Expo.FileSystem.downloadAsync(
      fileUri, Expo.FileSystem.cacheDirectory + 'import.json');
  console.log("Saved import file locally");
  const dataStr = await Expo.FileSystem.readAsStringAsync(uri);
  console.log("Got the import data (" + dataStr.length + " bytes)");
  data = JSON.parse(dataStr);
  console.log("Parsed imported data");
  await AsyncStorage.clear();
  const kvpairs = Object.keys(data).map((k) => [k, data[k]]);
  await AsyncStorage.multiSet(kvpairs);
  console.log("Import finished");
  return;
}

async function startExport() {
  const metadata = await getExportMetadata();
  uploader.startExport(metadata);
  //const {images} = ImageStore.getState();
  //return images;
}

async function exportImage(imageState) {
  if (!imageState.fileUri) {
    const uri = imageState.remoteUri || imageState.localUri;
    const isRemote = uri == imageState.remoteUri;
    ImageStore.saveToFile(imageState.remoteUri, isRemote);
    return false;
  }
  uploader.exportImage(imageState.fileUri);
  return true;
}

async function finishExport() {
  return uploader.finishExport();
}

export { storageImport, startExport, exportImage, finishExport };
