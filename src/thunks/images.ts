import * as ImagePicker from 'expo-image-picker';
import * as Permissions from 'expo-permissions';
import { Alert } from 'react-native';
import { Pot } from '../models/Pot';
import { FullState } from '../reducers/types';
import { nameFromUri, saveToFilePure } from '../utils/imageutils';
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

function saveToFile(localUri: string, isRemote: boolean): PLThunkAction<void> {
  return t(
    'saveToFile',
    { localUri, isRemote },
    async (dispatch: PLThunkDispatch) => {
      try {
        const fileUri = await saveToFilePure(localUri, isRemote);
        dispatch({
          type: 'image-file-created',
          name: nameFromUri(localUri),
          fileUri,
        });
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

// Use if the file might be being created already
export function waitAndSaveToFile(name: string): PLThunkAction<void> {
  const waitTime = 10000; // 10 seconds

  return t(
    'waitAndSaveToFile',
    { name },
    async (dispatch: PLThunkDispatch, getState: () => FullState) => {
      const { images } = getState();
      const image = images.images[name];

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
