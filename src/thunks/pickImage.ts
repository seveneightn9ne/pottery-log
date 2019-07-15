import { ImagePicker, Permissions } from 'expo';
import { Alert } from 'react-native';
import { Pot } from '../models/Pot';
import { nameFromUri } from '../utils/imageutils';
import { PLThunkAction, PLThunkDispatch } from './types';

export function addImage(pot: Pot): PLThunkAction {
  return (dispatch: PLThunkDispatch) => {
    Alert.alert('Add Image', 'Choose a source', [
      {
        text: 'Camera',
        onPress: pickImage(
          dispatch,
          pot,
          getCameraPermission,
          ImagePicker.launchCameraAsync,
        ),
      },
      {
        text: 'Image Library',
        onPress: pickImage(
          dispatch,
          pot,
          getImageLibraryPermission,
          ImagePicker.launchImageLibraryAsync,
        ),
      },
    ]);
    return Promise.resolve();
  };
}

function pickImage(
  dispatch: PLThunkDispatch,
  pot: Pot,
  getPermission: () => Promise<void>,
  launcher: (
    options?: ImagePicker.CameraOptions & ImagePicker.ImageLibraryOptions,
  ) => Promise<ImagePicker.ImageResult>,
) {
  return async () => {
    try {
      await getPermission();
      const result = await launcher({
        allowsEditing: true,
        aspect: [4, 4],
      });

      if (result.cancelled) {
        throw new Error('ImagePicker was cancelled');
      }
      const localUri = result.uri;
      dispatch({
        type: 'image-add',
        localUri,
        potId: pot.uuid,
      });
      dispatch({
        type: 'pot-edit-field',
        field: 'images3',
        value: [nameFromUri(localUri), ...pot.images3],
        potId: pot.uuid,
      });
    } catch (e) {
      console.warn('Failed to get image from camera', e);
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
