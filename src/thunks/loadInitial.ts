import { AsyncStorage } from "react-native";
import { Pot, IntermediatePot, Image2 } from "../models/Pot";
import { nameFromUri } from "../utils/imageutils";
import Status from "../models/Status";
import Notes from "../models/Notes";
import { ThunkAction, ThunkDispatch } from "redux-thunk";
import {
  FullState,
  ImportStatePersisted,
  ImageStoreState,
  PotsStoreState
} from "../reducers/types";
import { Action } from "../action";
import _ from "lodash";
import * as imageutils from "../utils/imageutils";

type PLThunkAction = ThunkAction<Promise<any>, FullState, undefined, Action>;
type PLThunkDispatch = ThunkDispatch<FullState, undefined, Action>;

export function reloadFromImport(): PLThunkAction {
  return async (dispatch: PLThunkDispatch) => {
    dispatch({
      type: "initial-pots-images"
    });
    await load(true);
    dispatch({
      type: "imported-metadata"
    });
  };
}

export function loadInitial(): PLThunkAction {
  return load(false);
}

function load(isImport: boolean): PLThunkAction {
  return async (dispatch: PLThunkDispatch) => {
    //console.log("starting load");
    let images = await loadInitialImages();
    let { pots, images2 } = await loadInitialPots(isImport);
    images2.forEach(([image, potId]) => {
      images = migrateFromImages2(images, image, potId);
    });
    const fixed = _fixPotsAndImages(pots, images);
    pots = fixed.pots;
    images = fixed.images;
    const importt = isImport ? null : await loadInitialImport();
    //console.log("will dispatch loaded-everything");
    dispatch({
      type: "loaded-everything",
      pots,
      images,
      isImport
    });
    console.log("loaded everything");

    // Save remote/local URIs
    // we probably don't care about the result of promise, since it's opportunistic
    // so I don't think we have to wait for it to continue
    // especially since we don't want to delay offering to resume the import
    // btw, it had to be after we dispatch "loaded-everything"
    // so that the image store won't ignore saves to files
    const promise = saveImagesToFiles(images);

    //console.log("will check importt");
    if (importt) {
      //console.log("will dispatch import-resume");
      dispatch({
        type: "import-resume",
        data: importt
      });
    }
  };
}

async function loadInitialPots(
  isImport: boolean
): Promise<{ pots: PotsStoreState; images2: [Image2, string][] }> {
  const keys = await AsyncStorage.getAllKeys();
  const allPotKeys = keys.filter(k => k.startsWith("@Pot:"));
  const potKvPairs = await AsyncStorage.multiGet([...allPotKeys, "@Pots"]);
  let potIdsJson = null;
  let potsJson: { [uuid: string]: string } = {};
  potKvPairs.forEach(([key, val]) => {
    if (key.startsWith("@Pot:")) {
      const potId = key.substring(5);
      potsJson[potId] = val;
    }
    if (key === "@Pots") {
      potIdsJson = val;
    }
  });
  const { potIds, pots, images2 } = loadInitialPotsFromJson(
    isImport,
    potIdsJson,
    potsJson
  );
  return {
    pots: {
      potIds,
      pots,
      hasLoaded: true
    },
    images2
  };
}

function loadInitialPotsFromJson(
  isImport: boolean,
  potIdsJson: string | null,
  allPotsJson: { [key: string]: string | null }
): {
  potIds: string[];
  pots: { [uuid: string]: Pot };
  images2: [Image2, string][];
} {
  let potIds: string[] = [];
  if (potIdsJson) {
    try {
      potIds = JSON.parse(potIdsJson) || [];
    } catch (error) {
      console.warn("Pot load failed to parse: " + potIdsJson);
      // Cannot continue... the @Pots key is truthy but is not json-encoded?
      throw error;
    }
  }
  const pots: { [uuid: string]: Pot } = {};
  const allImages2: [Image2, string][] = [];
  potIds.forEach(id => {
    const json = allPotsJson[id];
    if (!json) {
      console.warn(`@Pots has ${id} but there is no @Pot:${id} key`);
      return;
    }
    const { pot, images2 } = loadPotFromJson(json);
    if (pot) {
      pots[id] = pot;
    }
    if (images2) {
      images2.forEach(pair => {
        allImages2.push(pair);
      });
    }
  });
  return { pots, potIds, images2: allImages2 };
}

// async function loadPot(dispatch: Dispatch, uuid: string): Promise<Pot | null> {
//   const loadedJson = await AsyncStorage.getItem("@Pot:" + uuid);
//   return loadPotFromJson(loadedJson);
// }

function loadPotFromJson(
  loadedJson: string | null
): { pot: Pot | null; images2: [Image2, string][] } {
  if (!loadedJson) {
    return { pot: null, images2: [] };
  }
  const images2: [Image2, string][] = [];
  let loaded;
  try {
    loaded = JSON.parse(loadedJson);
  } catch (error) {
    console.log("Pot failed to parse: " + loadedJson);
    console.warn(error);
    return { pot: null, images2: [] };
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
    pot.images2.forEach(i => images2.push([i, pot.uuid])); // will add these to the image store
    pot.images3 = [];
    for (const image of pot.images2) {
      pot.images3.push(nameFromUri(image.localUri));
    }
  }
  delete pot.images;
  delete pot.images2;
  return { pot, images2 };
}

