// @flow
import dispatcher from './AppDispatcher.js';
import PotsStore from './PotsStore.js';
import AppView from './AppView.js';
import {Container} from 'flux/utils';

function getStores() {
  return [
    PotsStore,
  ];
}

function getState() {
  return {
    pots: PotsStore.getState().pots,

    onNew: () => dispatcher.dispatch({
      type: 'new',
    }),
  };
}

export default Container.createFunctional(AppView, getStores, getState);
