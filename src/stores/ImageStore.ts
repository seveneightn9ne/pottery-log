// @flow
import {ReduceStore} from 'flux/utils';
import dispatcher from '../AppDispatcher';
import {StorageWriter} from './sync';
import { AsyncStorage } from 'react-native';
import * as ImageUploader from '../uploader';
import { ImageState, Action } from '../action';
import { FileSystem } from 'expo';

interface ImageStoreState {
  images: {[name: string]: ImageState},
}

class _ImageStore extends ReduceStore<ImageStoreState, Action> {
  constructor() {
    super(dispatcher);
  }
  getInitialState(isImport?: boolean): ImageStoreState {
    this._loadInitial(!!isImport);
    return {
      images: {},
    };
  }

  async _loadInitial(isImport?: boolean) {
    console.log("Loading ImageStore");
    const json = await AsyncStorage.getItem("@ImageStore");

    if (!json) {
      console.log("There was no ImageStore to load.");
      return;
    }
    try {
      const parsed = JSON.parse(json);
      dispatcher.dispatch({
        type: 'image-state-loaded',
        images: parsed.images || {},
        isImport: !!isImport,
      });
    } catch (e) {
      console.log("Failed to parse: " + json);
      console.warn(e);
    }
  }

  reduce(state: ImageStoreState, action: Action): ImageStoreState {
    switch (action.type) {
      case 'image-delete-from-pot': {
        const im = state.images[action.imageName];
        if (!im) {
          console.log("Deleting " + action.imageName + " from pot but it's nowhere");
          return state;
        }
        const newState = {images: {...state.images,
          [action.imageName]:
            {...im, pots: im.pots.filter(p => p != action.potId)},
        }};
        if (newState.images[action.imageName].pots.length == 0) {
          if (im.remoteUri) {
            ImageUploader.remove(im.remoteUri);
          }
          if (im.fileUri) {
            this.deleteFile(im.fileUri);
          }
          delete newState.images[action.imageName];
        }
        this.persist(newState);
        return newState;
      }
      case 'image-delete-all-from-pot': {
        let newState = {images: {...state.images}};
        for (let i=0; i<action.imageNames.length; i++) {
          const oldI = newState.images[action.imageNames[i]];
          if (!oldI) continue;
          const newI = {...oldI, pots: oldI.pots.filter((p) => p != action.potId)};
          newState.images[action.imageNames[i]] = newI;
          if (newI.pots.length == 0) {
            if (newI.remoteUri) {
              ImageUploader.remove(newI.remoteUri);
            }
            if (newI.fileUri) {
              this.deleteFile(newI.fileUri);
            }
            delete newState.images[newI.name];
          }
        }
        this.persist(newState);
        return newState;
      }
      case 'image-state-loaded': {
        // PotsStore also listens for this event, to do the corresponding deletions from the pots
        const newState = {images: {...action.images}};
        if (action.isImport) {
          // Can skip persist if we aren't processing them.
          return newState;
        }
        for (let imageName in newState.images) {
          const image = newState.images[imageName];
          if (!image.remoteUri && !image.fileUri && !image.localUri) {
            // the cached image was deleted before we could move it somewhere permanent :'(
            // If any pots refer to this image then the pot store must handle that
            delete newState.images[imageName];
          }
          if (image.pots && image.pots.length == 0) {
            if (image.remoteUri) {
              ImageUploader.remove(image.remoteUri);
            }
            if (image.fileUri) {
              this.deleteFile(image.fileUri);
            }
            delete newState.images[imageName];
          }
          if (!image.fileUri && image.remoteUri) {
            this.saveToFile(image.remoteUri, true /* isRemote */);
          } else if (!image.fileUri && image.localUri) {
            this.saveToFile(image.localUri);
          }
        }
        this.persist(newState);
        return newState;
      }
      case 'image-add': {
        const name = nameFromUri(action.localUri);
        const newState = {images: {...state.images, [name]: {
          name: name,
          localUri: action.localUri,
          pots: [action.potId],
        }}};
        this.saveToFile(action.localUri);
        this.persist(newState);
        return newState;
      }
      case 'pot-copy': {
        const newState = {images: {...state.images}};
        for (let i=0; i<action.imageNames.length; i++) {
          const name = action.imageNames[i];
          newState.images[name] = {...newState.images[name],
            pots: [...newState.images[name].pots, action.potId]};
        }
        this.persist(newState);
        return newState;
      }
      case 'migrate-from-images2': {
        const newState = {images: {...state.images}};
        for (let i=0; i<action.images2.length; i++) {
          const localUri = action.images2[i].localUri;
          const remoteUri = action.images2[i].remoteUri;
          const name = nameFromUri(localUri);
          if (newState.images[name]) {
            // This image exists for another pot already
            if (newState.images[name].pots.indexOf(action.potId) == -1) {
              newState.images[name] = {...newState.images[name],
                pots: [...newState.images[name].pots, action.potId]};
            }
          } else {
            // New image
            newState.images[name] = {
              name, localUri, remoteUri,
              pots: [action.potId]
            }
          }
        }
        //this.persist(newState);
        console.log("Migrated images (omitted)"); //, newState);
        return newState;
      }
      case 'loaded': { // Pots loaded
        if (action.isImport) {
          return state;
        }
        const newState = {images: {...state.images}};
        let modified = false;
        for (let imageName in state.images) {
          const newImage = {...state.images[imageName]};
          if (newImage.pots == undefined) {
            modified = true;
            newImage.pots = [];
          }
          const newPots = [];
          for (let i=0; i < newImage.pots.length; i++) {
            if (action.potIds.indexOf(newImage.pots[i]) >= 0 &&
                newPots.indexOf(newImage.pots[i]) == -1) {
              newPots.push(newImage.pots[i]);
            }
          }
          // this might modify the state but we won't mark it modified
          newImage.pots = newPots;
          if (newPots.length == 0) {
            console.log("Uh, an unused image: " + imageName);
            if (newImage.remoteUri) {
              ImageUploader.remove(newImage.remoteUri);
            }
            if (newImage.fileUri) {
              this.deleteFile(newImage.fileUri);
            }
            delete newState.images[imageName];
            modified = true;
          }
          newState.images[imageName] = newImage;
        }
        if (modified) {
          this.persist(newState);
        }
        return newState;
      }
      case 'reload': {
        return this.getInitialState();
      }
      case 'image-error-remote': {
        // There's nothing to do, I guess
        return state;
      }
      case 'image-error-local': {
        const i = state.images[action.name];
        const newImage = {...i};
        const newState = {images: {...state.images,
          [action.name]: newImage}};
        console.log("Fixing image " + i.name);
        delete newImage.localUri;
        return newState;
      }
      case 'image-remote-failed': {
        // TODO(jessk) handle... by deleting the image
        // and removing it from its pot(s)
        return state;
      }
      case 'image-loaded': {
        // Convert to a fileUri if needed
        const i = state.images[action.name];
        if (!i || i.fileUri) {
          return state;
        }
        if (i.localUri) {
          this.saveToFile(i.localUri);
        } else if (i.remoteUri) {
          this.saveToFile(i.remoteUri, true);
        }
        return state;
      }
      case 'image-file-created': {
        if (state.images[action.name] == undefined) {
          console.warn("Image file created, but no image exists for it! This is quite bad, probably.");
          return state;
        }
        const newImage = {...state.images[action.name],
          fileUri: action.fileUri};
        if (newImage.remoteUri) {
          ImageUploader.remove(newImage.remoteUri);
          delete newImage.remoteUri;
        }
        delete newImage.localUri;
        const newState = {images: {...state.images,
          [action.name]: newImage}};

        // I don't think we really need to handle this here.
        // Maybe a checkRep or general cleanup function instead?
        /*if (newImage.pots.length == 0) {
          delete newState.images[action.name];
          this.deleteFile(action.fileUri);
        }*/
        this.persist(newState);
        return newState;
      }
      case 'imported-metadata': {
        return this.getInitialState(true /* isImport */);
      }
      default:
        return state;
    }
  }

