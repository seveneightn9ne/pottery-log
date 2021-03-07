import { isNumber } from 'lodash';
import React from 'react';
import { Dimensions, Image, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import style from '../../style';

interface ImagePickerProps {
  onAddImage: () => void;
  onAddImageLibrary: () => void;
  onAddImageCamera: () => void;
  full: boolean;
  style: ViewStyle;
}

export default function ImagePicker(props: ImagePickerProps) {
  // const styles = props.full ? style.s.imagePickerFull : style.s.imagePickerSmall;
  // const textStyle = props.full
  //   ? style.s.imagePickerFullText
  //   : style.s.imagePickerSmallText;
  // const text = props.full ? 'add_a_photo' : 'add';
  const { width } = Dimensions.get('window');
  const imageHeight = isNumber(props.style.height) ? props.style.height / 2 : width / 3;
  const imageWidth = props.full ? width : width / 6;
  const size = { width: imageWidth, height: imageHeight };

  const cameraImage = (
    <Image
      source={require('../../../assets/camera-grey.png')}
      style={{ width: 48, height: 48 }}
    />
  );
  const imageImage = (
    <Image
      source={require('../../../assets/image-grey.png')}
      style={{ width: 36, height: 36 }}
    />
  );
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <TouchableOpacity onPress={props.onAddImageCamera}>
          <View style={[style.s.imagePickerIcons, size]}>
            {cameraImage}
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={props.onAddImageLibrary}>
        <View style={[style.s.imagePickerIcons, size]}>
            {imageImage}
          </View>
        </TouchableOpacity>
    </View>
  );
}
