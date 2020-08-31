import _ from 'lodash';
import { Action } from '../action';
import {
  ImportState,
} from './types';

export function getInitialState(): ImportState {
  return { importing: false };
}

export function reduceImport(
  state: ImportState = getInitialState(),
  action: Action,
): ImportState {
  // Actions when we might not be importing already
  switch (action.type) {
    case 'import-status': {
      const newState: ImportState = {
        importing: action.importing,
        statusMessage: action.statusMessage,
      };
      // Saved for resumability
      if (action.imageMap) {
        newState.imageMap = _.cloneDeep(action.imageMap);
      }
      return newState;
    }
    case 'import-resume': {
      return {
        importing: false,
        resumable: action.data,
      };
    }
    case 'import-resume-cancel': {
      return {
        importing: false,
      };
    }

    default:
      return state;
  }
}
