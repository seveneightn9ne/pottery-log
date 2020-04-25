import { Action } from '../action';
import { SettingsState } from './types';

export function getInitialState(): SettingsState {
  return {};
}

export function reduceSettings(
  state: SettingsState = getInitialState(),
  action: Action,
): SettingsState {
  switch (action.type) {
    case 'loaded-everything': {
      if (action.settings) {
        return action.settings;
      }
      return state;
    }
    case 'settings-set-dark-mode': {
      return {
        ...state,
        darkMode: action.value,
      };
    }
    default:
      return state;
  }
}
