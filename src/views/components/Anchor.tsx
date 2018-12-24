import React from 'react';
import { Clipboard, Linking, Text, ToastAndroid } from 'react-native';
import styles from '../../style';

export default class Anchor extends React.Component<{href: string, onPress?: () => void}> {

  public render() {
    return (
      <Text {...this.props} onPress={this.handlePress} onLongPress={this.handleLongPress} style={styles.anchor}>
        {this.props.children || this.props.href}
      </Text>
    );
  }

  private handlePress = () => {
    Linking.openURL(this.props.href);
    if (this.props.onPress) {
      this.props.onPress();
    }
  }

  private handleLongPress = () => {
    Clipboard.setString(this.props.href);
    ToastAndroid.show('Copied to clipboard', ToastAndroid.SHORT);
  }
}
