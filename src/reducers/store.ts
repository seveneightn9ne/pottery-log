import Constants from 'expo-constants';
import { applyMiddleware, createStore, Middleware, Reducer } from 'redux';
import thunk, { ThunkMiddleware } from 'redux-thunk';
import { Action } from '../action';
import {
  subscribeToPersistImageStore,
  subscribeToPersistImportStore,
  subscribeToPersistPotStore,
} from '../thunks/persist';
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
import { FullState } from './types';
import { getInitialState as getInitialUiState, reduceUi } from './UIStore';

const logger: Middleware = (_) => (next) => (action: Action) => {
  if (Constants.appOwnership === 'standalone') {
    // Skip logs in prod, for great speed
    return next(action);
  }

  if (action.type === 'loaded-everything') {
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
    applyMiddleware(thunk as ThunkMiddleware<FullState, Action>, logger),
  );
  subscribeToPersistPotStore(store);
  subscribeToPersistImageStore(store);
  subscribeToPersistImportStore(store);
  return store;
}

export default makeStore();
