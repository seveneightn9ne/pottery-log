import React, { FunctionComponent } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { ImageState } from '../../reducers/types';
import style from '../../style';
import Image3 from './Image3';
import ImagePicker from './ImagePicker';

interface ImageListProps {
  images: ImageState[];
  size: number;
  onAddImage: () => void;
  onAddImageCamera: () => void;
  onAddImageLibrary: () => void;
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
  if (images.length === 0) {
    images.push((
      <View style={[style.s.liImagePlaceholder, style.s.imageListPlaceholder, {width: props.size}]}>
        <Text style={[style.s.coffeeImageText]}>local_cafe</Text>
      </View>));
  }
  return (
    <ScrollView horizontal={true} style={{ paddingLeft: 4, paddingTop: 4 }}>
      <ImagePicker
        onAddImageCamera={props.onAddImageCamera}
        onAddImageLibrary={props.onAddImageLibrary}
        onAddImage={props.onAddImage}
        style={{height: props.size, width: images.length ? 100 - 4 * 3 : props.size + 100 - 4 * 2 }}
        full={images.length === 0}
      />
      {images}
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
