// @flow
import {ReduceStore} from 'flux/utils';
import {Pot} from '../models/Pot.js';
import Status from '../models/Status.js';
import Notes from '../models/Notes.js';
import dispatcher from '../AppDispatcher.js';
import {StorageWriter} from './sync.js';
import { AsyncStorage } from 'react-native';
import { LegacyAsyncStorage } from 'expo';
import {nameFromUri} from './ImageStore.js';

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
          images3: [],
          status: new Status({thrown: new Date()}),
          notes2: new Notes(),
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
      case 'pot-delete': {
        const potIndex = state.potIds.indexOf(action.potId);
        const newPots = {...state.pots, [action.potid]: undefined};
        const newPotIds = [...state.potIds];
        if (potIndex > -1) {
          newPotIds.splice(potIndex, 1);
          StorageWriter.delete('@Pot:' + action.potId);
        }
        const newState = {
          hasLoaded: true,
          pots: newPots,
          potIds: newPotIds,
        }
        this.persist(newState);
        console.log("will navigate to page list");
        setTimeout(() => dispatcher.dispatch({type: 'page-list'}), 1);
        return newState;
      }
      case 'pot-copy': {
        const oldPot = state.pots[action.potId];
        const oldTitleWords = oldPot.title.split(" ");
        const lastWordIndex = oldTitleWords.length - 1;
        const lastWord = oldTitleWords[lastWordIndex];
        const newTitle = isNaN(lastWord) ? oldTitleWords.join(" ") + " 2" :
            oldTitleWords.slice(0, lastWordIndex).join(" ") + " " + (1 + parseInt(lastWord));
        const pot = {
          ...oldPot,
          uuid: String(Math.random()).substring(2),
          title: newTitle,
        }
        const newState = {
          ...state,
          potIds: [...state.potIds, pot.uuid],
          pots: {...state.pots, [pot.uuid]: pot}
        };
        this.persist(newState, pot);
        setTimeout(() => dispatcher.dispatch({type: 'page-new-pot', potId: pot.uuid}), 1);
        return newState;
      }
      default:
        return state;
    }
  }

  persist(state: PotsStoreState, pot: Pot = null) {
    if (pot != null) {
      StorageWriter.put('@Pot:' + pot.uuid, JSON.stringify(pot));
    }
    StorageWriter.put('@Pots', JSON.stringify(state.potIds));
  }

}

async function loadInitial(dispatcher): void {
  await LegacyAsyncStorage.migrateItems(['@Pots']);
  const potIdsStr = await AsyncStorage.getItem('@Pots');
  const potIds = JSON.parse(potIdsStr) || [];
  await LegacyAsyncStorage.migrateItems(potIds.map(p => '@Pot:' + p));
  const promises = [];
  for (let i = 0; i < potIds.length; i++) {
    promises.push(loadPot(potIds[i]));
  }
  Promise.all(promises).then((pots) => {
    const potsById = {};
    pots.forEach(p => potsById[p.uuid] = p);
    dispatcher.dispatch({type: 'loaded', pots: potsById, potIds: potIds});
  });
}

async function loadPot(uuid: string): Pot {
  const loadedJson = await AsyncStorage.getItem('@Pot:' + uuid);
  console.log("Loading pot from storage: " + loadedJson);
  if (loadedJson != null) {
    const loaded = JSON.parse(loadedJson);
    // Add all fields, for version compatibility
    pot = {...loaded};
    pot.status = new Status(loaded.status);
    pot.notes2 = new Notes(loaded.notes2);

    if (loaded.notes != undefined && typeof(loaded.notes) != "string") {
      delete pot.notes;
    }
    if (loaded.images != undefined && loaded.images2 == undefined) {
      // migrate - read the old data and convert to the new one, Miles said
      // it's ok for his old clients to lose the images.
      console.log("Migrating images 1-2.")
      pot.images2 = [];
      for (let i=0; i<loaded.images.length; i++) {
        pot.images2.push({
          localUri: loaded.images[i],
        });
      }
    }
    if (pot.images2 != undefined && pot.images3 == undefined) {
      console.log("Migrating images 2-3.");
      dispatcher.dispatch({
        type: 'migrate-from-images2',
        images2: pot.images2,
        potId: pot.uuid,
      });
      pot.images3 = [];
      for (let i=0; i<pot.images2.length; i++) {
        pot.images3.push(nameFromUri(pot.images2[i].localUri));
      }
    }
    delete pot.images;
    delete pot.images2;
    console.log("Done building pot", pot);
    return pot;
  }
  return {
    uuid,
    status: new Status(),
    notes2: new Notes(),
    images3: [],
  };
}

export default new PotsStore();
