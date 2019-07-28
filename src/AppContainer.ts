import { BackHandler } from 'react-native';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';
import * as types from './action';
import { FullState } from './reducers/types';
import { handleBackButton } from './thunks/back';
import { loadInitial } from './thunks/loadInitial';
import AppView, {
  AppViewDispatchProps,
  AppViewStateProps,
} from './views/AppView';

const mapStateToProps = (
  state: FullState,
  props?: { fontLoaded: boolean },
): AppViewStateProps => ({
  pots: state.pots,
  images: state.images,
  ui: state.ui,
  fontLoaded: !!(props && props.fontLoaded),
});

// exported for testing
export const mapDispatchToProps = (
  dispatch: ThunkDispatch<FullState, never, types.Action>,
): AppViewDispatchProps => ({
  addBackButtonHandler: () => {
    const handler = () => dispatch(handleBackButton());
    BackHandler.addEventListener('hardwareBackPress', handler);
    return handler;
  },
  removeBackButtonHandler: (handler: undefined | (() => void)) => {
    if (handler) {
      BackHandler.removeEventListener('hardwareBackPress', handler);
    }
    return undefined;
  },
  loadInitial: () => {
    dispatch(loadInitial());
  },
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(AppView);
