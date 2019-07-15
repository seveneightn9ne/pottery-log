import React from 'react';
import { Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import styles from '../../style';

interface ImagePickerProps {
  onAddImage: () => void;
  full: boolean;
  style: ViewStyle;
}

export default function ImagePicker(props: ImagePickerProps) {
  const style = props.full ? styles.imagePickerFull : styles.imagePickerSmall;
  const textStyle = props.full
    ? styles.imagePickerFullText
    : styles.imagePickerSmallText;
  const text = props.full ? 'add_a_photo' : 'add';
  return (
    <TouchableOpacity onPress={props.onAddImage}>
      <View style={[style, styles.imagePicker, props.style]}>
        <Text style={[textStyle, styles.imagePickerText]}>{text}</Text>
      </View>
    </TouchableOpacity>
  );
}
