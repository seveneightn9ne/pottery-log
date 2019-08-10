import _ from 'lodash';
import { Action } from '../action';
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
      const newState = {
        ...state,
        potIds: [...state.potIds, action.pot.uuid],
        pots: { ...state.pots, [action.pot.uuid]: action.pot },
      };
      return newState;
    }
    case 'pot-edit-field': {
      const pot = {
        ...state.pots[action.potId],
        [action.field]: action.value,
      };
      const newState = {
        ...state,
        pots: {
          ...state.pots,
          [action.potId]: pot,
        },
      };
      return newState;
    }
    case 'pot-delete': {
      const newPots = { ...state.pots };
      delete newPots[action.potId];
      const newPotIds = state.potIds.filter((potId) => potId !== action.potId);
      const newState = {
        hasLoaded: true,
        pots: newPots,
        potIds: newPotIds,
      };
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
        uuid: action.newPotId,
        title: newTitle,
      };
      const newState = {
        ...state,
        potIds: [...state.potIds, pot.uuid],
        pots: { ...state.pots, [pot.uuid]: pot },
      };
      return newState;
    }
    case 'initial-pots-images': {
      return getInitialState();
    }
    default:
      return state;
  }
}