async function loadInitialImages(): Promise<ImageStoreState> {
  console.log("Loading ImageStore");
  const json = await AsyncStorage.getItem("@ImageStore");

  if (!json) {
    console.log("There was no ImageStore to load.");
    return { images: {}, loaded: true };
  }
  // Don't catch this because we would rather throw to see wtf happened here
  const parsed = JSON.parse(json);
  return { images: parsed.images || {}, loaded: true };
}

export const IMPORT_STORAGE_KEY = "@Import";

async function loadInitialImport(): Promise<ImportStatePersisted | null> {
  //console.log("loading improt");
  const json = await AsyncStorage.getItem(IMPORT_STORAGE_KEY);
  //console.log("from asyncstorage got", json);
  if (!json) {
    return null;
  }
  let existing: ImportStatePersisted;
  try {
    existing = JSON.parse(json);
  } catch (e) {
    // Import state is not really vital so we're ok catching
    return null;
  }
  if (existing.imageMap && Object.keys(existing.imageMap).length > 0) {
    return existing;
  }
  return null;
}

function migrateFromImages2(
  state: ImageStoreState,
  image: Image2,
  potId: string
): ImageStoreState {
  const newState = { loaded: true, images: { ...state.images } };
  const name = nameFromUri(image.localUri);

  if (newState.images[name]) {
    // This image exists for another pot already
    if (newState.images[name].pots.indexOf(potId) === -1) {
      newState.images[name] = {
        ...newState.images[name],
        pots: [...newState.images[name].pots, potId]
      };
    }
  } else {
    // New image
    newState.images[name] = {
      ...image,
      name,
      pots: [potId]
    };
  }

  return newState;
}

// exported for testing
export function _fixPotsAndImages(
  pots: PotsStoreState,
  images: ImageStoreState
): { pots: PotsStoreState; images: ImageStoreState } {
  // Delete images with no URIs
  images = deleteImagesWithNoUri(images);

  // Make images refer to the pots they're used by
  // Delete images that aren't referenced by any pots
  // Including delete file/remote
  images = fixImagesPotListsAndDeleteUnused(images, pots);

  // Remove pot references to images that don't exist
  pots = removeBrokenImageRefs(pots, images);

  return { pots, images };
}

function deleteImagesWithNoUri(images: ImageStoreState): ImageStoreState {
  const toDelete: string[] = [];
  _.forOwn(images.images, image => {
    if (!image.remoteUri && !image.fileUri && !image.localUri) {
      toDelete.push(image.name);
    }
  });
  const newImages = { ...images, images: { ...images.images } };
  toDelete.forEach(imageName => delete newImages.images[imageName]);
  return newImages;
}

function fixImagesPotListsAndDeleteUnused(
  images: ImageStoreState,
  pots: PotsStoreState
): ImageStoreState {
  const newState = { ...images, images: { ...images.images } };
  _.forOwn(images.images, image => {
    const newImage = { ...image };
    newImage.pots = potsUsingImage(image.name, pots);
    if (newImage.pots.length === 0) {
      // No pots are using the image
      imageutils.deleteUnusedImage(newImage);
      delete newState.images[image.name];
    } else {
      newState.images[image.name] = newImage;
    }
  });
  return newState;
}

function saveImagesToFiles(images: ImageStoreState) {
  const promises: Array<Promise<void>> = [];
  _.forOwn(images.images, image => {
    if (image.fileUri) {
      return;
    }
    if (image.remoteUri) {
      promises.push(
        imageutils.saveToFile(image.remoteUri, true /* isRemote */)
      );
      return;
    }
    if (image.localUri) {
      promises.push(imageutils.saveToFile(image.localUri));
      return;
    }
  });
  return Promise.all(promises);
}

function removeBrokenImageRefs(
  pots: PotsStoreState,
  images: ImageStoreState
): PotsStoreState {
  const newPots = { ...pots, pots: { ...pots.pots } };
  _.forOwn(pots.pots, pot => {
    const newImages3 = [...pot.images3];
    _.remove(newImages3, img => !images.images[img]);
    newPots.pots[pot.uuid] = { ...pots.pots[pot.uuid], images3: newImages3 };
  });
  return newPots;
}

function potsUsingImage(image: string, potState: PotsStoreState): string[] {
  if (!potState.hasLoaded) {
    throw new Error("Cannot call potsUsingImage before pot store loaded");
  }
  const potsUsingImage: string[] = [];
  _.values(potState.pots).map(pot => {
    pot.images3.forEach((img: string) => {
      if (img === image) {
        potsUsingImage.push(pot.uuid);
      }
    });
  });
  return potsUsingImage;
}
