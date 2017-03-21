// @flow
import dispatcher from './AppDispatcher.js';
import PotsStore from './PotsStore.js';
import UIStore from './UIStore.js';
import AppView from './AppView.js';
import {Container} from 'flux/utils';

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
  };
}

export default Container.createFunctional(AppView, getStores, getState);
