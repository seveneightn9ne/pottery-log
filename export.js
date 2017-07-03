// @flow
import Expo from 'expo';
import { AsyncStorage } from 'react-native';

function shouldShowSettings() {
  let m = {
    "72B2295B-5DEC-4AB2-A007-F6C1A4045B3E": true,
    "1b6e8899-adab-419d-9cb9-ff454c8d86ee": true,
  };
  return (m[Expo.Constants.deviceId] === true)
}

async function storageExport() {
  let allKeys = await AsyncStorage.getAllKeys();
  let pairs = await AsyncStorage.multiGet(allKeys);
  snapshot = {};
  pairs.forEach((pair) => {
    snapshot[pair[0]] = pair[1];
  });
  return snapshot;
}

export { storageExport, shouldShowSettings };
