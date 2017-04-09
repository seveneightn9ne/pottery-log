import React from 'react';
import {
  View,
  Modal,
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

class ImplAndroid extends React.Component {

  render() {
    return <TouchableOpacity
      onPress={this.pickDateAndroid}>
      <Text>{Status.dateText(this.props.value)}</Text>
    </TouchableOpacity>
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

class ImplIOS extends React.Component {
  state = {
    modalVisible: false,
  }

  render() {
    return <View>
      <Modal
        animationType={"slide"}
        transparent={false}
        visible={this.state.modalVisible}
        onRequestClose={this.onModalClosed}
        >
        <DatePickerIOS
          date={this.props.value}
          mode="date"
          onDateChange={this.onDateChange}
        />
      </Modal>
    <TouchableOpacity
      onPress={this.onStart}>
      <Text>{Status.dateText(this.props.value)}</Text>
    </TouchableOpacity>
    </View>
  }

  onStart = () => {
    this.setState({modalVisible: true})
  }

  onDateChange = (date) => {
    this.setState({modalVisible: false})
    this.props.onPickDate(date)
  }
}

const DatePicker = Platform.select({
  ios: ImplIOS,
  android: ImplAndroid,
});


export default DatePicker
