import React from 'react';
import {
  DatePickerAndroid,
  DatePickerIOS,
  Modal,
  Platform,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Status from '../../models/Status';
import styles from '../../style';

interface DatePickerProps {
  value: Date;
  fontLoaded: boolean;
  onPickDate: (date: Date) => void;
}

interface State {
  // Used only in iOS impl
  modalVisible: boolean;
}

class ImplAndroid extends React.Component<DatePickerProps, State> {

  public render() {
    return <View style={[styles.chipOuter, styles.chipInner]}><TouchableOpacity
      onPress={this.pickDateAndroid}>
      <View style={styles.chipInner}>
	{this.props.fontLoaded ?
	    <Text style={[styles.chipArrow, styles.chipArrowText]}>today</Text> : null}
        <Text style={styles.chipText}>
      	  {Status.dateText(this.props.value)}
        </Text>
        <View style={styles.chipArrow} />
      </View>
	  </TouchableOpacity></View>;
  }

  public pickDateAndroid = async () => {
    try {
      const {action, year, month, day} = await DatePickerAndroid.open({
        date: this.props.value,
      });
      const def = new Date();
      if (action !== DatePickerAndroid.dismissedAction) {
        this.props.onPickDate(new Date(year || def.getFullYear(), month || def.getMonth(), day || def.getDate()));
      }
    } catch ({code, message}) {
      console.warn('Cannot open date picker', message);
    }
  }
}

class ImplIOS extends React.Component<DatePickerProps, State> {
  public state = {
    modalVisible: false,
  };

  public render() {
    return <View>
      <Modal
        animationType={'slide'}
        transparent={false}
        visible={this.state.modalVisible}
        onRequestClose={() => this.setState({modalVisible: false})}>
        <DatePickerIOS
          date={this.props.value}
          mode="date"
          onDateChange={(date: Date) => {
            this.setState({modalVisible: false});
            this.props.onPickDate(date);
          }} />
      </Modal>
    <TouchableOpacity
      onPress={() => {
        this.setState({modalVisible: true});
      }}>
      <Text>{Status.dateText(this.props.value)}</Text>
    </TouchableOpacity>
    </View>;
  }
}

const DatePicker = Platform.select({
  ios: ImplIOS,
  android: ImplAndroid,
});

export default DatePicker;
