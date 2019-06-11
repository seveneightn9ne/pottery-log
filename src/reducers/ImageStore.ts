import { FileSystem } from "expo";
import _ from "lodash";
import { AsyncStorage } from "react-native";
import { Action } from "../action";
import * as utils from "../utils/imageutils";
import { StorageWriter } from "../utils/sync";
import * as ImageUploader from "../utils/uploader";
import { Dispatch } from "redux";
import store from "./store";
import { ThunkAction } from "redux-thunk";
import {
  ImageStoreState,
  ImageState,
  FullState,
  PotsStoreState
} from "./types";

export function getInitialState(): ImageStoreState {
  return {
    images: {},
    loaded: false
  };
}

export function reduceImages(
  state: ImageStoreState,
  action: Action,
  fullState: FullState
): ImageStoreState {
  const potsState = fullState.pots;
  if (action.type == "image-state-loaded") {
    // PotsStore also listens for this event, to do the corresponding deletions from the pots
    let newState = { loaded: true, images: { ...action.images } };
    if (action.isImport) {
      // Can skip persist if we aren't processing them.
      return newState;
    }
    _.forOwn(newState.images, (image, imageName) => {
      if (!image.remoteUri && !image.fileUri && !image.localUri) {
        // the cached image was deleted before we could move it somewhere permanent :'(
        // If any pots refer to this image then the pot store must handle that
        delete newState.images[imageName];
      }
      newState = deleteImageIfUnused(newState, potsState, imageName);
      if (!image.fileUri && image.remoteUri) {
        utils.saveToFile(image.remoteUri, true /* isRemote */);
      } else if (!image.fileUri && image.localUri) {
        utils.saveToFile(image.localUri);
      }
    });
    persist(newState);
    return newState;
  }
  if (!state.loaded) {
    // Nothing else can act on an unloaded imagestore
    console.log(
      "imagestore ignores " + action.type + " because it has not loaded"
    );
    return state;
  }
  switch (action.type) {
    case "image-delete-from-pot": {
      const im = state.images[action.imageName];
      if (!im) {
        console.log(
          "Deleting " + action.imageName + " from pot but it's nowhere"
        );
        return state;
      }
      let newState = {
        loaded: true,
        images: {
          ...state.images,
          [action.imageName]: {
            ...im,
            pots: im.pots.filter(p => p !== action.potId)
          }
        }
      };
      newState = deleteImageIfUnused(
        newState,
        potsState,
        action.imageName,
        action.potId
      );
      persist(newState);
      return newState;
    }
    case "pot-delete": {
      let newState = { loaded: true, images: { ...state.images } };
      for (const name of action.imageNames) {
        const oldI = newState.images[name];
        if (!oldI) {
          continue;
        }
        const newI = {
          ...oldI,
          pots: oldI.pots.filter(p => p !== action.potId)
        };
        newState.images[name] = newI;
        newState = deleteImageIfUnused(newState, potsState, name, action.potId);
      }
      persist(newState);
      return newState;
    }
    case "image-add": {
      const name = utils.nameFromUri(action.localUri);
      const newState = {
        loaded: true,
        images: {
          ...state.images,
          [name]: {
            name,
            localUri: action.localUri,
            pots: [action.potId]
          }
        }
      };
      utils.saveToFile(action.localUri);
      persist(newState);
      return newState;
    }
    case "pot-copy": {
      const newState = { loaded: true, images: { ...state.images } };
      for (const name of action.imageNames) {
        newState.images[name] = {
          ...newState.images[name],
          pots: [...newState.images[name].pots, action.potId]
        };
      }
      persist(newState);
      return newState;
    }
    case "migrate-from-images2": {
      const newState = { loaded: true, images: { ...state.images } };
      for (const image of action.images2) {
        const localUri = image.localUri;
        const remoteUri = image.remoteUri;
        const name = utils.nameFromUri(localUri);
        if (newState.images[name]) {
          // This image exists for another pot already
          if (newState.images[name].pots.indexOf(action.potId) === -1) {
            newState.images[name] = {
              ...newState.images[name],
              pots: [...newState.images[name].pots, action.potId]
            };
          }
        } else {
          // New image
          newState.images[name] = {
            name,
            localUri,
            remoteUri,
            pots: [action.potId]
          };
        }
      }
      // this.persist(newState);
      console.log("Migrated images (omitted)"); // , newState);
      return newState;
    }
    case "loaded": {
      // Pots loaded
      if (action.isImport) {
        return state;
      }
      let newState = { loaded: true, images: { ...state.images } };
      _.forOwn(state.images, (image, imageName) => {
        const newImage = { ...image };
        if (newImage.pots === undefined) {
          newImage.pots = [];
        }
        newImage.pots = potsUsingImage(imageName, potsState);
        newState.images[imageName] = newImage;
        newState = deleteImageIfUnused(newState, potsState, imageName);
      });
      persist(newState);
      return newState;
    }
    case "reload": {
      return getInitialState();
    }
    case "image-error-remote": {
      // There's nothing to do, I guess
      return state;
    }
    case "image-error-local": {
      const i = state.images[action.name];
      const newImage = { ...i };
      const newState = {
        loaded: true,
        images: {
          ...state.images,
          [action.name]: newImage
        }
      };
      console.log("Removing failed local URI for image " + i.name);
      delete newImage.localUri;
      return newState;
    }
    case "image-error-file": {
      const uri = action.uri;
      const documentDirectory = FileSystem.documentDirectory;
      ImageUploader.debug("image-error-file", { uri, documentDirectory });
      return state;
    }
    case "image-remote-failed": {
      // TODO(jessk) handle... by deleting the image
      // and removing it from its pot(s)
      // OR... who cares since we use files now
      return state;
    }
    case "image-loaded": {
      // Convert to a fileUri if needed
      const i = state.images[action.name];
      if (!i || i.fileUri) {
        return state;
      }
      if (i.localUri) {
        utils.saveToFile(i.localUri);
      } else if (i.remoteUri) {
        utils.saveToFile(i.remoteUri, true);
      }
      return state;
    }
    case "image-file-created": {
      if (state.images[action.name] === undefined) {
        console.warn(
          "Image file created, but no image exists for it! This is quite bad, probably."
        );
        return state;
      }
      const newImage = {
        ...state.images[action.name],
        fileUri: action.fileUri
      };
      if (newImage.remoteUri) {
        ImageUploader.remove(newImage.remoteUri);
        delete newImage.remoteUri;
      }
      delete newImage.localUri;
      const newState = {
        loaded: true,
        images: {
          ...state.images,
          [action.name]: newImage
        }
      };
      persist(newState);
      return newState;
    }
    case "imported-metadata": {
      setTimeout(() => store.dispatch(loadInitialImages(true /* isImport */)));
      return getInitialState();
    }
    default:
      return state;
  }
}

