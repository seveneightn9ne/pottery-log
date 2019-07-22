import React from 'react';
import { ScrollView, TouchableOpacity } from 'react-native';
import { getImageState } from '../../reducers/ImageStore';
import { ImageStoreState } from '../../reducers/types';
import Image3 from './Image3';
import ImagePicker from './ImagePicker';

interface ImageListProps {
  images: string[];
  imageState: ImageStoreState;
  size: number;
  onAddImage: () => void;
  onClickImage: (name: string) => void;
  onDeleteImage: (name: string) => void;
}

export default function ImageList(props: ImageListProps) {
  const images = props.images.map((name) => {
    const imageState = getImageState(props.imageState, name);
    return (
      <TouchableOpacity
        onPress={onClickImage(props, name)}
        key={name}
        onLongPress={onDeleteImage(props, name)}
        style={{ marginRight: 4 }}
      >
        <Image3
          key={Image3.key(imageState)}
          image={imageState}
          style={{ height: props.size, width: props.size }}
        />
      </TouchableOpacity>
    );
  });
  return (
    <ScrollView horizontal={true} style={{ paddingLeft: 4, paddingTop: 4 }}>
      {images}
      <ImagePicker
        onAddImage={props.onAddImage}
        style={{
          height: props.size,
          width: images.length ? 100 - 4 * 3 : props.size + 100 - 4 * 2,
        }}
        full={images.length === 0}
      />
    </ScrollView>
  );
}

function onClickImage(props: ImageListProps, name: string) {
  return () => props.onClickImage(name);
}

function onDeleteImage(props: ImageListProps, name: string) {
  return () => props.onDeleteImage(name);
}
