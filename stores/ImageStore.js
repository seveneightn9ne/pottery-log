// @flow
import {ReduceStore} from 'flux/utils';
import dispatcher from '../AppDispatcher.js';
import {StorageWriter} from './sync.js';
import { AsyncStorage } from 'react-native';
import * as ImageUploader from '../ImageUploader.js';

interface ImageState {
  name: string,
  // localUri and remoteUri are deprecated
  // they will be converted to a fileUri
  localUri: ?string,
  remoteUri: ?string,
  fileUri: ?string,
  pots: string[],
}

interface ImageStoreState {
  images: {[name: string]: ImageState},
}

class _ImageStore extends ReduceStore<ImageStoreState> {
  constructor() {
    super(dispatcher);
  }
  getInitialState(): ImageStoreState {
    this._loadInitial();
    return {
      images: {},
    };
  }

  async _loadInitial() {
    console.log("Loading ImageStore");
    const json = await AsyncStorage.getItem("@ImageStore");

    if (!json) {
      console.log("There was no ImageStore to load.");
      return;
    }
    const parsed = JSON.parse(json);
    dispatcher.dispatch({
      type: 'image-state-loaded',
      images: parsed.images || {},
    });
  }

  reduce(state: ImageStoreState, action: Object): ImageStoreState {
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
      case 'image-remote-uri': {
        const im = state.images[action.name];
        const newState = {images: {...state.images,
          [action.name]:
            {...im, remoteUri: action.remoteUri},
        }};
        if (newState.images[action.name].pots.length == 0) {
          delete newState.images[action.name];
          ImageUploader.remove(action.remoteUri);
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
        const newState = {images: {...state.images}}
        for (let imageName in action.images) {
          if (state.images[imageName]) {
            console.log("Woah there, you want to load on top of this guy. Ok");
          }
          newState.images[imageName] = action.images[imageName];
          const image = action.images[imageName];
          if (image.pots && image.pots.length == 0) {
            if (image.remoteUri) {
              ImageUploader.remove(image.remoteUri);
            } 
            if (image.fileUri) {
              this.deleteFile(image.fileUri);
            }
            delete newState.images[imageName];
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
        const newState = {images: {...state.images}};
        const modified = false;
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
        const i = state.images[action.name];
        // TODO(jessk) handle... by deleting the image
        // and removing it from its pot(s)
        return state;
      }
      case 'image-loaded': {
        // Convert to a fileUri if needed
        const i = state.images[action.name];
        if (i.fileUri) {
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
        const newImage = {...state.images[action.name],
          fileUri: action.fileUri};
        if (newImage.remoteUri) {
          ImageUploader.remove(newImage.remoteUri);
          delete newImage.remoteUri;
        }
        delete newImage.localUri;
        const newState = {images: {...state.images,
          [action.name]: newImage}};
        if (newState.images[action.name].pots.length == 0) {
          delete newState.images[action.name];
          this.deleteFile(action.fileUri);
        }
        this.persist(newState);
        return newState;
      }
      default:
        return state;
    }
  }

  saveToFile(uri: string, isRemote = false) {
    const name = nameFromUri(uri);
    const fileUri = Expo.FileSystem.documentDirectory +  name;
    const afterCopy = () => dispatcher.dispatch({
      type: 'image-file-created',
      name, fileUri,
    });
    if (isRemote) {
      Expo.FileSystem.downloadAsync(uri, fileUri).then(afterCopy);
    } else {
      Expo.FileSystem.copyAsync({from: uri, to: fileUri}).then(afterCopy);
    }
  }

  deleteFile(uri: string) {
    Expo.FileSystem.deleteAsync(uri, {idempotent: true});
  }

  persist(state: ImageStoreState) {
    console.log("Persisting ImageStore");
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
  return i.fileUri || i.localUri || i.remoteUri;
}

export function nameToImageState(name: string) {
  const i = ImageStore.getState().images[name];
  if (!i) {
    console.log("That image named " + name + " is not in the image store.");
    return {};
  }
  return i;
}

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
