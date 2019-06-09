import React from 'react';
import ElevatedView from 'react-native-elevated-view';
import { Text, TouchableOpacity } from 'react-native';
import styles from '../../style';

interface NewPotButtonProps {
  fontLoaded: boolean;
  onPress: () => void;
}
export default function(props: NewPotButtonProps) {
  return (
  <TouchableOpacity onPress={props.onPress} style={styles.newPotWrapper}><ElevatedView style={styles.newPotButton} elevation={5}>
    {props.fontLoaded ? <Text style={styles.newPotButtonText}>add</Text> : null}
  </ElevatedView></TouchableOpacity>);
}
