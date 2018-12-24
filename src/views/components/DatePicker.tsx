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

class ImplAndroid extends React.Component<DatePickerProps, {}> {
  public render() {
    const today = this.props.fontLoaded ?
      <Text style={[styles.chipArrow, styles.chipArrowText]}>today</Text> : null;
    return (
    <View style={[styles.chipOuter, styles.chipInner]}>
      <TouchableOpacity onPress={this.pickDateAndroid}>
        <View style={styles.chipInner}>
          {today}
          <Text style={styles.chipText}>
            {Status.dateText(this.props.value)}
          </Text>
          <View style={styles.chipArrow} />
        </View>
      </TouchableOpacity>
    </View>);
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

// tslint:disable-next-line:max-classes-per-file
class ImplIOS extends React.Component<DatePickerProps, {modalVisible: boolean}> {
  public state = {
    modalVisible: false,
  };

  public render() {
    return (
    <View>
      <Modal
        animationType={'slide'}
        transparent={false}
        visible={this.state.modalVisible}
        onRequestClose={this.closeModal}
      >
        <DatePickerIOS
          date={this.props.value}
          mode="date"
          onDateChange={this.onChangeDate}
        />
      </Modal>
    <TouchableOpacity onPress={this.openModal}>
      <Text>{Status.dateText(this.props.value)}</Text>
    </TouchableOpacity>
    </View>);
  }

  private onChangeDate = (date: Date) => {
    this.closeModal();
    this.props.onPickDate(date);
  }

  private openModal = () => {
    this.setState({modalVisible: true});
  }

  private closeModal = () => {
    this.setState({modalVisible: false});
  }
}

const DatePicker = Platform.select({
  ios: ImplIOS as (typeof ImplAndroid | typeof ImplIOS),
  android: ImplAndroid,
});

export default DatePicker;
