// @flow
import {ReduceStore} from 'flux/utils';
import {Pot, Status} from './Pot.js';
import dispatcher from './AppDispatcher.js';
import { AsyncStorage } from 'react-native';

interface PotsStoreState {
  potIds: string[];
  pots: {[uuid: string]: Pot};
  hasLoaded: boolean;
}

class PotsStore extends ReduceStore<PotsStoreState> {
  constructor() {
    super(dispatcher);
  }
  getInitialState(): PotsStoreState {
    loadInitial(dispatcher);
    return {pots: {}, potIds: [], hasLoaded: false}
  }

  reduce(state: PotsStoreState, action: Object): PotsStoreState {
    switch (action.type) {
      case 'loaded': {
        return {pots: action.pots, potIds: action.potIds, hasLoaded: true};
      }
      case 'new': {
        //dispatcher.waitFor(['loaded']);
        const pot = {
          uuid: String(Math.random()).substring(2),
          title: 'New Pot',
          images: [],
          status: new Status({thrown: new Date()}),
        };
        const newState = {
          ...state,
          potIds: [...state.potIds, pot.uuid],
          pots: {...state.pots, [pot.uuid]: pot}
        };
        this.persist(newState, pot);
        setTimeout(() => dispatcher.dispatch({type: 'page-new-pot', potId: pot.uuid}), 1);
        return newState;
      }
      case 'pot-edit-field': {
        const newPot = {...state.pots[action.potId], [action.field]: action.value};
        const newState = {
          ...state,
          pots: {
            ...state.pots,
            [action.potId]: newPot,
          },
        };
        this.persist(newState, newPot);
        return newState;
      }
      default:
        return state;
    }
  }

  persist(state: PotsStoreState, pot: Pot = null) {
    if (pot != null) {
      AsyncStorage.setItem('@Pot:' + pot.uuid, JSON.stringify(pot));
    }
    AsyncStorage.setItem('@Pots', JSON.stringify(state.potIds));
  }

}

async function loadInitial(dispatcher): void {
  const potIdsStr = await AsyncStorage.getItem('@Pots');
  const potIds = JSON.parse(potIdsStr);
  const pots = {};
  for (let i = 0; i < potIds.length; i++) {
    const pot = await loadPot(potIds[i]);
    pots[potIds[i]] = pot;
  }
  dispatcher.dispatch({type: 'loaded', pots: pots, potIds: potIds});
}

async function loadPot(uuid: string): Pot {
  const loadedJson = await AsyncStorage.getItem('@Pot:' + uuid);
  console.log("Here is some pot json: " + loadedJson);
  const pot = {uuid};
  if (loadedJson != null) {
    const loaded = JSON.parse(loadedJson);
    pot.title = loaded.title;
    pot.status = new Status(loaded.status);
    pot.images = loaded.images;
  }
  return pot;
}

export default new PotsStore();
