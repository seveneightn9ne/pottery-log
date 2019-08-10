import * as ImagePicker from 'expo-image-picker';
import * as Permissions from 'expo-permissions';
import { Alert } from 'react-native';
import { Pot } from '../models/Pot';
import { FullState } from '../reducers/types';
import {
  deleteUnusedImage,
  nameFromUri,
  saveToFilePure,
} from '../utils/imageutils';
import * as ImageUploader from '../utils/uploader';
import { PLThunkAction, PLThunkDispatch, t } from './types';

export function addImage(pot: Pot): PLThunkAction {
  return t('addImage', { pot }, (dispatch: PLThunkDispatch) => {
    Alert.alert('Add Image', 'Choose a source', [
      {
        text: 'Camera',
        onPress: () => dispatch(pickImageFromCamera(pot)),
      },
      {
        text: 'Image Library',
        onPress: () => dispatch(pickImageFromLibrary(pot)),
      },
    ]);
    return Promise.resolve();
  });
}

export function deletePot(pot: Pot): PLThunkAction {
  return t(
    'deletePot',
    { pot },
    async (dispatch: PLThunkDispatch, getState: () => FullState) => {
      const oldState = getState();
      dispatch({
        type: 'pot-delete',
        potId: pot.uuid,
        imageNames: pot.images3,
      });
      const newState = getState();
      await deleteUnusedImageFiles(oldState, newState);
    },
  );
}

export function deleteImage(name: string, pot: Pot): PLThunkAction {
  return t(
    'deleteImage',
    { name, pot },
    async (dispatch: PLThunkDispatch, getState: () => FullState) => {
      if (pot.images3.indexOf(name) === -1) {
        console.warn('The image is not in the pot');
        return;
      }
      const oldState = getState();
      dispatch({
        type: 'image-delete-from-pot',
        imageName: name,
        potId: pot.uuid,
      });
      const newState = getState();
      await deleteUnusedImageFiles(oldState, newState);
    },
  );
}

/** Deletes files for images that have been removed from the newState */
async function deleteUnusedImageFiles(
  oldState: FullState,
  newState: FullState,
) {
  const unusedImages = Object.keys(oldState.images.images).filter(
    (imageName) => !newState.images.images[imageName],
  );
  console.log(unusedImages);
  return Promise.all(
    unusedImages.map((imageName) => {
      const image = oldState.images.images[imageName];
      return deleteUnusedImage(image);
    }),
  );
}

export function pickImageFromCamera(pot: Pot): PLThunkAction {
  return t('pickImageFromCamera', { pot }, (dispatch: PLThunkDispatch) =>
    dispatch(pickImage(pot, getCameraPermission, ImagePicker.launchCameraAsync)),
  );
}

export function pickImageFromLibrary(pot: Pot): PLThunkAction {
  return t('pickImageFromLibrary', { pot }, (dispatch: PLThunkDispatch) =>
    dispatch(
      pickImage(
        pot,
        getImageLibraryPermission,
        ImagePicker.launchImageLibraryAsync,
      ),
    ),
  );
}

function pickImage(
  pot: Pot,
  getPermission: () => Promise<void>,
  launcher: (
    options?: ImagePicker.ImagePickerOptions,
  ) => Promise<ImagePicker.ImagePickerResult>,
): PLThunkAction {
  return t('pickImage', { pot }, async (dispatch: PLThunkDispatch) => {
    let localUri: string;
    try {
      await getPermission();
      const result = await launcher({
        allowsEditing: true,
        aspect: [4, 4],
      });

      if (result.cancelled) {
        throw new Error('ImagePicker was cancelled');
      }
      localUri = result.uri;
    } catch (e) {
      console.warn('Failed to get image from camera/library', e);
      // We ignore this error because it's probably that the user declined the permissions
      // or chose not to pick an image.
      return;
    }
    const name = nameFromUri(localUri);
    dispatch({
      type: 'image-add',
      localUri,
      potId: pot.uuid,
    });
    dispatch({
      type: 'pot-edit-field',
      field: 'images3',
      value: [name, ...pot.images3],
      potId: pot.uuid,
    });
    await dispatch(saveToFile(localUri, false /* isRemote */));
  });
}

export function saveToFile(
  localUri: string,
  isRemote: boolean,
): PLThunkAction<void> {
  return t(
    'saveToFile',
    { localUri, isRemote },
    async (dispatch: PLThunkDispatch, getState: () => FullState) => {
      try {
        const fileUri = await saveToFilePure(localUri, isRemote);
        const name = nameFromUri(localUri);
        dispatch({
          type: 'image-file-created',
          name,
          fileUri,
        });

        // Remove remote image now that we have a file
        // Not awaiting, no need to wait for this
        deleteRemoteImage(name, getState);
      } catch (e) {
        console.warn('saveToFile failed:', e);
        dispatch({
          type: 'image-file-failed',
          uri: localUri,
        });
      }
    },
  );
}

async function deleteRemoteImage(name: string, getState: () => FullState) {
  const state = getState();
  if (!state) {
    console.warn('No state (should only happen in tests)');
    return;
  }
  const image = state.images.images[name];
  if (!image) {
    // ought to be impossible, maybe raced with deletion
    ImageUploader.debug('image-save-to-file-nonexistent', { name });
  }
  if (image.remoteUri) {
    console.log('Removing remote URI ', image.remoteUri);
    return ImageUploader.remove(image.remoteUri).catch(() => {
      console.log('Failed to delete remote image: ', image.remoteUri);
    });
  }
}

// Use if the file might be being created already
export function waitAndSaveToFile(name: string): PLThunkAction<void> {
  const waitTime = 10000; // 10 seconds

  return t(
    'waitAndSaveToFile',
    { name },
    async (dispatch: PLThunkDispatch, getState: () => FullState) => {
      const { images } = getState();
      const image = images.images[name];

      if (!image) {
        ImageUploader.debug('image-save-to-file-nonexistent', {
          name,
        });
        return;
      }

      if (image.fileUri) {
        console.log('Why did you try to save to file? We have a file. ', name);
        return;
      }

      let uri: string;
      let isRemote: boolean;
      if (image.localUri) {
        uri = image.localUri;
        isRemote = false;
      } else if (image.remoteUri) {
        uri = image.remoteUri;
        isRemote = true;
      }

      setTimeout(() => {
        const { images } = getState();
        const image = images.images[name];
        if (!image.fileUri) {
          dispatch(saveToFile(uri, isRemote));
        }
      }, waitTime);
    },
  );
}

async function getCameraPermission() {
  const perm1 = await Permissions.askAsync(Permissions.CAMERA);
  const perm2 = await Permissions.askAsync(Permissions.CAMERA_ROLL);
  if (perm1.status !== 'granted' || perm2.status !== 'granted') {
    throw new Error('Permission for camera was not granted.');
  }
}

async function getImageLibraryPermission() {
  const { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL);
  if (status !== 'granted') {
    throw new Error('Permission to access library was not granted.');
  }
}
