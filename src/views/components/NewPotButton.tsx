import React from 'react';
import { Text, TouchableOpacity } from 'react-native';
import ElevatedView from 'react-native-elevated-view';
import style from '../../style';

interface NewPotButtonProps {
  fontLoaded: boolean;
  onPress: () => void;
}
export default function(props: NewPotButtonProps) {
  return (
    <TouchableOpacity onPress={props.onPress} style={style.s.newPotWrapper}>
      <ElevatedView style={style.s.newPotButton} elevation={5}>
        {props.fontLoaded ? (
          <Text style={style.s.newPotButtonText}>add</Text>
        ) : null}
      </ElevatedView>
    </TouchableOpacity>
  );
}
