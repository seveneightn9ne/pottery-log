import React from 'react';
import {
  Image,
  Text,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import styles from '../../style.js';
import ImagePicker from './ImagePicker.js';
import Image3 from './Image3.js';
import {nameToImageState} from '../../stores/ImageStore.js';

type ImageListProps = {
  images: string[],
  onAddImage: (localUri) => void,
  onClickImage: (name) => void,
  onDeleteImage: (name) => void,
};

export default class ImageList extends React.Component {
  render() {
    const images = this.props.images.slice(1).map(name => {
      return (<TouchableOpacity onPress={() => this.props.onClickImage(name)} key={name}
        onLongPress={() => this.props.onDeleteImage(name)}>
        <Image3 image={nameToImageState(name)} style={styles.size50} />
      </TouchableOpacity>);
    });
    return <ScrollView horizontal={false}>
      <ImagePicker style={styles.size50} onPicked={this.props.onAddImage} />
      {images}
    </ScrollView>;
  }
}
