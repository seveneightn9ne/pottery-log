// @flow
import dispatcher from './AppDispatcher.js';
import PotsStore from './stores/PotsStore.js';
import UIStore from './stores/UIStore.js';
import AppView from './views/AppView.js';
import {Container} from 'flux/utils';
import {Alert, BackHandler} from 'react-native';
import {ImageStore, nameFromUri} from './stores/ImageStore.js';

function getStores() {
  return [
    PotsStore,
    UIStore,
    ImageStore,
  ];
}

function currentPot() {
  return PotsStore.getState().pots[UIStore.getState().editPotId];
}

BackHandler.addEventListener('hardwareBackPress', function() {
  if (UIStore.getState().page == "list") {
    if (UIStore.getState().searching) {
      dispatcher.dispatch({
        type: 'list-search-close',
      });
      return true;
    }
    return false;
  }
  if (UIStore.getState().page == "image") {
    dispatcher.dispatch({
      type: 'page-edit-pot',
      potId: UIStore.getState().editPotId,
    });
    return true;
  }
  dispatcher.dispatch({
    type: 'page-list',
  });
  return true;
});

function getState(prevState, props) {
    console.log("AppContainer Props");
    console.log(props);
  return {
    pots: PotsStore.getState(),
    ui: UIStore.getState(),
    images: ImageStore.getState(),
    fontLoaded: props.fontLoaded,

    onNew: () => dispatcher.dispatch({
      type: 'new',
    }),
    onEdit: (potId) => dispatcher.dispatch({
      type: 'page-edit-pot',
      potId: potId,
    }),
    onChangeTitle: (potId, newTitle) => dispatcher.dispatch({
      type: 'pot-edit-field',
      field: 'title',
      value: newTitle,
      potId: potId,
    }),
    onChangeNote: (potId, statusText, noteText) => dispatcher.dispatch({
        type: 'pot-edit-field',
        field: 'notes2',
        value: currentPot().notes2.withNoteForStatus(statusText, noteText),
        potId: potId,
    }),
    onNavigateToList: () => dispatcher.dispatch({
      type: 'page-list',
    }),
    onNavigateToSettings: () => dispatcher.dispatch({
      type: 'page-settings',
    }),
    onExport: () => dispatcher.dispatch({
      type: 'export-start',
    }),
    onImport: (data: string) => dispatcher.dispatch({
      type: 'import-start',
      data: data,
    }),
    onOpenSearch: () => dispatcher.dispatch({
      type: 'list-search-open',
    }),
    onCloseSearch: () => dispatcher.dispatch({
      type: 'list-search-close',
    }),
    onSearch: (text: string) => {
      console.log("search", text);
      if (text.toLowerCase() === "secretsettings") {
        dispatcher.dispatch({
          type: 'page-settings',
        })
      } else {
        dispatcher.dispatch({
          type: 'list-search-term',
          text,
        })
      }
    },
    onAddImage: (potId, localUri) => {
      dispatcher.dispatch({
        type: 'image-add',
        localUri: localUri,
        potId: potId,
      });
      dispatcher.dispatch({
        type: 'pot-edit-field',
        field: 'images3',
        value: [nameFromUri(localUri), ...PotsStore.getState().pots[potId].images3],
        potId: potId,
      });
    },
    onSetMainImage: (potId, name) => dispatcher.dispatch({
      type: 'pot-edit-field',
      field: 'images3',
      value: [name, ...PotsStore.getState().pots[potId].images3.filter(i => i != name)],
      potId: potId,
    }),
    onExpandImage: (name) => dispatcher.dispatch({
      type: 'page-image',
      imageId: name,
    }),
    setStatus: (newStatus) => {
      const newFullStatus = currentPot().status.withStatus(newStatus);
      dispatcher.dispatch({
        type: 'pot-edit-field',
        field: 'status',
        value: newFullStatus,
        potId: currentPot().uuid,
      });
    },
    setStatusDate: (date) => {
      const newFullStatus = currentPot().status.withStatus(
          currentPot().status.currentStatus(), date);
      dispatcher.dispatch({
        type: 'pot-edit-field',
        field: 'status',
        value: newFullStatus,
        potId: currentPot().uuid,
      });
    },
    onDelete: () => {
      Alert.alert( 'Delete this pot?', undefined,
       [{text: 'Cancel', style: 'cancel'},
        {text: 'Delete', onPress: () => {
          dispatcher.dispatch({
            type: 'pot-delete',
            potId: currentPot().uuid,
          });
          dispatcher.dispatch({
            type: 'image-delete-all-from-pot',
            potId: currentPot().uuid,
            imageNames: currentPot().images3,
          });
        }},
      ]);
    },
    onDeleteImage: (name) => {
      Alert.alert( 'Delete this image?', undefined,
       [{text: 'Cancel', style: 'cancel'},
        {text: 'Delete', onPress: () => {
          dispatcher.dispatch({
            type: 'pot-edit-field',
            field: 'images3',
            value: currentPot().images3.filter(i => i != name),
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
    onImageError: (name, uri) => dispatcher.dispatch({
      type: 'image-error', name, uri,
    }),
    onCollapse: (section) => dispatcher.dispatch({
      type: 'list-collapse', section
    }),
    onScrollTo: (y) => dispatcher.dispatch({
      type: 'list-scroll', y
    }),
    onStartScroll: () => dispatcher.dispatch({type: 'list-scroll-disable'}),
    onEndScroll: () => dispatcher.dispatch({type: 'list-scroll-enable'}),
  };
}

export default Container.createFunctional(AppView, getStores, getState, {withProps: true});
