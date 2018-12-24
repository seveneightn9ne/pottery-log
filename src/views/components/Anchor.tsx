import React from 'react';
import { Linking, Text, ToastAndroid, Clipboard } from 'react-native';
import styles from '../../style';

export default class Anchor extends React.Component<{href: string, onPress?: () => void}> {
  _handlePress = () => {
    Linking.openURL(this.props.href);
    this.props.onPress && this.props.onPress();
  };

  _handleLongPress = () => {
    Clipboard.setString(this.props.href);
    ToastAndroid.show('Copied to clipboard', ToastAndroid.SHORT);
  }

  render() {
    return (
      <Text {...this.props} onPress={this._handlePress} onLongPress={this._handleLongPress} style={styles.anchor}>
        {this.props.children || this.props.href}
      </Text>
    );
  }
}
