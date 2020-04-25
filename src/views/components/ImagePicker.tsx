import React from 'react';
import { Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import style from '../../style';

interface ImagePickerProps {
  onAddImage: () => void;
  full: boolean;
  style: ViewStyle;
}

export default function ImagePicker(props: ImagePickerProps) {
  const styles = props.full ? style.s.imagePickerFull : style.s.imagePickerSmall;
  const textStyle = props.full
    ? style.s.imagePickerFullText
    : style.s.imagePickerSmallText;
  const text = props.full ? 'add_a_photo' : 'add';
  return (
    <TouchableOpacity onPress={props.onAddImage}>
      <View style={[styles, style.s.imagePicker, props.style]}>
        <Text style={[textStyle, style.s.imagePickerText]}>{text}</Text>
      </View>
    </TouchableOpacity>
  );
}
