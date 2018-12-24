import React from 'react';
import { Text, TouchableHighlight, View } from 'react-native';
import styles from '../../style';

interface NewPotButtonProps {
  fontLoaded: boolean;
  onPress: () => void;
}
export default class NewPotButton extends React.Component<NewPotButtonProps, {}> {
  public render() {
    return (
    <TouchableHighlight onPress={this.props.onPress} style={styles.newPotButton}><View>
      {this.props.fontLoaded ? <Text style={styles.newPotButtonText}>add</Text> : null}
    </View></TouchableHighlight>);
  }
}
