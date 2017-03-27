// @flow
import dispatcher from './AppDispatcher.js';
import PotsStore from './PotsStore.js';
import UIStore from './UIStore.js';
import AppView from './AppView.js';
import {Container} from 'flux/utils';
import {orderedStatuses, getStatus} from './Pot.js';
import {Alert} from 'react-native';

function getStores() {
  return [
    PotsStore,
    UIStore,
  ];
}

function currentPot() {
  return PotsStore.getState().pots[UIStore.getState().editPotId];
}

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
    onNavigateToList: () => dispatcher.dispatch({
      type: 'page-list',
    }),
    onChangeImages: (potId, newImageUris) => dispatcher.dispatch({
      type: 'pot-edit-field',
      field: 'images',
      value: newImageUris,
      potId: potId,
    }),
    onAddImage: (potId, uri) => dispatcher.dispatch({
      type: 'pot-edit-field',
      field: 'images',
      value: [...PotsStore.getState().pots[potId].images, uri],
      potId: potId,
    }),
    onSetMainImage: (potId, uri) => dispatcher.dispatch({
      type: 'pot-edit-field',
      field: 'images',
      value: [uri, ...PotsStore.getState().pots[potId].images.filter(i => i != uri)],
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
        {text: 'Delete', onPress: () => dispatcher.dispatch({
          type: 'pot-delete',
          potId: currentPot().uuid,
        })},
      ]);
    },
    onDeleteImage: (uri) => {
      Alert.alert( 'Delete selected image?', undefined,
       [{text: 'Cancel', style: 'cancel'},
        {text: 'Delete', onPress: () => dispatcher.dispatch({
          type: 'pot-edit-field',
          field: 'images',
          value: currentPot().images.filter(i => i != uri),
          potId: currentPot().uuid,
        })},
      ]);
    },
    onCopy: () => dispatcher.dispatch({
      type: 'pot-copy',
      potId: currentPot().uuid,
    }),
  };
}

export default Container.createFunctional(AppView, getStores, getState);
