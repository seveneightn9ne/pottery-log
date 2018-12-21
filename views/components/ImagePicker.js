import React from 'react';
import {
  Alert,
  Image,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Expo from 'expo';
import styles from '../../style';

type ImagePickerProps = {
  onPicked: (localUri) => void,
  full: boolean,
};

export default class ImagePicker extends React.Component {

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
      await Expo.Permissions.askAsync(Expo.Permissions.CAMERA);
      await Expo.Permissions.askAsync(Expo.Permissions.CAMERA_ROLL);
    } catch (e) {
      console.warn(e);
      return;
    }
    await this.pickImage(Expo.ImagePicker.launchCameraAsync);
  }

  pickImageFromLibrary = async () => {
    try {
      await Expo.Permissions.askAsync(Expo.Permissions.CAMERA_ROLL);
    } catch (e) {
      console.warn(e);
      return;
    }
    await this.pickImage(Expo.ImagePicker.launchImageLibraryAsync);
  }

  pickImage = async (picker) => {
    let result = await picker({
      allowsEditing: true,
      aspect: [4,4],
    });

    if (!result.cancelled) {
      this.props.onPicked(result.uri);
    }
  }
}
