import { Action } from "../action";
import Notes from "../models/Notes";
import { Pot } from "../models/Pot";
import Status from "../models/Status";
import { StorageWriter } from "../utils/sync";
import store from "./store";
import { PotsStoreState, ImageState } from "./types";
import { loadInitialPots } from "../thunks/loadInitial";

export function getInitialState(): PotsStoreState {
  return { pots: {}, potIds: [], hasLoaded: false };
}

export function reducePots(
  state: PotsStoreState = getInitialState(),
  action: Action
): PotsStoreState {
  switch (action.type) {
    case "loaded": {
      let newState: PotsStoreState = {
        pots: action.pots,
        potIds: action.potIds,
        hasLoaded: true,
        imagesLoaded: state.imagesLoaded
      };
      if (state.imagesLoaded && !action.isImport) {
        // Can't delete images if this is an import, because the image state may be from before the import
        newState = deleteBrokenImages(newState, { images: state.imagesLoaded });
      }
      return newState;
    }
    case "new": {
      // dispatcher.waitFor(['loaded']);
      const pot = {
        uuid: String(Math.random()).substring(2),
        title: "New Pot",
        images3: [],
        status: new Status({ thrown: new Date() }),
        notes2: new Notes()
      };
      const newState = {
        ...state,
        potIds: [...state.potIds, pot.uuid],
        pots: { ...state.pots, [pot.uuid]: pot }
      };
      persist(newState, pot);
      setTimeout(
        () => store.dispatch({ type: "page-new-pot", potId: pot.uuid }),
        0
      );
      return newState;
    }
    case "pot-edit-field": {
      const newPot = {
        ...state.pots[action.potId],
        [action.field]: action.value
      };
      const newState = {
        ...state,
        pots: {
          ...state.pots,
          [action.potId]: newPot
        }
      };
      persist(newState, newPot);
      return newState;
    }
    case "pot-delete": {
      const potIndex = state.potIds.indexOf(action.potId);
      const newPots = { ...state.pots };
      delete newPots[action.potId];
      const newPotIds = [...state.potIds];
      if (potIndex > -1) {
        newPotIds.splice(potIndex, 1);
        StorageWriter.delete("@Pot:" + action.potId);
      }
      const newState = {
        hasLoaded: true,
        imagesLoaded: state.imagesLoaded,
        pots: newPots,
        potIds: newPotIds
      };
      persist(newState);
      console.log("will navigate to page list");
      setTimeout(() => store.dispatch({ type: "page-list" }), 1);
      return newState;
    }
    case "pot-copy": {
      const oldPot = state.pots[action.potId];
      const oldTitleWords = oldPot.title.split(" ");
      const lastWordIndex = oldTitleWords.length - 1;
      const lastWord = oldTitleWords[lastWordIndex];
      const newTitle = isNaN(Number(lastWord))
        ? oldTitleWords.join(" ") + " 2"
        : oldTitleWords.slice(0, lastWordIndex).join(" ") +
          " " +
          (1 + parseInt(lastWord, 10));
      const pot = {
        ...oldPot,
        uuid: String(Math.random()).substring(2),
        title: newTitle
      };
      const newState = {
        ...state,
        potIds: [...state.potIds, pot.uuid],
        pots: { ...state.pots, [pot.uuid]: pot }
      };
      persist(newState, pot);
      setTimeout(
        () => store.dispatch({ type: "page-new-pot", potId: pot.uuid }),
        1
      );
      return newState;
    }
    case "image-state-loaded": {
      if (state.hasLoaded && !action.isImport) {
        return deleteBrokenImages(state, { images: action.images });
      } else {
        return { ...state, imagesLoaded: action.images };
      }
    }
    case "reload": {
      setTimeout(() => store.dispatch(loadInitialPots(false /* isImport */)));
      return getInitialState();
    }
    case "imported-metadata": {
      setTimeout(() => store.dispatch(loadInitialPots(true /* isImport */)));
      return getInitialState();
    }
    default:
      return state;
  }
}

function persist(state: PotsStoreState, pot?: Pot) {
  if (pot !== undefined) {
    StorageWriter.put("@Pot:" + pot.uuid, JSON.stringify(pot));
  }
  StorageWriter.put("@Pots", JSON.stringify(state.potIds));
}

function deleteBrokenImages(
  state: PotsStoreState,
  imageState: { images: { [name: string]: ImageState } }
): PotsStoreState {
  // Modify the PotsStoreState to not refer to any images that are nonexistent or broken.
  const newState = { ...state };
  newState.pots = {};
  state.potIds.forEach(potId => {
    const pot = { ...state.pots[potId] };
    const newImages3 = pot.images3.filter((imageName: string) => {
      const image = imageState.images[imageName];
      if (!image) {
        console.log("Forgetting a gone image");
        return false;
      }
      if (!image.localUri && !image.remoteUri && !image.fileUri) {
        console.log("Forgetting a broken image");
        return false;
      }
      return true;
    });
    newState.pots[potId] = pot;
    if (newImages3.length !== pot.images3.length) {
      pot.images3 = newImages3;
      persist(newState, pot);
    }
  });
  return newState;
}
