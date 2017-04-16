// @flow
import React from 'react';
import Status from '../../models/Status.js';
import { Text, View } from 'react-native';
import styles from '../../style.js';

type StatusDetailProps = {
  note: string,
  status: string,
  date: Date,
};

export default class StatusDetail extends React.Component {
  render() {
    const note = this.props.note ? <Text>{note}</Text> : null;
    return <View>
      <View style={{flexDirection: 'row'}}>
        <Text style={{fontWeight: 'bold'}}>{Status.prettify(this.props.status)}</Text>
        <Text> on </Text>
        <Text>{Status.dateText(this.props.date)}</Text>
      </View>
      {note}
    </View>;
  }
}
