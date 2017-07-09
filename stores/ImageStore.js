// @flow
import {ReduceStore} from 'flux/utils';
import {Image} from '../models/Pot.js';
import dispatcher from '../AppDispatcher.js';
import {StorageWriter} from './sync.js';
import { AsyncStorage } from 'react-native';
import * as ImageUploader from '../ImageUploader.js';

interface ImageState {
  name: string,
  localUri: string,
  remoteUri: string,
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
          //delete newState.images[action.imageName];
          if (im.remoteUri) {
            ImageUploader.remove(im.remoteUri);
          } else {
            delete newState.images[action.imageName];
          }
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
          //delete newState.images[action.name];
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
            //delete newState.images[newI.name];
            if (newI.remoteUri) {
              ImageUploader.remove(newI.remoteUri);
            } else {
              delete newState.images[newI.name];
            }
          }
        }
        this.persist(newState);
        return newState;
      }
      case 'image-delete-succeeded': {
        const newState = {...state};
        if (newState.images[action.imageName]) {
          delete newState.images[action.imageName];
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
            //delete newState.images[imageName]
            if (image.remoteUri) {
              ImageUploader.remove(image.remoteUri);
            } else {
              delete newState.images[imageName];
            }
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
        ImageUploader.upload(action.localUri);
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
          if (!remoteUri) {
            ImageUploader.upload(localUri);
          }
        }
        this.persist(newState);
        console.log("Migrated images", newState);
        return newState;
      }
      case 'loaded': { // Pots loaded
        const newState = {images: {...state.images}};
        for (let imageName in state.images) {
          const newImage = {...state.images[imageName]};
          const newPots = [];
          for (let i=0; i < newImage.pots.length; i++) {
            if (action.potIds.indexOf(newImage.pots[i]) >= 0 &&
                newPots.indexOf(newImage.pots[i]) == -1) {
              newPots.push(newImage.pots[i]);
            }
          }
          newImage.pots = newPots;
          if (newPots.length == 0) {
            console.log("Uh, an unused image: " + imageName);
            //delete newState.images[imageName];
            if (newImage.remoteUri) {
              ImageUploader.remove(newImage.remoteUri);
            } else {
              delete newState.images[imageName];
            }
          }
          newState.images[imageName] = newImage;
        }
        this.persist(newState);
        return newState;
      }
      case 'reload': {
        return this.getInitialState();
      }
      case 'image-error': {
        const i = state.images[action.name];
        console.log("Fixing image " + i.name);
        if (action.uri == i.remoteUri) {
          // Re upload it
          ImageUploader.upload(state.images[action.name].localUri);
        }
        return state;
      }
      case 'image-remote-failed': {
        const i = state.images[action.name];
        // TODO(jessk) handle... by deleting the image
        // and removing it from its pot(s)
      }
      default:
        return state;
    }
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
  return i.remoteUri || i.localUri;
}

export function isAnySyncing(imageNames: string[]): boolean {
  const state = ImageStore.getState();
  for (let i=0; i<imageNames.length; i++) {
    const image = state.images[imageNames[i]];
    if (image === undefined) continue;
    if (!image.remoteUri) return true;
    if (image.pots.length == 0) return true;
  }
  return false;
}
