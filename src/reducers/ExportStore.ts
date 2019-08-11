import _ from 'lodash';
import { Action } from '../action';
import { ExportState } from './types';

export function getInitialState(): ExportState {
  return { exporting: false };
}

export function reduceExport(
  state: ExportState = getInitialState(),
  action: Action,
): ExportState {
  if (action.type === 'page-list') {
    return getInitialState();
  }
  if (action.type === 'page-settings') {
    // Make sure it's re-initialized when you navigate here
    return getInitialState();
  }
  if (action.type === 'export-status') {
    if (state.exporting && action.exportId !== state.exportId) {
      // Got an action for a previous export
      console.log('Stale export action: ', action);
      return state;
    }
    if (action.exporting) {
      return {
        exporting: true,
        exportId: action.exportId,
        statusMessage: action.status,
      };
    } else {
      return {
        exporting: false,
        statusMessage: action.status,
      };
    }
  }
  if (action.type === 'export-finished') {
    return {
      exporting: false,
      statusMessage: 'Export finished!',
      exportUri: action.uri,
    };
  }
  return state;
}
