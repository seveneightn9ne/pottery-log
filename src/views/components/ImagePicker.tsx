import React from 'react';
import { Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import ElevatedView from 'react-native-elevated-view';
import style from '../../style';
interface ImagePickerProps {
  onAddImage: () => void;
  onAddImageLibrary: () => void;
  onAddImageCamera: () => void;
  full: boolean;
  style: ViewStyle;
}

export default function ImagePicker(props: ImagePickerProps) {
  // TG: This configuration will show the image picker with dark or light gray icon based on theme,
  // with grey borders around the buttons, sitting near the top
  return (
  <View>
    <ElevatedView elevation={1} style={style.s.elevatedViewBackground}>
      <TouchableOpacity onPress={props.onAddImageCamera}>
        <View style={[style.s.imagePicker, style.s.ip1]}>
          <Text style={[style.s.imagePickerText]}>camera_alt</Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity onPress={props.onAddImageLibrary}>
      <View style={[style.s.imagePicker, style.s.ip2]}>
          <Text style={[style.s.imagePickerText]}>photo</Text>
        </View>
      </TouchableOpacity>
    </ElevatedView>
  </View>
);
}
