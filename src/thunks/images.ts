import * as ImagePicker from 'expo-image-picker';
import * as Permissions from 'expo-permissions';
import { Alert } from 'react-native';
import { Pot } from '../models/Pot';
import { nameFromUri, saveToFilePure } from '../utils/imageutils';
import { PLThunkAction, PLThunkDispatch } from './types';

export function addImage(pot: Pot): PLThunkAction {
  return (dispatch: PLThunkDispatch) => {
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
  };
}

export function pickImageFromCamera(pot: Pot): PLThunkAction {
  return (dispatch: PLThunkDispatch) =>
    dispatch(
      pickImage(pot, getCameraPermission, ImagePicker.launchCameraAsync),
    );
}

export function pickImageFromLibrary(pot: Pot): PLThunkAction {
  return (dispatch: PLThunkDispatch) =>
    dispatch(
      pickImage(
        pot,
        getImageLibraryPermission,
        ImagePicker.launchImageLibraryAsync,
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
  return async (dispatch: PLThunkDispatch) => {
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
      console.warn('Failed to get image from camera', e);
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
    await dispatch(saveToFile(localUri));
  };
}

function saveToFile(localUri: string): PLThunkAction<void> {
  return async (dispatch: PLThunkDispatch) => {
    try {
      const fileUri = await saveToFilePure(localUri);
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
  };
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
