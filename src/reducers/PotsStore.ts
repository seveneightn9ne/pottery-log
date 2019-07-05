import _ from 'lodash';
import { Action } from '../action';
import { newPot } from '../models/Pot';
import { StorageWriter } from '../utils/sync';
import store from './store';
import { PotsStoreState } from './types';

export function getInitialState(): PotsStoreState {
  return { pots: {}, potIds: [], hasLoaded: false };
}

export function reducePots(
  state: PotsStoreState = getInitialState(),
  action: Action,
): PotsStoreState {
  switch (action.type) {
    case 'loaded-everything': {
      return action.pots;
    }
    case 'new': {
      const pot = newPot();
      const newState = {
        ...state,
        potIds: [...state.potIds, pot.uuid],
        pots: { ...state.pots, [pot.uuid]: pot },
      };
      setTimeout(
        () => store.dispatch({ type: 'page-new-pot', potId: pot.uuid }),
        0,
      );
      return newState;
    }
    case 'pot-edit-field': {
      const newPot = {
        ...state.pots[action.potId],
        [action.field]: action.value,
      };
      const newState = {
        ...state,
        pots: {
          ...state.pots,
          [action.potId]: newPot,
        },
      };
      return newState;
    }
    case 'pot-delete': {
      const potIndex = state.potIds.indexOf(action.potId);
      const newPots = { ...state.pots };
      delete newPots[action.potId];
      const newPotIds = [...state.potIds];
      if (potIndex > -1) {
        newPotIds.splice(potIndex, 1);
        StorageWriter.delete('@Pot:' + action.potId);
      }
      const newState = {
        hasLoaded: true,
        pots: newPots,
        potIds: newPotIds,
      };
      console.log('will navigate to page list');
      setTimeout(() => store.dispatch({ type: 'page-list' }), 1);
      return newState;
    }
    case 'pot-copy': {
      const oldPot = state.pots[action.potId];
      const oldTitleWords = oldPot.title.split(' ');
      const lastWordIndex = oldTitleWords.length - 1;
      const lastWord = oldTitleWords[lastWordIndex];
      const newTitle = isNaN(Number(lastWord))
        ? oldTitleWords.join(' ') + ' 2'
        : oldTitleWords.slice(0, lastWordIndex).join(' ') +
          ' ' +
          (1 + parseInt(lastWord, 10));
      const pot = {
        ...oldPot,
        uuid: String(Math.random()).substring(2),
        title: newTitle,
      };
      const newState = {
        ...state,
        potIds: [...state.potIds, pot.uuid],
        pots: { ...state.pots, [pot.uuid]: pot },
      };
      setTimeout(
        () => store.dispatch({ type: 'page-new-pot', potId: pot.uuid }),
        1,
      );
      return newState;
    }
    case 'initial-pots-images': {
      return getInitialState();
    }
    default:
      return state;
  }
}
