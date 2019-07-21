import React, { FunctionComponent } from 'react';
import { Clipboard, Linking, Text, ToastAndroid } from 'react-native';
import styles from '../../style';

interface Props {
  href: string;
  onPress?: () => void;
}

const Anchor: FunctionComponent<Props> = (props) => {
  const handlePress = () => {
    Linking.openURL(props.href);
    if (props.onPress) {
      props.onPress();
    }
  };
  const handleLongPress = () => {
    Clipboard.setString(props.href);
    ToastAndroid.show('Copied to clipboard', ToastAndroid.SHORT);
  };
  return (
    <Text
      onPress={handlePress}
      onLongPress={handleLongPress}
      style={styles.anchor}
    >
      {props.children || props.href}
    </Text>
  );
};

export default Anchor;
