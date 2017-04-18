// @flow
import React from 'react';
import Status from '../../models/Status.js';
import { Text, View, TouchableHighlight } from 'react-native';
import styles from '../../style.js';
import Note from './Note.js';

type StatusSwitcherProps = {
  status: Status,
  setStatus: (newStatus: string) => void,
};

export default class StatusDetail extends React.Component {
  render() {
    const statusStyle = styles[this.props.status.currentStatus()];
    return <View style={{flexDirection: 'row'}}>
      <TouchableHighlight style={[styles.ssLeft, statusStyle]}
        onPress={() => this.props.setStatus(this.props.status.prev())}>
        <Text style={styles.ssSideText}>◀</Text>
      </TouchableHighlight>

      <Text style={[styles.ssMiddle, statusStyle]}>
        {Status.prettify(this.props.status.currentStatus())}
      </Text>

      <TouchableHighlight style={[styles.ssRight, statusStyle]}
        onPress={() => this.props.setStatus(this.props.status.next())}>
        <Text style={styles.ssSideText}>▶</Text>
      </TouchableHighlight>
    </View>;
  }
}
