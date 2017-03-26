// @flow
import dispatcher from './AppDispatcher.js';
import PotsStore from './PotsStore.js';
import UIStore from './UIStore.js';
import AppView from './AppView.js';
import {Container} from 'flux/utils';
import {orderedStatuses, getStatus} from './Pot.js';

function getStores() {
  return [
    PotsStore,
    UIStore,
  ];
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
      const pot = PotsStore.getState().pots[UIStore.getState().editPotId];
      const newFullStatus = pot.status.withStatus(newStatus);
      dispatcher.dispatch({
        type: 'pot-edit-field',
        field: 'status',
        value: newFullStatus,
        potId: pot.uuid,
      })
    }
  };
}

export default Container.createFunctional(AppView, getStores, getState);
