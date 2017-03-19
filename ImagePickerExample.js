import React from 'react';
import {
  Image,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Expo from 'expo';

export default class ImagePickerExample extends React.Component {
  state = {
    image: null,
  }

  render() {
    let { image } = this.state;

    return (
      <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
        <TouchableOpacity onPress={this._pickImage}>
          <View>
            <Text>Pick an image from camera roll</Text>
          </View>
        </TouchableOpacity>

        {image &&
          <Image source={{uri: image}} style={{width: 200, height: 200}} /> }
      </View>
    );
  }

  _pickImage = async () => {
    let result = await Expo.ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [4,3]
    });

    console.log(result);

    if (!result.cancelled) {
      this.setState({image: result.uri});
    }
  }
}

Expo.registerRootComponent(ImagePickerExample);
