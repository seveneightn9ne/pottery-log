import { AsyncStorage } from 'react-native';
import { getInitialState } from '../reducers/settingsStore';
import { SettingsState } from '../reducers/types';

export const SETTINGS_STORAGE_KEY = '@PLSettings';

export default async function loadInitialSettings(): Promise<SettingsState> {
  const json = await AsyncStorage.getItem(SETTINGS_STORAGE_KEY);

  if (!json) {
    console.log('There was no SettingsState to load.');
    return getInitialState();
  }
  // Don't catch this because we would rather throw to see wtf happened here
  const parsed = JSON.parse(json);

  const ret: SettingsState = {};
  if (parsed.darkMode) {
    ret.darkMode = parsed.darkMode;
  }
  return ret;
}
