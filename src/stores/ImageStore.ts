
import { FileSystem } from 'expo';
import {ReduceStore} from 'flux/utils';
import _ from 'lodash';
import { AsyncStorage } from 'react-native';
import { Action, ImageState } from '../action';
import dispatcher from '../AppDispatcher';
import * as ImageUploader from '../uploader';
import {StorageWriter} from './sync';

export interface ImageStoreState {
  images: {[name: string]: ImageState};
}

class CImageStore extends ReduceStore<ImageStoreState, Action> {
  constructor() {
    super(dispatcher);
  }
  public getInitialState(isImport?: boolean): ImageStoreState {
    this._loadInitial(!!isImport);
    return {
      images: {},
    };
  }

  public async _loadInitial(isImport?: boolean) {
    console.log('Loading ImageStore');
    const json = await AsyncStorage.getItem('@ImageStore');

    if (!json) {
      console.log('There was no ImageStore to load.');
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
      console.log('Failed to parse: ' + json);
      console.warn(e);
    }
  }

  public reduce(state: ImageStoreState, action: Action): ImageStoreState {
    switch (action.type) {
      case 'image-delete-from-pot': {
        const im = state.images[action.imageName];
        if (!im) {
          console.log('Deleting ' + action.imageName + " from pot but it's nowhere");
          return state;
        }
        const newState = {images: {...state.images,
                                   [action.imageName]:
            {...im, pots: im.pots.filter((p) => p !== action.potId)},
        }};
        if (newState.images[action.imageName].pots.length === 0) {
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
      case 'pot-delete': {
        const newState = {images: {...state.images}};
        for (const name of action.imageNames) {
          const oldI = newState.images[name];
          if (!oldI) { continue; }
          const newI = {...oldI, pots: oldI.pots.filter((p) => p !== action.potId)};
          newState.images[name] = newI;
          if (newI.pots.length === 0) {
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
        _.forOwn(newState.images, (image, imageName) => {
          if (!image.remoteUri && !image.fileUri && !image.localUri) {
            // the cached image was deleted before we could move it somewhere permanent :'(
            // If any pots refer to this image then the pot store must handle that
            delete newState.images[imageName];
          }
          if (image.pots && image.pots.length === 0) {
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
        });
        this.persist(newState);
        return newState;
      }
      case 'image-add': {
        const name = nameFromUri(action.localUri);
        const newState = {images: {...state.images, [name]: {
          name,
          localUri: action.localUri,
          pots: [action.potId],
        }}};
        this.saveToFile(action.localUri);
        this.persist(newState);
        return newState;
      }
      case 'pot-copy': {
        const newState = {images: {...state.images}};
        for (const name of action.imageNames) {
          newState.images[name] = {
            ...newState.images[name],
            pots: [...newState.images[name].pots, action.potId],
          };
        }
        this.persist(newState);
        return newState;
      }
      case 'migrate-from-images2': {
        const newState = {images: {...state.images}};
        for (const image of action.images2) {
          const localUri = image.localUri;
          const remoteUri = image.remoteUri;
          const name = nameFromUri(localUri);
          if (newState.images[name]) {
            // This image exists for another pot already
            if (newState.images[name].pots.indexOf(action.potId) === -1) {
              newState.images[name] = {
                ...newState.images[name],
                pots: [...newState.images[name].pots, action.potId],
              };
            }
          } else {
            // New image
            newState.images[name] = {
              name, localUri, remoteUri,
              pots: [action.potId],
            };
          }
        }
        // this.persist(newState);
        console.log('Migrated images (omitted)'); // , newState);
        return newState;
      }
      case 'loaded': { // Pots loaded
        if (action.isImport) {
          return state;
        }
        const newState = {images: {...state.images}};
        let modified = false;
        _.forOwn(state.images, (image, imageName) => {
          const newImage = {...image};
          if (newImage.pots === undefined) {
            modified = true;
            newImage.pots = [];
          }
          const newPots = [];
          for (const pot of newImage.pots) {
            if (action.potIds.indexOf(pot) >= 0 && newPots.indexOf(pot) === -1) {
              newPots.push(pot);
            }
          }
          // this might modify the state but we won't mark it modified
          newImage.pots = newPots;
          if (newPots.length === 0) {
            console.log('Uh, an unused image: ' + imageName);
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
        });
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
        console.log('Fixing image ' + i.name);
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
        if (state.images[action.name] === undefined) {
          console.warn('Image file created, but no image exists for it! This is quite bad, probably.');
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

  public saveToFile(uri: string, isRemote = false, isRetry = false) {
    // console.log("Will save " + uri);
    const onError = () => {
      /*if (uri) {
        console.log("saveToFile FAILED on " + nameFromUri(uri));
      } else {
        console.log("saveToFile FAILED on " + uri);
      }*/
      dispatcher.dispatch({type: 'image-file-failed', uri});
    };
    if (!uri) {
      console.warn('No URI passed to saveToFile');
      setTimeout(onError, 0);
      return;
    }
    const name = nameFromUri(uri);
    const random = Math.floor((Math.random() * 1000000) + 1);
    const dir = FileSystem.documentDirectory + random;
    FileSystem.makeDirectoryAsync(dir, {intermediates: true}).then(() => {
      const fileUri = dir + '/' + name;
      const afterCopy = () => {
        // console.log("saveToFile SUCCESS on " + name);
        dispatcher.dispatch({
          type: 'image-file-created',
          name, fileUri,
        });
      };
      if (isRemote) {
        // console.log("saveToFile starting " + name);
        FileSystem.downloadAsync(uri, fileUri).then(afterCopy).catch(onError);
      } else {
        // console.log("Will copyAsync");
        FileSystem.copyAsync({from: uri, to: fileUri}).then(afterCopy).catch((reason) => {
          // Local cache is missing. Nothing to do, but don't crash or dispatch success message.
          console.warn(reason);
          onError();
        });
      }
      // console.log("Save of " + uri + " initiated.");
    });
  }

  public deleteFile(uri: string) {
    FileSystem.deleteAsync(uri, {idempotent: true});
  }

  public persist(state: ImageStoreState) {
    // console.log("Persisting ImageStore");
    StorageWriter.put('@ImageStore', JSON.stringify(state));
  }
}

export const ImageStore = new CImageStore();

export function nameFromUri(uri: string): string {
  const uriParts = uri.split('/');
  return uriParts[uriParts.length - 1];
}

export function nameToUri(name: string): string {
  const i = ImageStore.getState().images[name];
  if (!i) {
    console.log('That image named ' + name + ' is not in the image store.');
    return '';
  }
  return i.fileUri || i.localUri || i.remoteUri || '';
}

export function nameToImageState(name: string): ImageState | null {
  const i = ImageStore.getState().images[name];
  if (!i) {
    console.log('That image named ' + name + ' is not in the image store.');
    return null;
  }
  return i;
}
