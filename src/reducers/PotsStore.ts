import { AsyncStorage } from "react-native";
import { Action } from "../action";
import Notes from "../models/Notes";
import { IntermediatePot, Pot } from "../models/Pot";
import Status from "../models/Status";
import { nameFromUri } from "../utils/imageutils";
import { StorageWriter } from "../utils/sync";
import store from "./store";
import { Dispatch } from "redux";
import { PotsStoreState, ImageState } from "./types";

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

export function loadInitialPots(isImport: boolean) {
  return async (dispatch: Dispatch) => {
    const potIdsStr = (await AsyncStorage.getItem("@Pots")) || "";
    let potIds: string[] = [];
    if (potIdsStr) {
      try {
        potIds = JSON.parse(potIdsStr) || [];
      } catch (error) {
        console.warn("Pot load failed to parse: " + potIdsStr);
        console.warn(error);
      }
    }
    const promises = [];
    for (const potId of potIds) {
      promises.push(loadPot(dispatch, potId));
    }
    const pots = await Promise.all(promises);
    const potsById: { [uuid: string]: Pot } = {};
    pots.forEach(p => {
      if (p) {
        potsById[p.uuid] = p;
      }
    });
    return dispatch({
      type: "loaded",
      pots: potsById,
      potIds,
      isImport: !!isImport
    });
  };
}

async function loadPot(dispatch: Dispatch, uuid: string): Promise<Pot | null> {
  const loadedJson = await AsyncStorage.getItem("@Pot:" + uuid);
  if (!loadedJson) {
    return null;
  }

  let loaded;
  try {
    loaded = JSON.parse(loadedJson);
  } catch (error) {
    console.log("Pot failed to parse: " + loadedJson);
    console.warn(error);
    return null;
  }
  // Add all fields, for version compatibility
  const pot: IntermediatePot = { ...loaded };
  pot.status =
    typeof loaded.status === "string"
      ? new Status(JSON.parse(loaded.status))
      : new Status(loaded.status);

  pot.notes2 =
    typeof loaded.notes2 === "string"
      ? new Notes(JSON.parse(loaded.notes2))
      : new Notes(loaded.notes2);

  if (loaded.notes !== undefined && typeof loaded.notes !== "string") {
    delete pot.notes;
  }
  if (loaded.images !== undefined && loaded.images2 === undefined) {
    // migrate - read the old data and convert to the new one, Miles said
    // it's ok for his old clients to lose the images.
    console.log("Migrating images 1-2.");
    pot.images2 = [];
    for (const image of loaded.images) {
      pot.images2.push({
        localUri: image
      });
    }
  }
  if (pot.images2 !== undefined && pot.images3 === undefined) {
    console.log("Migrating images 2-3.");
    dispatch({
      type: "migrate-from-images2",
      images2: pot.images2,
      potId: pot.uuid
    });
    pot.images3 = [];
    for (const image of pot.images2) {
      pot.images3.push(nameFromUri(image.localUri));
    }
  }
  delete pot.images;
  delete pot.images2;
  return pot;
}
