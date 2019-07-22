import React, { FunctionComponent } from 'react';
import { ScrollView, TouchableOpacity } from 'react-native';
import { ImageState } from '../../reducers/types';
import Image3 from './Image3';
import ImagePicker from './ImagePicker';

interface ImageListProps {
  images: ImageState[];
  size: number;
  onAddImage: () => void;
  onClickImage: (name: string) => void;
  onDeleteImage: (name: string) => void;
}

export default function ImageList(props: ImageListProps) {
  const images = props.images.map((image) => (
    <ImageListItem
      image={image}
      onClick={() => props.onClickImage(image.name)}
      onDelete={() => props.onDeleteImage(image.name)}
      size={props.size}
      key={image.name}
    />
  ));
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

interface ImageListItemProps {
  onClick: () => void;
  onDelete: () => void;
  image: ImageState;
  size: number;
  key: string;
}
const ImageListItem: FunctionComponent<ImageListItemProps> = ({
  onClick,
  onDelete,
  image,
  size,
}) => {
  return (
    <TouchableOpacity
      onPress={onClick}
      onLongPress={onDelete}
      style={{ marginRight: 4 }}
    >
      <Image3 image={image} style={{ height: size, width: size }} />
    </TouchableOpacity>
  );
};
