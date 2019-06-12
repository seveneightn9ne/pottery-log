import { Dispatch } from "redux";
import { AsyncStorage } from "react-native";
import { Pot, IntermediatePot } from "../models/Pot";
import { nameFromUri } from "../utils/imageutils";
import Status from "../models/Status";
import Notes from "../models/Notes";
import { ThunkAction } from "redux-thunk";
import { FullState, ImportStatePersisted } from "../reducers/types";
import { Action } from "../action";

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

export function loadInitialImages(
  isImport?: boolean
): ThunkAction<Promise<any>, FullState, undefined, Action> {
  return async (dispatch: Dispatch) => {
    console.log("Loading ImageStore");
    const json = await AsyncStorage.getItem("@ImageStore");

    if (!json) {
      console.log("There was no ImageStore to load.");
      return dispatch({
        type: "image-state-loaded",
        images: {},
        isImport: !!isImport
      });
    }
    // Don't catch this because we would rather throw to see wtf happened here
    const parsed = JSON.parse(json);
    return dispatch({
      type: "image-state-loaded",
      images: parsed.images || {}, // is || {} a horrible idea?
      isImport: !!isImport
    });
  };
}

export const IMPORT_STORAGE_KEY = "@Import";

export function loadInitialImport(): ThunkAction<
  Promise<any>,
  {},
  undefined,
  Action
> {
  return async (dispatch: Dispatch) => {
    const json = await AsyncStorage.getItem(IMPORT_STORAGE_KEY);
    if (!json) {
      return;
    }
    let existing: ImportStatePersisted;
    try {
      existing = JSON.parse(json);
    } catch (e) {
      return;
    }
    if (existing.imageMap && Object.keys(existing.imageMap).length > 0) {
      dispatch({
        type: "import-resume",
        data: existing
      });
    }
  };
}
