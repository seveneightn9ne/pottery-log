import * as FileSystem from 'expo-file-system';
import { AsyncStorage } from 'react-native';
import { Action } from '../action';
import { FullState, ImageState } from '../reducers/types';
import * as uploader from './uploader';

const EXPORT_KEY_PREFIX = ['@Pots', '@Pot:', '@ImageStore', '@PLSettings'];

const keyIsExportable = (key: string) => {
  for (const prefix of EXPORT_KEY_PREFIX) {
    if (key.indexOf(prefix) === 0) {
      return true;
    }
  }
  return false;
};

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
  keyIsExportable,
  isStillExporting,
  exportImage,
  status,
  getExportMetadata,
};
