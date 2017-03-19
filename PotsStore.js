// @flow
import {ReduceStore} from 'flux/utils';
import {Pot, PotStatus} from './Pot.js';
import dispatcher from './AppDispatcher.js';
import { AsyncStorage } from 'react-native';

interface PotsStoreState {
  pots: Pot[];
  hasLoaded: boolean;
}

async function loadInitial(dispatcher): void {
  const potIdsStr = await AsyncStorage.getItem('@Pots');
  const pots = potIdsStr ? JSON.parse(potIdsStr).map(id => this.loadPot(id)) : [];
  dispatcher.dispatch({type: 'loadInitial', pots: pots});
}

class PotsStore extends ReduceStore<PotsStoreState> {
  constructor() {
    super(dispatcher);
  }
  getInitialState(): PotsStoreState {
    loadInitial(dispatcher);
    return {pots: [], hasLoaded: false}
  }

  reduce(state: PotsStoreState, action: Object): PotsStoreState {
    switch (action.type) {
      case 'loaded':
        return {pots: action.pots, hasLoaded: true};
      case 'new':
        const pot = new Pot();
        state.pots.append(pot);
        this.persist(state, pot);
        return state;

      default:
        return state;
    }
  }

  persist(state: PotsStoreState, pot: Pot = null) {
    if (pot != null) {
      AsyncStorage.setItem('@Pot:' + pot.uuid, JSON.stringify(pot));
    }
    AsyncStorage.setItem('@Pots', JSON.stringify(state.map(p => p.uuid)));
  }

  loadPot(uuid: string): Pot {
    const loadedJson = AsyncStorage.getItem('@Pot:' + uuid);
    const loaded = JSON.parse(loadedJson);
    const pot = new Pot(uuid);
    if (value != null) {
      pot.title = loaded.title;
      pot.status = this.loadPotStatus(loaded.status);
      pot.images = loaded.images;
    }
    return pot;
  }

  loadPotStatus(l) {
    const s = {};
    for (key in Object.keys(PotStatus)) {
      if (key in l) {
        s[key] = new Date(l[key]);
      }
    }
    return s;
  }
}

export default new PotsStore();
