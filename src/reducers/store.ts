import {
  reduceExport,
  getInitialState as getInitialExportState
} from "./ExportStore";
import {
  reduceImages,
  getInitialState as getInitialImageState
} from "./ImageStore";
import {
  reduceImport,
  getInitialState as getInitialImportState
} from "./ImportStore";
import {
  reducePots,
  getInitialState as getInitialPotsState
} from "./PotsStore";
import { reduceUi, getInitialState as getInitialUiState } from "./UIStore";
import { createStore, applyMiddleware, Middleware, Reducer } from "redux";
import thunk, { ThunkMiddleware } from "redux-thunk";
import { Action } from "../action";
import { Constants } from "expo";
import { FullState } from "./types";

const logger: Middleware = _ => next => (action: Action) => {
  if (Constants.appOwnership === "standalone") {
    // Skip logs in prod, for great speed
    return next(action);
  }

  if (action.type === "loaded-everything") {
    console.log("Action: loaded-everything (body omitted)");
  } else {
    console.log("Action:", action.type, action);
  }

  return next(action);
};

function getInitialState(): FullState {
  return {
    pots: getInitialPotsState(),
    ui: getInitialUiState(),
    images: getInitialImageState(),
    exports: getInitialExportState(),
    imports: getInitialImportState()
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
    newState.images = reduceImages(newState.images, action, newState);
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

export default createStore(
  reducer(),
  applyMiddleware(thunk as ThunkMiddleware<FullState, Action>, logger)
);
