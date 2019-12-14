import _ from 'lodash';
import { Action } from '../action';
import { nameFromUri } from '../utils/imageutils';
import { debug } from '../utils/uploader';
import { ImageStoreState } from './types';

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
          delete newState.images[name];
        } else {
          newState.images[name] = newI;
        }
      }
      return newState;
    }
    case 'image-add': {
      const name = nameFromUri(action.localUri);
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
      return newState;
    }
    case 'pot-copy': {
      const newState = { loaded: true, images: { ...state.images } };
      for (const name of action.imageNames) {
        const oldImage = newState.images[name];
        if (!oldImage) {
          // XXX(jessk): why can oldImage be undefined?
          // fixing TypeError: undefined is not an object (evaluating 'S.images[A].pots')
          debug('image-undefined', { imageState: state, missingImage: name });
        }
        const oldPots = oldImage ? oldImage.pots : [action.potId];
        newState.images[name] = {
          ...oldImage,
          pots: [...oldPots, action.newPotId],
        };
      }
      return newState;
    }
    case 'initial-pots-images': {
      return getInitialState();
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
      delete newImage.localUri;
      return newState;
    }
    case 'image-reset-loaded': {
      const name = nameFromUri(action.oldUri);
      const fileUri = action.newUri.split('?')[0];
      const i = state.images[name];
      const newImage = { ...i, fileUri };
      const newState = {
        ...state,
        images: {
          ...state.images,
          [name]: newImage,
        },
      };

      return newState;
    }
    case 'image-remote-failed': {
      // TODO(jessk) handle... by deleting the image
      // and removing it from its pot(s)
      // OR... who cares since we use files now
      return state;
    }
    case 'image-file-created': {
      if (state.images[action.name] === undefined) {
        return state;
      }
      const newImage = {
        ...state.images[action.name],
        fileUri: action.fileUri,
      };
      if (newImage.remoteUri) {
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
