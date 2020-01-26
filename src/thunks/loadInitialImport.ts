import _ from 'lodash';
import { AsyncStorage } from 'react-native';
import { ImportStatePersisted } from '../reducers/types';
export const IMPORT_STORAGE_KEY = '@Import';

export default async function loadInitialImport(): Promise<ImportStatePersisted | null> {
  const json = await AsyncStorage.getItem(IMPORT_STORAGE_KEY);

  if (!json) {
    return null;
  }
  let existing: ImportStatePersisted;
  try {
    existing = JSON.parse(json);
  } catch (e) {
    // Import state is not really vital so we're ok catching
    console.log('Ignoring invalid saved import data: ', json);
    return null;
  }
  if (existing.imageMap && Object.keys(existing.imageMap).length > 0) {
    return existing;
  }
  return null;
}
