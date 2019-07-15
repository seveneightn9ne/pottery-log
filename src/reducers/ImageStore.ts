import * as FileSystem from 'expo-file-system';
import _ from 'lodash';
import { Action } from '../action';
import * as utils from '../utils/imageutils';
import * as ImageUploader from '../utils/uploader';
import { ImageState, ImageStoreState } from './types';

export function getInitialState(): ImageStoreState {
  return {
    images: {},
    loaded: false,
  };
}

export function reduceImages(
  state: ImageStoreState,
  action: Action,
): ImageStoreState {
  if (action.type === 'loaded-everything') {
    return action.images;
  }
  if (!state.loaded) {
    // Nothing else can act on an unloaded imagestore
    console.log(
      'imagestore ignores ' + action.type + ' because it has not loaded',
    );
    return state;
  }
  switch (action.type) {
    case 'image-delete-from-pot': {
      const im = { ...state.images[action.imageName] };
      const newState = {
        ...state,
        images: { ...state.images, [action.imageName]: im },
      };

      if (!im) {
        console.log(
          'Deleting ' + action.imageName + " from pot but it's nowhere",
        );
        return state;
      }
      im.pots = im.pots.filter((p) => p !== action.potId);
      if (im.pots.length === 0) {
        utils.deleteUnusedImage(im); // wee oo wee oo
        delete newState.images[action.imageName];
      }
      return newState;
    }
    case 'pot-delete': {
      const newState = { loaded: true, images: { ...state.images } };
      for (const name of action.imageNames) {
        const oldI = newState.images[name];
        if (!oldI) {
          continue;
        }
        const newI = {
          ...oldI,
          pots: oldI.pots.filter((p) => p !== action.potId),
        };
        if (newI.pots.length === 0) {
          utils.deleteUnusedImage(newI);
          delete newState.images[name];
        } else {
          newState.images[name] = newI;
        }
      }
      return newState;
    }
    case 'image-add': {
      const name = utils.nameFromUri(action.localUri);
      const newState = {
        loaded: true,
        images: {
          ...state.images,
          [name]: {
            name,
            localUri: action.localUri,
            pots: [action.potId],
          },
        },
      };
      utils.saveToFile(action.localUri);
      return newState;
    }
    case 'pot-copy': {
      const newState = { loaded: true, images: { ...state.images } };
      for (const name of action.imageNames) {
        newState.images[name] = {
          ...newState.images[name],
          pots: [...newState.images[name].pots, action.potId],
        };
      }
      return newState;
    }
    case 'initial-pots-images': {
      return getInitialState();
    }
    case 'image-error-remote': {
      // There's nothing to do, I guess
      return state;
    }
    case 'image-error-local': {
      const i = state.images[action.name];
      const newImage = { ...i };
      const newState = {
        loaded: true,
        images: {
          ...state.images,
          [action.name]: newImage,
        },
      };
      console.log('Removing failed local URI for image ' + i.name);
      delete newImage.localUri;
      return newState;
    }
    case 'image-error-file': {
      const uri = action.uri;
      const documentDirectory = FileSystem.documentDirectory;
      ImageUploader.debug('image-error-file', { uri, documentDirectory });
      return state;
    }
    case 'image-remote-failed': {
      // TODO(jessk) handle... by deleting the image
      // and removing it from its pot(s)
      // OR... who cares since we use files now
      return state;
    }
    case 'image-loaded': {
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
    case 'image-file-created': {
      if (state.images[action.name] === undefined) {
        console.warn(
          'Image file created, but no image exists for it! This is quite bad, probably.',
        );
        return state;
      }
      const newImage = {
        ...state.images[action.name],
        fileUri: action.fileUri,
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
          [action.name]: newImage,
        },
      };
      return newState;
    }
    default:
      return state;
  }
}

export function getImageState(
  state: ImageStoreState,
  name: string,
): ImageState | null {
  const i = state.images[name];
  if (!i) {
    console.log('That image named ' + name + ' is not in the image store.');
    return null;
  }
  return i;
}
