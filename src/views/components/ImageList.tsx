import React from 'react';
import {
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import ImagePicker from './ImagePicker';
import Image3 from './Image3';
import {nameToImageState} from '../../stores/ImageStore';

type ImageListProps = {
  images: string[],
  size: number,
  onAddImage: (localUri: string) => void,
  onClickImage: (name: string) => void,
  onDeleteImage: (name: string) => void,
};

export default function ImageList(props: ImageListProps) {
  const images = props.images.map(name => {
    const imageState = nameToImageState(name);
    return (<TouchableOpacity onPress={() => props.onClickImage(name)} key={name}
      onLongPress={() => props.onDeleteImage(name)}
      style={{marginRight: 4}}>
      <Image3 key={Image3.key(imageState)} image={imageState} style={{height: props.size, width: props.size}} />
    </TouchableOpacity>);
  });
  return <ScrollView horizontal={true} style={{paddingLeft: 4, paddingTop: 4}}>
    {images}
    <ImagePicker onPicked={props.onAddImage}
      style={{height: props.size, width: images.length ? 100 - (4*3) : props.size + 100 - (4*2)}}
      full={images.length == 0} />
  </ScrollView>;
}
