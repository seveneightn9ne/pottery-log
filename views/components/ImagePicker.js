import React from 'react';
import {
  Alert,
  Image,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Expo from 'expo';
import {Image as PotImage} from '../../models/Pot.js';
import styles from '../../style.js';

type ImagePickerProps = {
  onPicked: (img: PotImage) => void,
};

export default class ImagePicker extends React.Component {

  render() {
    return <TouchableOpacity onPress={this.popup}>
        <View style={[styles.imagePicker, this.props.style]}>
          <Text style={{textAlign: 'center', flex: 1}}>Add Image</Text>
        </View>
      </TouchableOpacity>;
  }

  popup = () => {
    Alert.alert( 'Add Image', 'Choose a source', [
      {text: 'Camera', onPress: this.pickImageFromCamera},
      {text: 'Image Library', onPress: this.pickImageFromLibrary}]);

  }

  pickImageFromCamera = async () => {
    await this.pickImage(Expo.ImagePicker.launchCameraAsync);
  }

  pickImageFromLibrary = async () => {
    await this.pickImage(Expo.ImagePicker.launchImageLibraryAsync);
  }

  pickImage = async (picker) => {
    let result = await picker({
      allowsEditing: true,
      aspect: [4,3]
    });

    if (!result.cancelled) {
      this.props.onPicked({localUri: result.uri});
    }
  }
}
