import React from 'react';
import {
  Image,
  Text,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import {Image as PotImage} from '../../models/Pot.js';
import styles from '../../style.js';
import ImagePicker from './ImagePicker.js';

type ImageListProps = {
  images: PotImage[],
  onAddImage: (img: PotImage) => void,
  onClickImage: (img: PotImage) => void,
  onDeleteImage: (img: PotImage) => void,
};

export default class ImageList extends React.Component {
  render() {
    const images = this.props.images.slice(1).map(img => {
      const uri = img.remoteUri ? img.remoteUri : img.localUri;
      return (<TouchableOpacity onPress={() => this.props.onClickImage(img)} key={uri}
        onLongPress={() => this.props.onDeleteImage(img)}>
        <Image source={{uri}} style={styles.size50} />
      </TouchableOpacity>);
    });
    return <ScrollView horizontal={true}>
      {images}
      <ImagePicker style={styles.size50} onPicked={this.props.onAddImage} />
    </ScrollView>;
  }
}
