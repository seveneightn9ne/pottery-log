import { ImagePicker as ExpoImagePicker, Permissions } from 'expo';
import React from 'react';
import {
  Alert,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import styles from '../../style';

interface ImagePickerProps {
  onPicked: (localUri: string) => void;
  full: boolean;
  style: ViewStyle;
}

export default class ImagePicker extends React.Component<ImagePickerProps, {}> {
  public render() {
    const style = this.props.full ? styles.imagePickerFull : styles.imagePickerSmall;
    const textStyle = this.props.full ? styles.imagePickerFullText : styles.imagePickerSmallText;
    const text = this.props.full ? 'add_a_photo' : 'add';
    return (
      <TouchableOpacity onPress={this.popup}>
        <View style={[style, styles.imagePicker, this.props.style]}>
          <Text style={[textStyle, styles.imagePickerText]}>{text}</Text>
        </View>
      </TouchableOpacity>
    );
  }

  public popup = () => {
    Alert.alert('Add Image', 'Choose a source', [
      {text: 'Camera', onPress: this.pickImageFromCamera},
      {text: 'Image Library', onPress: this.pickImageFromLibrary}]);

  }

  public pickImageFromCamera = async () => {
    try {
      const perm1 = await Permissions.askAsync(Permissions.CAMERA);
      const perm2 = await Permissions.askAsync(Permissions.CAMERA_ROLL);
      if (perm1.status !== 'granted' || perm2.status !== 'granted') {
        throw 'Permission for camera was not granted.';
      }
    } catch (e) {
      console.warn(e);
      return;
    }
    await this.pickImage(ExpoImagePicker.launchCameraAsync);
  }

  public pickImageFromLibrary = async () => {
    try {
      const { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL);
      if (status !== 'granted') {
        throw 'Permission to access library was not granted.';
      }
    } catch (e) {
      console.warn(e);
      return;
    }
    await this.pickImage(ExpoImagePicker.launchImageLibraryAsync);
  }

  public pickImage = async (picker: (
    options?: ExpoImagePicker.CameraOptions & ExpoImagePicker.ImageLibraryOptions)
    => Promise<ExpoImagePicker.ImageResult>) => {
    const result = await picker({
      allowsEditing: true,
      aspect: [4, 4],
    });

    if (!result.cancelled) {
      this.props.onPicked(result.uri);
    }
  }
}
