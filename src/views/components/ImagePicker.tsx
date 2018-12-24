import React from 'react';
import {
  Alert,
  Text,
  TouchableOpacity,
  View,
  ViewStyle
} from 'react-native';
import { ImagePicker as ExpoImagePicker, Permissions } from 'expo';
import styles from '../../style';

type ImagePickerProps = {
  onPicked: (localUri: string) => void,
  full: boolean,
  style: ViewStyle
};

export default class ImagePicker extends React.Component<ImagePickerProps, {}> {
  render() {
    const style = this.props.full ? styles.imagePickerFull : styles.imagePickerSmall;
    const textStyle = this.props.full ? styles.imagePickerFullText : styles.imagePickerSmallText;
    const text = this.props.full ? "add_a_photo" : "add";
    return <TouchableOpacity onPress={this.popup}>
        <View style={[style, styles.imagePicker, this.props.style]}>
          <Text style={[textStyle, styles.imagePickerText]}>{text}</Text>
        </View>
      </TouchableOpacity>;
  }

  popup = () => {
    Alert.alert( 'Add Image', 'Choose a source', [
      {text: 'Camera', onPress: this.pickImageFromCamera},
      {text: 'Image Library', onPress: this.pickImageFromLibrary}]);

  }

  pickImageFromCamera = async () => {
    try {
      await Permissions.askAsync(Permissions.CAMERA);
      await Permissions.askAsync(Permissions.CAMERA_ROLL);
    } catch (e) {
      console.warn(e);
      return;
    }
    await this.pickImage(ExpoImagePicker.launchCameraAsync);
  }

  pickImageFromLibrary = async () => {
    try {
      await Permissions.askAsync(Permissions.CAMERA_ROLL);
    } catch (e) {
      console.warn(e);
      return;
    }
    await this.pickImage(ExpoImagePicker.launchImageLibraryAsync);
  }

  pickImage = async (picker: (options?: ExpoImagePicker.CameraOptions & ExpoImagePicker.ImageLibraryOptions) => Promise<ExpoImagePicker.ImageResult>) => {
    let result = await picker({
      allowsEditing: true,
      aspect: [4,4],
    });

    if (!result.cancelled) {
      this.props.onPicked(result.uri);
    }
  }
}
