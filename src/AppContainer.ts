import { BackHandler } from 'react-native';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';
import * as types from './action';
import { newPot, Pot } from './models/Pot';
import { FullState } from './reducers/types';
import { handleBackButton } from './thunks/back';
import { loadInitial } from './thunks/loadInitial';
import AppView, {
  AppViewDispatchProps,
  AppViewStateProps,
} from './views/AppView';
import { deleteImage } from './views/components/Alerts';

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
  onNew: () =>
    dispatch({
      type: 'new',
      pot: newPot(),
    }),
  onEdit: (potId: string) =>
    dispatch({
      type: 'page-edit-pot',
      potId,
    }),
  onNavigateToList: () =>
    dispatch({
      type: 'page-list',
    }),
  onNavigateToSettings: () =>
    dispatch({
      type: 'page-settings',
    }),
  onOpenSearch: () =>
    dispatch({
      type: 'list-search-open',
    }),
  onCloseSearch: () =>
    dispatch({
      type: 'list-search-close',
    }),
  onSearch: (text: string) => {
    console.log('search', text);
    dispatch({
      type: 'list-search-term',
      text,
    });
  },
  onCollapse: (section: string) =>
    dispatch({
      type: 'list-collapse',
      section,
    }),
  /*onScrollTo: (y: number) => dispatch({
    type: 'list-scroll', y,
  }),*/

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

  onSetMainImage: (currentPot: Pot, name: string) =>
    dispatch({
      type: 'pot-edit-field',
      field: 'images3',
      value: [name, ...currentPot.images3.filter((i) => i !== name)],
      potId: currentPot.uuid,
    }),
  onDeleteImage: (currentPot: Pot, name: string) =>
    deleteImage(dispatch, currentPot, name),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(AppView);
// export default Container.createFunctional(AppView, getStores, getState, {withProps: true});