  saveToFile(uri: string, isRemote = false, isRetry = false) {
    //console.log("Will save " + uri);
    const onError = () => {
      /*if (uri) {
        console.log("saveToFile FAILED on " + nameFromUri(uri));
      } else {
        console.log("saveToFile FAILED on " + uri);
      }*/
      dispatcher.dispatch({type: 'image-file-failed', uri});
    };
    if (!uri) {
      console.warn("No URI passed to saveToFile");
      setTimeout(onError, 0);
      return;
    }
    let name = nameFromUri(uri);
    let random = Math.floor((Math.random() * 1000000) + 1);
    let dir = FileSystem.documentDirectory + random;
    FileSystem.makeDirectoryAsync(dir, {intermediates: true}).then(() => {
      const fileUri = dir + '/' + name;
      const afterCopy = () => {
        //console.log("saveToFile SUCCESS on " + name);
        dispatcher.dispatch({
          type: 'image-file-created',
          name, fileUri,
        });
      };
      if (isRemote) {
        //console.log("saveToFile starting " + name);
        FileSystem.downloadAsync(uri, fileUri).then(afterCopy).catch(onError);
      } else {
        //console.log("Will copyAsync");
        FileSystem.copyAsync({from: uri, to: fileUri}).then(afterCopy).catch(reason => {
          // Local cache is missing. Nothing to do, but don't crash or dispatch success message.
          console.warn(reason);
          onError();
        });
      }
      //console.log("Save of " + uri + " initiated.");
    });
  }

  deleteFile(uri: string) {
    FileSystem.deleteAsync(uri, {idempotent: true});
  }

  persist(state: ImageStoreState) {
    //console.log("Persisting ImageStore");
    StorageWriter.put('@ImageStore', JSON.stringify(state));
  }
}

export const ImageStore = new _ImageStore();

export function nameFromUri(uri: string): string {
  let uriParts = uri.split('/');
  return uriParts[uriParts.length - 1];
}

export function nameToUri(name: string): string {
  const i = ImageStore.getState().images[name];
  if (!i) {
    console.log("That image named " + name + " is not in the image store.");
    return "";
  }
  return i.fileUri || i.localUri || i.remoteUri || "";
}

export function nameToImageState(name: string) {
  const i = ImageStore.getState().images[name];
  if (!i) {
    console.log("That image named " + name + " is not in the image store.");
    return {};
  }
  return i;
}

/**
 * @deprecated
 */
export function isAnySyncing(imageNames: string[]): boolean {
  const state = ImageStore.getState();
  for (let i=0; i<imageNames.length; i++) {
    const image = state.images[imageNames[i]];
    if (image === undefined) continue;
    if (!image.fileUri) return true;
    if (image.pots.length == 0) return true;
  }
  return false;
}
