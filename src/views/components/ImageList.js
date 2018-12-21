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
    const images = this.props.images.map(name => {
      return (<TouchableOpacity onPress={() => this.props.onClickImage(name)} key={name}
        onLongPress={() => this.props.onDeleteImage(name)}
        style={{marginRight: 4}}>
        <Image3 image={nameToImageState(name)} style={{height: this.props.size, width: this.props.size}} />
      </TouchableOpacity>);
    });
    return <ScrollView horizontal={true} style={{paddingLeft: 4, paddingTop: 4}}>
      {images}
      <ImagePicker onPicked={this.props.onAddImage} style={{height: this.props.size, width: images.length ? 100 - (4*3) : this.props.size + 100 - (4*2)}} full={images.length == 0} />
    </ScrollView>;
  }
}
