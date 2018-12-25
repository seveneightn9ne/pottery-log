import React from 'react';
import { Text, TouchableHighlight, View } from 'react-native';
import styles from '../../style';

interface NewPotButtonProps {
  fontLoaded: boolean;
  onPress: () => void;
}
export default function(props: NewPotButtonProps) {
  return (
  <TouchableHighlight onPress={props.onPress} style={styles.newPotButton}><View>
    {props.fontLoaded ? <Text style={styles.newPotButtonText}>add</Text> : null}
  </View></TouchableHighlight>);
}
