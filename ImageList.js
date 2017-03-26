import React from 'react';
import {
  Image,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Expo from 'expo';
import styles from './style.js';
import ImagePicker from './ImagePicker.js';

type ImageListProps = {
  images: string[],
  onAddImage: (uri: string) => void,
  onClickImage: (uri: string) => void,
};

export default class ImageList extends React.Component {
  render() {
    const images = this.props.images.slice(1).map(uri =>
      <TouchableOpacity onPress={() => this.props.onClickImage(uri)} key={uri}>
        <Image source={{uri}} style={{width: 50, height: 50}} />
      </TouchableOpacity>);
    return <View style={{flexDirection: 'row'}}>
      {images}
      <ImagePicker style={{width: 50, height: 50}} onPicked={this.props.onAddImage} />
    </View>;
  }
}
