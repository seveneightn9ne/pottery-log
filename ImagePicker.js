import React from 'react';
import {
  Image,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Expo from 'expo';
import styles from './style.js';

type ImagePickerProps = {
  onPicked: (uri: string) => void,
}

export default class ImagePicker extends React.Component {

  render() {
    return <TouchableOpacity onPress={this.pickImage}>
        <View style={styles.imagePicker}><Text>Add Image</Text></View>
      </TouchableOpacity>;
  }

  pickImage = async () => {
    let result = await Expo.ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [16,9]
    });

    if (!result.cancelled) {
      this.props.onPicked(result.uri);
    }
  }
}

//Expo.registerRootComponent(ImagePicker);
