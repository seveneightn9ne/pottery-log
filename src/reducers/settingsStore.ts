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
    case 'loaded-settings': {
      return action.settings;
    }
    default:
      return state;
  }
}
