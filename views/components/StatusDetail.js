// @flow
import React from 'react';
import Status from '../../models/Status.js';
import { Text, View, TouchableOpacity } from 'react-native';
import styles from '../../style.js';
import Note from './Note.js';

type StatusDetailProps = {
  note: string,
  status: string,
  date: Date,
  potId: string,
  onChangeNote: (potId, status, newNote) => void,
};

export default class StatusDetail extends React.Component {
  render() {
    return <View>
      <View style={{flexDirection: 'row'}}>
        <Text style={{fontWeight: 'bold'}}>{Status.prettify(this.props.status)}</Text>
        <Text> on </Text>
        <Text>{Status.dateText(this.props.date)}</Text>
      </View>
      <Note note={this.props.note} status={this.props.status} potId={this.props.potId}
        onChangeNote={this.props.onChangeNote} />
    </View>;
  }
}
