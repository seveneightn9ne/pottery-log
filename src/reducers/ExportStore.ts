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
  if (action.type === 'page-list' || action.type === 'page-settings') {
    return {
      exporting: false,
      exportId: state.exportId,
    };
  }
  if (action.type === 'export-status') {
    if (state.exporting && action.exportId !== state.exportId) {
      // Got an action for a previous export
      console.log('Stale export action: ', action);
      return state;
    }
    if (!state.exporting && state.exportId === action.exportId) {
      // Ignore actions after no longer exporting
      console.log('Action for finished export: ', action);
      return state;
    }
    return {
      exporting: action.exporting,
      exportId: action.exportId,
      statusMessage: action.status,
    };
  }
  if (action.type === 'export-finished') {
    if (action.exportId !== state.exportId) {
      console.log('Finished a stale export: ', action);
      return state;
    }
    return {
      exporting: false,
      exportId: state.exportId,
      statusMessage: 'Export finished!',
      exportUri: action.uri,
    };
  }
  return state;
}
