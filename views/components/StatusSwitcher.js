// @flow
import React from 'react';
import Status from '../../models/Status.js';
import { Text, View, TouchableOpacity } from 'react-native';
import DatePicker from './DatePicker.js';
import styles from '../../style.js';
import {Note, NoteModal} from './Note.js';

type StatusSwitcherProps = {
  status: Status,
  setStatus: (newStatus: string) => void,
};

export default class StatusDetail extends React.Component {
  render() {
    const editButton = this.props.fontLoaded && !this.props.note ?
          <TouchableOpacity onPress={() => {this.modal && this.modal.open()}}>
	    <Text style={styles.addMainNote}>note_add</Text>
          </TouchableOpacity>
        : null;
    const noteModal = <NoteModal note={this.props.note} status={this.props.status.currentStatus()}
      potId={this.props.potId} ref={(e) => this.modal = e}
      onChangeNote={this.props.onChangeNote} />
    const mainNote = this.props.note ?
	  <Note style={styles.mainNote} textStyle={styles.mainNoteText}
	    fontLoaded={this.props.fontLoaded}
	    status={pot.status.currentStatus()} potId={this.props.potId}
	    note={this.props.note}
	    onChangeNote={this.props.onChangeNote} showNote={true} showAddNote={true}
	  /> : null;
    return <View><View style={styles.statusSwitcher}>
      <View>
	{/* Up Arrow */}
	{this.props.fontLoaded ?
	<TouchableOpacity style={styles.statusArrow}
	    onPress={() => this.props.setStatus(this.props.status.next())}>
	    <Text style={styles.statusArrowText}>keyboard_arrow_up</Text>
	</TouchableOpacity> : null}
	{/* Down Arrow */}
	{this.props.fontLoaded ?
	<TouchableOpacity style={styles.statusArrow}
	    onPress={() => this.props.setStatus(this.props.status.prev())}>
	    <Text style={styles.statusArrowText}>keyboard_arrow_down</Text>
	</TouchableOpacity> : null}
      </View>
      <Text style={styles.mainStatus}>
	{Status.longterm(this.props.status.currentStatus())}
      </Text>
      <DatePicker value={this.props.date}
	fontLoaded={this.props.fontLoaded}
	onPickDate={this.props.setStatusDate} />
      {editButton}
    </View>
    {noteModal}
    {mainNote}
    </View>;
  }
}
