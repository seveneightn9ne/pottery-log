// @flow
import dispatcher from './AppDispatcher.js';
import PotsStore from './stores/PotsStore.js';
import UIStore from './stores/UIStore.js';
import AppView from './views/AppView.js';
import {Container} from 'flux/utils';
import {Alert, BackAndroid} from 'react-native';

function getStores() {
  return [
    PotsStore,
    UIStore,
  ];
}

function currentPot() {
  return PotsStore.getState().pots[UIStore.getState().editPotId];
}

function imageEquals(i1, i2) {
  return i1.localUri == i2.localUri && i1.remoteUri == i2.remoteUri;
}

BackAndroid.addEventListener('hardwareBackPress', function() {
  if (UIStore.getState().page == "list") {
    if (UIStore.getState().searching) {
      dispatcher.dispatch({
        type: 'list-search-close',
      });
      return true;
    }
    return false;
  }
  dispatcher.dispatch({
    type: 'page-list',
  });
  return true;
});

function getState() {
  return {
    pots: PotsStore.getState(),
    ui: UIStore.getState(),

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
    onOpenSearch: () => dispatcher.dispatch({
      type: 'list-search-open',
    }),
    onCloseSearch: () => dispatcher.dispatch({
      type: 'list-search-close',
    }),
    onSearch: (text: sting) => dispatcher.dispatch({
      type: 'list-search-term',
      text,
    }),
    onAddImage: (potId, img) => {
      dispatcher.dispatch({
        type: 'image-add',
        image: img,
        potId: potId,
      });
      dispatcher.dispatch({
        type: 'pot-edit-field',
        field: 'images2',
        value: [img, ...PotsStore.getState().pots[potId].images2],
        potId: potId,
      });
    },
    onSetMainImage: (potId, image) => dispatcher.dispatch({
      type: 'pot-edit-field',
      field: 'images2',
      value: [image, ...PotsStore.getState().pots[potId].images2.filter(i => !imageEquals(i, image))],
      potId: potId,
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
            images: currentPot().images2,
          });
        }},
      ]);
    },
    onDeleteImage: (image) => {
      Alert.alert( 'Delete selected image?', undefined,
       [{text: 'Cancel', style: 'cancel'},
        {text: 'Delete', onPress: () => {
          dispatcher.dispatch({
            type: 'pot-edit-field',
            field: 'images2',
            value: currentPot().images2.filter(i => !imageEquals(i, image)),
            potId: currentPot().uuid,
          });
          dispatcher.dispatch({
            type: 'image-delete-from-pot',
            image: image,
            // We use the pot UUID just to identify the image that should be deleted.
            // This handler will not modify the pot.
            potId: currentPot().uuid,
          });
        }},
      ]);
    },
    onCopy: () => dispatcher.dispatch({
      type: 'pot-copy',
      potId: currentPot().uuid,
    }),
  };
}

export default Container.createFunctional(AppView, getStores, getState);
