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
  ...state,
  fontLoaded: !!(props && props.fontLoaded),
});

// exported for testing
export const mapDispatchToProps = (
  dispatch: ThunkDispatch<FullState, never, types.Action>,
): AppViewDispatchProps => ({
  onNavigateToList: () =>
    dispatch({
      type: 'page-list',
    }),

  onStartExport: () => dispatch({ type: 'export-initiate' }),
  onStartImport: () => dispatch({ type: 'import-initiate' }),
  onStartUrlImport: (url: string) =>
    dispatch({
      type: 'import-initiate-url',
      url,
    }),
  onResumeImport: () => dispatch({ type: 'import-resume-affirm' }),
  onCancelResumeImport: () => dispatch({ type: 'import-resume-cancel' }),
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
// export default Container.createFunctional(AppView, getStores, getState, {withProps: true});
