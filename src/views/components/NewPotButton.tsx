import React from 'react';
import styles from '../../style';
import { Text, View, TouchableHighlight } from 'react-native';

type NewPotButtonProps = {
  fontLoaded: boolean,
  onPress: () => void,
}
export default class NewPotButton extends React.Component<NewPotButtonProps, {}> {
  render() {
    return <TouchableHighlight onPress={this.props.onPress} style={styles.newPotButton}><View>
    {this.props.fontLoaded ?
      <Text style={styles.newPotButtonText}>add</Text>: null}
    	</View></TouchableHighlight>;
  }
}
