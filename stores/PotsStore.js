// @flow
import {ReduceStore} from 'flux/utils';
import {Pot, Image} from '../models/Pot.js';
import Status from '../models/Status.js';
import Notes from '../models/Notes.js';
import dispatcher from '../AppDispatcher.js';
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
          images2: [],
          status: new Status({thrown: new Date()}),
          notes2: new Notes(),
          //notes: [],
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
          AsyncStorage.removeItem('@Pot:' + action.potId);
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
      case 'image-remote-uri': {
        const newPots = {};
        Object.keys(state.pots).forEach(uuid => {
          pot = state.pots[uuid];
          newPot = {...pot};
          newPot.images2 = newPot.images2.map((img) => {
            if (img.localUri == action.localUri) {
              console.log("Set a remote uri " + action.remoteUri + " for pot " + pot.uuid);
              return {
                localUri: img.localUri,
                remoteUri: action.remoteUri,
              };
            }
            return img;
          });
          newPots[uuid] = newPot;
        });
        console.log("Pots: ", newPots);
        return {
          ...state,
          pots: newPots,
        };
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
  const potIds = JSON.parse(potIdsStr) || [];
  const pots = {};
  for (let i = 0; i < potIds.length; i++) {
    const pot = await loadPot(potIds[i]);
    pots[potIds[i]] = pot;
  }
  dispatcher.dispatch({type: 'loaded', pots: pots, potIds: potIds});
}

async function loadPot(uuid: string): Pot {
  const loadedJson = await AsyncStorage.getItem('@Pot:' + uuid);
  console.log("Loading pot from storage: " + loadedJson);
  //const pot = {uuid};
  if (loadedJson != null) {
    const loaded = JSON.parse(loadedJson);
    // Add all fields, for version compatibility
    pot = {...loaded};
    pot.status = new Status(loaded.status);
    pot.notes2 = new Notes(loaded.notes2);
    if (loaded.notes != undefined && typeof(loaded.notes) != "string") {
      // Nope nope nope - killing this format.
      pot.notes = undefined;
    }
    if (loaded.images != undefined && loaded.images2 == undefined) {
      // migrate - read the old data and convert to the new one, Miles said
      // it's ok for his old clients to lose the images.
      console.log("Migrating images.")
      pot.images2 = [];
      for (let i=0; i<loaded.images.length; i++) {
        pot.images2.push({
          localUri: loaded.images[i],
        });
      }
    }
    pot.images = undefined;
    console.log("Done building pot", pot);
    return pot;
  }
  return {uuid};
}

export default new PotsStore();
