import {Container} from 'flux/utils';
import {Alert, BackHandler} from 'react-native';
import dispatcher from './AppDispatcher';
import { StatusString } from './models/Status';
import ExportStore from './stores/ExportStore';
import {ImageStore} from './stores/ImageStore';
import ImportStore from './stores/ImportStore';
import PotsStore from './stores/PotsStore';
import UIStore from './stores/UIStore';
import { nameFromUri } from './utils/imageutils';
import AppView, { AppViewProps } from './views/AppView';

function getStores() {
  return [
    PotsStore,
    UIStore,
    ImageStore,
    ExportStore,
    ImportStore,
  ];
}

function currentPot() {
  const uiState = UIStore.getState();
  if (!('editPotId' in uiState)) {
    throw Error('currentPot called without a pot on page: ' + uiState.page);
  }
  return PotsStore.getState().pots[uiState.editPotId];
}

BackHandler.addEventListener('hardwareBackPress', () => {
  const uiState = UIStore.getState();
  if (uiState.page === 'list') {
    if ('searching' in uiState) {
      dispatcher.dispatch({
        type: 'list-search-close',
      });
      return true;
    }
    return false;
  }
  if (uiState.page === 'image') {
    dispatcher.dispatch({
      type: 'page-edit-pot',
      potId: uiState.editPotId,
    });
    return true;
  }
  const exportState = ExportStore.getState();
  if (exportState.exporting && !('exportUri' in exportState)) {
    Alert.alert('Cancel this export?', undefined,
       [{text: 'Stay here', style: 'cancel'},
        {text: 'Cancel', onPress: () =>
          dispatcher.dispatch({type: 'page-list'})},
      ]);
    return true;
  }
  dispatcher.dispatch({
    type: 'page-list',
  });
  return true;
});

function getState(prevState?: AppViewProps, props?: {fontLoaded: boolean}) {
  return {
    pots: PotsStore.getState(),
    ui: UIStore.getState(),
    images: ImageStore.getState(),
    exports: ExportStore.getState(),
    imports: ImportStore.getState(),
    fontLoaded: !!(props && props.fontLoaded),

    onNew: () => dispatcher.dispatch({
      type: 'new',
    }),
    onEdit: (potId: string) => dispatcher.dispatch({
      type: 'page-edit-pot',
      potId,
    }),
    onChangeTitle: (potId: string, newTitle: string) => dispatcher.dispatch({
      type: 'pot-edit-field',
      field: 'title',
      value: newTitle,
      potId,
    }),
    onChangeNote: (potId: string, statusText: StatusString, noteText: string) => dispatcher.dispatch({
        type: 'pot-edit-field',
        field: 'notes2',
        value: currentPot().notes2.withNoteForStatus(statusText, noteText),
        potId,
    }),
    onNavigateToList: () => dispatcher.dispatch({
      type: 'page-list',
    }),
    onNavigateToSettings: () => dispatcher.dispatch({
      type: 'page-settings',
    }),
    onOpenSearch: () => dispatcher.dispatch({
      type: 'list-search-open',
    }),
    onCloseSearch: () => dispatcher.dispatch({
      type: 'list-search-close',
    }),
    onSearch: (text: string) => {
      console.log('search', text);
      dispatcher.dispatch({
        type: 'list-search-term',
        text,
      });
    },
    onAddImage: (potId: string, localUri: string) => {
      dispatcher.dispatch({
        type: 'image-add',
        localUri,
        potId,
      });
      dispatcher.dispatch({
        type: 'pot-edit-field',
        field: 'images3',
        value: [nameFromUri(localUri), ...PotsStore.getState().pots[potId].images3],
        potId,
      });
    },
    onSetMainImage: (potId: string, name: string) => dispatcher.dispatch({
      type: 'pot-edit-field',
      field: 'images3',
      value: [name, ...PotsStore.getState().pots[potId].images3.filter((i) => i !== name)],
      potId,
    }),
    onExpandImage: (name: string) => dispatcher.dispatch({
      type: 'page-image',
      imageId: name,
    }),
    setStatus: (newStatus: StatusString) => {
      const newFullStatus = currentPot().status.withStatus(newStatus);
      dispatcher.dispatch({
        type: 'pot-edit-field',
        field: 'status',
        value: newFullStatus,
        potId: currentPot().uuid,
      });
    },
    setStatusDate: (date: Date) => {
      const currentStatus = currentPot().status.currentStatus();
      if (!currentStatus) {
        throw Error("Cannot set date when there's no status");
      }
      const newFullStatus = currentPot().status.withStatus(currentStatus, date);
      dispatcher.dispatch({
        type: 'pot-edit-field',
        field: 'status',
        value: newFullStatus,
        potId: currentPot().uuid,
      });
    },
    onDelete: () => {
      Alert.alert('Delete this pot?', undefined,
       [{text: 'Cancel', style: 'cancel'},
        {text: 'Delete', onPress: () => {
          dispatcher.dispatch({
            type: 'pot-delete',
            potId: currentPot().uuid,
            imageNames: currentPot().images3,
          });
        }},
      ]);
    },
    onDeleteImage: (name: string) => {
      Alert.alert('Delete this image?', undefined,
       [{text: 'Cancel', style: 'cancel'},
        {text: 'Delete', onPress: () => {
          dispatcher.dispatch({
            type: 'pot-edit-field',
            field: 'images3',
            value: currentPot().images3.filter((i) => i !== name),
            potId: currentPot().uuid,
          });
          dispatcher.dispatch({
            type: 'image-delete-from-pot',
            imageName: name,
            potId: currentPot().uuid,
          });
        }},
      ]);
    },
    onCopy: () => dispatcher.dispatch({
      type: 'pot-copy',
      potId: currentPot().uuid,
      imageNames: currentPot().images3,
    }),
    onCollapse: (section: string) => dispatcher.dispatch({
      type: 'list-collapse', section,
    }),
    onScrollTo: (y: number) => dispatcher.dispatch({
      type: 'list-scroll', y,
    }),

    onStartExport: () => dispatcher.dispatch({type: 'export-initiate'}),
    onStartImport: () => dispatcher.dispatch({type: 'import-initiate'}),
    onStartUrlImport: (url: string) => dispatcher.dispatch({
      type: 'import-initiate-url',
      url
    }),
    onResumeImport: () => dispatcher.dispatch({type: 'import-resume-affirm'}),
    onCancelResumeImport: () => dispatcher.dispatch({type: 'import-resume-cancel'}),
  };
}

export default Container.createFunctional(AppView, getStores, getState, {withProps: true});