export function getImageState(
  state: ImageStoreState,
  name: string
): ImageState | null {
  const i = state.images[name];
  if (!i) {
    console.log("That image named " + name + " is not in the image store.");
    return null;
  }
  return i;
}

/* Private Helpers */

// modifies state.
// exceptForPot is a pot that's being deleted; or a pot from which this image is being explicitly deleted.
function deleteImageIfUnused(
  state: ImageStoreState,
  potsState: PotsStoreState,
  imageName: string,
  exceptForPot?: string
): ImageStoreState {
  const image = state.images[imageName];
  if (!image || !image.pots) {
    return state;
  }
  if (!potsState.hasLoaded) {
    // Do nothing before pot store loaded
    return state;
  }
  if (image.pots.length === 0) {
    // Note: We have seen a case where the saved state shows that only one pot uses an image,
    // but 2 pots are using the image. This makes sure we don't delete an image that is still
    // being used.
    const pots = potsUsingImage(imageName, potsState).filter(
      p => p !== exceptForPot
    ); // double check
    if (pots.length !== 0) {
      console.log(
        "Image was missing a pot, adding it instead of deleting image",
        imageName
      );
      image.pots = pots;
    } else {
      // Really no one is using this image
      console.log("Deleting unused image", imageName);
      if (image.remoteUri) {
        ImageUploader.remove(image.remoteUri);
      }
      if (image.fileUri) {
        utils.deleteFile(image.fileUri);
      }
      delete state.images[imageName];
    }
  }
  return state;
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

function persist(state: ImageStoreState) {
  // console.log("Persisting ImageStore");
  if (!state.loaded) {
    throw new Error("Cannot persist state before it's loaded");
  }
  StorageWriter.put("@ImageStore", JSON.stringify(state));
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
