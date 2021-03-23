import { isNumber } from 'lodash';
import React from 'react';
import { Dimensions, Image, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import style from '../../style';
import { getDerivedDarkMode } from '../../selectors/settings';

interface ImagePickerProps {
  onAddImage: () => void;
  onAddImageLibrary: () => void;
  onAddImageCamera: () => void;
  full: boolean;
  style: ViewStyle;
}

export default function ImagePicker(props: ImagePickerProps) {
  const { width } = Dimensions.get('window');
  // TG: Calculate the height and width of the buttons based on if we are in a new pot with no images,
  // an existing pot with at least one image. Then subtract a few pixels based on the margin
  const imageHeight = isNumber(props.style.height) ? (props.style.height / 2) : (width / 3);
  const imageWidth = props.full ? width : (width / 6);

// camera
// camera_alt
// add_photo_alternate
// photo_album
// photo_camera
// local_see
// insert_photo
// add_a_photo
// photo
// photo_size_select_actual
// panorama
// local_see

// local_cafe
// free_breakfast
// coffee

// https://material.io/resources/icons/?icon=add_photo_alternate&style=baseline

  {/* <View style={style.s.imagePicker2} height={imageHeight}> */}
  // TG: This configuration will show the image picker with dark or light gray icon based on theme,
  // with grey borders around the buttons, sitting near the top
  // <View style={style.s.imagePicker3} width={48} height={48}>
  return (
  <View>
      <TouchableOpacity onPress={props.onAddImageCamera}>
        <View style={style.s.imagePicker}>
          <Text style={[style.s.imagePickerText]}>camera_alt</Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity onPress={props.onAddImageLibrary}>
      <View style={style.s.imagePicker}>
          <Text style={[style.s.imagePickerText]}>photo</Text>
        </View>
      </TouchableOpacity>
  </View>
);

  // TG: This configuration will show the image picker with dark or light gray icon based on theme,
  // with no borders around the buttons near the top
//   return (
//   <View>
//       <TouchableOpacity onPress={props.onAddImageCamera}>
//         <View style={style.s.imagePicker3}>
//           <Text style={[style.s.imagePickerText]}>camera_alt</Text>
//         </View>
//       </TouchableOpacity>
//       <TouchableOpacity onPress={props.onAddImageLibrary}>
//       <View style={style.s.imagePicker3}>
//           <Text style={[style.s.imagePickerText]}>photo</Text>
//         </View>
//       </TouchableOpacity>
//   </View>
// );

  // TG: This configuration will show the image picker with black or white icon based on theme,
  // with solid borders around the buttons filling height of image
  // return (
  //   <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
  //       <TouchableOpacity onPress={props.onAddImageCamera}>
  //         <View style={style.s.imagePicker} height={imageHeight - 4} width={imageWidth - 8}>
  //           <Text style={[style.s.imagePickerText2]}>camera_alt</Text>
  //         </View>
  //       </TouchableOpacity>
  //       <TouchableOpacity onPress={props.onAddImageLibrary}>
  //         <View style={style.s.imagePicker} height={imageHeight - 4} width={imageWidth - 8}>
  //           <Text style={[style.s.imagePickerText2]}>photo</Text>
  //         </View>
  //       </TouchableOpacity>
  //   </View>
  // );
}
