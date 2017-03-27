import React from 'react';
import {
  DatePickerAndroid,
  DatePickerIOS,
  Platform,
  Text,
  TouchableOpacity,
} from 'react-native';
//import Expo from 'expo';
import styles from './style.js';
import {Status} from './Pot.js';

type DatePickerProps = {
  value: Date,
  onPickDate: (date: Date) => void,
};

export default class DatePicker extends React.Component {

  render() {
    return Platform.select({
      // TODO(jessk) - Date picker for iOS
      ios: <Text>{Status.dateText(this.props.value)}</Text>,
      android: <TouchableOpacity onPress={this.pickDateAndroid}><Text>{Status.dateText(this.props.value)}</Text></TouchableOpacity>,
    });
  }

  pickDateAndroid = async () => {
    try {
      const {action, year, month, day} = await DatePickerAndroid.open({
        date: this.props.value,
      });
      if (action !== DatePickerAndroid.dismissedAction) {
        this.props.onPickDate(new Date(year, month, day));
      }
    } catch ({code, message}) {
      console.warn('Cannot open date picker', message);
    }
  }
}

//Expo.registerRootComponent(ImagePicker);
