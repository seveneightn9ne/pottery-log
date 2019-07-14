import { Alert, BackHandler } from 'react-native';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';
import * as types from './action';
import { newPot, Pot } from './models/Pot';
import { StatusString } from './models/Status';
import { FullState } from './reducers/types';
import { handleBackButton } from './thunks/back';
import { loadInitial } from './thunks/loadInitial';
import { nameFromUri } from './utils/imageutils';
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
  onChangeTitle: (potId: string, newTitle: string) =>
    dispatch({
      type: 'pot-edit-field',
      field: 'title',
      value: newTitle,
      potId,
    }),
  onChangeNote: (currentPot: Pot, statusText: StatusString, noteText: string) =>
    dispatch({
      type: 'pot-edit-field',
      field: 'notes2',
      value: currentPot.notes2.withNoteForStatus(statusText, noteText),
      potId: currentPot.uuid,
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
  onAddImage: (currentPot: Pot, localUri: string) => {
    dispatch({
      type: 'image-add',
      localUri,
      potId: currentPot.uuid,
    });
    dispatch({
      type: 'pot-edit-field',
      field: 'images3',
      value: [nameFromUri(localUri), ...currentPot.images3],
      potId: currentPot.uuid,
    });
  },
  onSetMainImage: (currentPot: Pot, name: string) =>
    dispatch({
      type: 'pot-edit-field',
      field: 'images3',
      value: [name, ...currentPot.images3.filter((i) => i !== name)],
      potId: currentPot.uuid,
    }),
  onExpandImage: (name: string) =>
    dispatch({
      type: 'page-image',
      imageId: name,
    }),
  setStatus: (currentPot: Pot, newStatus: StatusString) => {
    const newFullStatus = currentPot.status.withStatus(newStatus);
    dispatch({
      type: 'pot-edit-field',
      field: 'status',
      value: newFullStatus,
      potId: currentPot.uuid,
    });
  },
  setStatusDate: (currentPot: Pot, date: Date) => {
    const currentStatus = currentPot.status.currentStatus();
    if (!currentStatus) {
      throw Error("Cannot set date when there's no status");
    }
    const newFullStatus = currentPot.status.withStatus(currentStatus, date);
    dispatch({
      type: 'pot-edit-field',
      field: 'status',
      value: newFullStatus,
      potId: currentPot.uuid,
    });
  },
  onDelete: (currentPot: Pot) => {
    Alert.alert('Delete this pot?', undefined, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        onPress: () => {
          dispatch({
            type: 'pot-delete',
            potId: currentPot.uuid,
            imageNames: currentPot.images3,
          });
        },
      },
    ]);
  },
  onDeleteImage: (currentPot: Pot, name: string) => {
    Alert.alert('Delete this image?', undefined, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        onPress: () => {
          dispatch({
            type: 'pot-edit-field',
            field: 'images3',
            value: currentPot.images3.filter((i) => i !== name),
            potId: currentPot.uuid,
          });
          dispatch({
            type: 'image-delete-from-pot',
            imageName: name,
            potId: currentPot.uuid,
          });
        },
      },
    ]);
  },
  onCopy: (currentPot: Pot) =>
    dispatch({
      type: 'pot-copy',
      potId: currentPot.uuid,
      newPotId: String(Math.random()).substring(2),
      imageNames: currentPot.images3,
    }),
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
  onImageLoad: (name: string) => dispatch({ type: 'image-loaded', name }),
  onImageLoadFailure: (
    nameOrUri: string,
    type: 'local' | 'file' | 'remote',
  ) => {
    if (type === 'file') {
      dispatch({
        type: 'image-error-file',
        uri: nameOrUri,
      });
    } else if (type === 'local') {
      dispatch({
        type: 'image-error-local',
        name: nameOrUri,
      });
    } else {
      dispatch({
        type: 'image-error-remote',
        name: nameOrUri,
      });
    }
  },
  addBackButtonHandler: () => {
    const handler = () => dispatch(handleBackButton());
    BackHandler.addEventListener('hardwareBackPress', handler);
    return handler;
  },
  removeBackButtonHandler: (handler: undefined | (() => void)) => {
    if (handler) { BackHandler.removeEventListener('hardwareBackPress', handler); }
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
