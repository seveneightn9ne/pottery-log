// @flow
import React from 'react';
import {Pot} from '../../models/Pot.js';
import styles from '../../style.js';
import { Text, View, TouchableHighlight } from 'react-native';

type PotListItemProps = {
  pot: Pot,
  onPress: () => void,
}
export default class NewPotButton extends React.Component {
  render() {
    return <View style={styles.newPotButton}>
    {this.props.fontLoaded ? <TouchableHighlight onPress={this.props.onPress}>
      <Text style={styles.newPotButtonText}>add</Text></TouchableHighlight>: null}
    	</View>;
  }
}
