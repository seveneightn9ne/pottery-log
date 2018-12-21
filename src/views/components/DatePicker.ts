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
import styles from '../../style';
import Status from '../../models/Status';

type DatePickerProps = {
  value: Date,
  onPickDate: (date: Date) => void,
};

class ImplAndroid extends React.Component {

  render() {
    return <View style={[styles.chipOuter, styles.chipInner]}><TouchableOpacity
      onPress={this.pickDateAndroid}>
      <View style={styles.chipInner}>
	{this.props.fontLoaded ?
	    <Text style={[styles.chipArrow, styles.chipArrowText]}>today</Text>: null}
        <Text style={styles.chipText}>
      	  {Status.dateText(this.props.value)}
        </Text>
        <View style={styles.chipArrow} />
      </View>
	  </TouchableOpacity></View>
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