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
    const noteComponent = <Note note={this.props.note} status={this.props.status}
      potId={this.props.potId} onChangeNote={this.props.onChangeNote} />;
    return <View style={{margin: 10, marginTop: 0}}>
      <View style={{flexDirection: 'row'}}>
        <Text style={[styles.status, styles[this.props.status]]}>
          {Status.prettify(this.props.status)}</Text>
        <Text> {Status.dateText(this.props.date)} </Text>
        <Note note={this.props.note} status={this.props.status}
          potId={this.props.potId} onChangeNote={this.props.onChangeNote}
          showNote={false} showAddNote={true}
        />
      </View>
      <Note note={this.props.note} status={this.props.status}
        potId={this.props.potId} onChangeNote={this.props.onChangeNote}
        showNote={true} showAddNote={false}
      />
    </View>;
  }
}
