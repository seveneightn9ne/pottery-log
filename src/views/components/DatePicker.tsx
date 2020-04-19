import React from 'react';
import {
  DatePickerAndroid,
  DatePickerIOS,
  Platform,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Status from '../../models/Status';
import styles from '../../style';
import Modal from './Modal';

interface DatePickerProps {
  value: Date;
  fontLoaded: boolean;
  onPickDate: (date: Date) => void;
}

const renderButton = (props: DatePickerProps, onPress: () => void) => {
  const today = props.fontLoaded ? (
    <Text style={[styles.chipArrow, styles.chipArrowText]}>today</Text>
  ) : null;
  return (
    <View style={[styles.chipOuter, styles.chipInner]}>
      <TouchableOpacity onPress={onPress}>
        <View style={styles.chipInner}>
          {today}
          <Text style={styles.chipText}>{Status.dateText(props.value)}</Text>
          <View style={styles.chipArrow} />
        </View>
      </TouchableOpacity>
    </View>
  );
};

class ImplAndroid extends React.Component<DatePickerProps, {}> {
  public render() {
    return renderButton(this.props, this.pickDateAndroid);
  }

  public pickDateAndroid = async () => {
    try {
      const { action, year, month, day } = await DatePickerAndroid.open({
        date: this.props.value,
      });
      const def = new Date();
      if (action !== DatePickerAndroid.dismissedAction) {
        this.props.onPickDate(
          new Date(
            year || def.getFullYear(),
            month || def.getMonth(),
            day || def.getDate(),
          ),
        );
      }
    } catch ({ code, message }) {
      console.warn('Cannot open date picker', message);
    }
  };
}

// tslint:disable-next-line:max-classes-per-file
class ImplIOS extends React.Component<
  DatePickerProps,
  { modalVisible: boolean; datePicked: Date }
> {
  public state = {
    modalVisible: false,
    datePicked: this.props.value,
  };

  public render() {
    const button = renderButton(this.props, this.openModal);
    return (
      <View>
        <Modal
          header="Choose Date"
          body={
            <DatePickerIOS
              date={this.state.datePicked}
              mode="date"
              onDateChange={this.onChangeDate}
            />
          }
          buttons={[
            { text: 'CANCEL', close: true },
            {
              text: 'SAVE',
              onPress: () => this.props.onPickDate(this.state.datePicked),
              close: true,
            },
          ]}
          close={this.closeModal}
          open={this.state.modalVisible}
        />
        {button}
      </View>
    );
  }

  private onChangeDate = (date: Date) => this.setState({ datePicked: date });

  private openModal = () => {
    this.setState({ modalVisible: true });
  };

  private closeModal = () => {
    this.setState({ modalVisible: false });
  };
}

const DatePicker = Platform.select({
  ios: ImplIOS as typeof ImplAndroid | typeof ImplIOS,
  android: ImplAndroid,
});

export default DatePicker;
