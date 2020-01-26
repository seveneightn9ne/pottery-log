import { applyMiddleware, createStore, Middleware, Reducer } from 'redux';
import thunk, { ThunkMiddleware } from 'redux-thunk';
import { Action } from '../action';
import {
  subscribeToPersistImageStore,
  subscribeToPersistImportStore,
  subscribeToPersistPotStore,
  subscribeToPersistSettingsStore,
} from '../thunks/persist';
import { PLThunkDispatch } from '../thunks/types';
import {
  getInitialState as getInitialExportState,
  reduceExport,
} from './ExportStore';
import {
  getInitialState as getInitialImageState,
  reduceImages,
} from './ImageStore';
import {
  getInitialState as getInitialImportState,
  reduceImport,
} from './ImportStore';
import {
  getInitialState as getInitialPotsState,
  reducePots,
} from './PotsStore';
import {
  getInitialState as getInitialSettingsState,
  reduceSettings,
} from './settingsStore';
import { FullState } from './types';
import { getInitialState as getInitialUiState, reduceUi } from './UIStore';

const logger: Middleware<{}, FullState, PLThunkDispatch> = (_) => (next) => (
  action,
) => {
  // I think we might want the logs in prod, in case of errors
  // if (Constants.appOwnership === 'standalone') {
  //   // Skip logs in prod, for great speed
  //   return next(action);
  // }

  if (typeof action === 'function') {
    console.log('Thunk Action:', action.thunkName, action.thunkArgs);
  } else if (action.type === 'loaded-everything') {
    console.log('Action: loaded-everything (body omitted)');
  } else {
    console.log('Action:', action.type, action);
  }

  return next(action);
};

function getInitialState(): FullState {
  return {
    pots: getInitialPotsState(),
    ui: getInitialUiState(),
    images: getInitialImageState(),
    exports: getInitialExportState(),
    imports: getInitialImportState(),
    settings: getInitialSettingsState(),
  };
}

function reducer(): Reducer<FullState, Action> {
  return (state: FullState | undefined, action: Action): FullState => {
    if (state === undefined) {
      state = getInitialState();
    }
    const newState = { ...state };
    newState.pots = reducePots(newState.pots, action);
    newState.ui = reduceUi(newState.ui, action);
    // reduceImages depends on recducePots having been run first on the current action.
    newState.images = reduceImages(newState.images, action);
    newState.exports = reduceExport(newState.exports, action, newState);
    newState.imports = reduceImport(newState.imports, action);
    newState.settings = reduceSettings(newState.settings, action);
    /*return {
      pots: reducePots(state.pots, action),
      ui: reduceUi(state.ui, action),
      images: reduceImages(state.images, action, state),
      exports: reduceExport(state.exports, action),
      imports: reduceImport(state.imports, action)
    };*/

    return newState;
  };
}

// EXPORTED FOR TESTS
export function makeStore() {
  const store = createStore(
    reducer(),
    applyMiddleware(logger, thunk as ThunkMiddleware<FullState, Action>),
  );
  subscribeToPersistPotStore(store);
  subscribeToPersistImageStore(store);
  subscribeToPersistImportStore(store);
  subscribeToPersistSettingsStore(store);
  return store;
}

export default makeStore();
