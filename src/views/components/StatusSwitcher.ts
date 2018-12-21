// @flow
import React from 'react';
import Status from '../../models/Status';
import { Text, View, TouchableOpacity } from 'react-native';
import DatePicker from './DatePicker';
import styles from '../../style';
import { Note, NoteModal } from './Note';

type StatusSwitcherProps = {
  status: Status,
  setStatus: (newStatus: string) => void,
  onPickDate: (newDate: Date) => void,
};

export default class StatusDetail extends React.Component<StatusSwitcherProps> {
  modal: NoteModal;
  render() {
    const editButton = this.props.fontLoaded ?
      <TouchableOpacity onPress={() => { this.modal && this.modal.open() }}>
        <Text style={styles.addMainNote}>{this.props.note ? 'mode_edit' : 'note_add'}</Text>
      </TouchableOpacity>
      : null;
    const noteModal = <NoteModal note={this.props.note} status={this.props.status.currentStatus()}
      potId={this.props.potId} ref={(e) => this.modal = e}
      onChangeNote={this.props.onChangeNote} />
    let mainNoteStyle = styles.mainNote;
    if (!this.props.status.hasTimeline()) {
      mainNoteStyle = [styles.mainNote, styles.mainNoteNoBar];
    }
    const mainNote = this.props.note ?
      <Note style={mainNoteStyle} textStyle={styles.mainNoteText}
        fontLoaded={this.props.fontLoaded}
        status={this.props.status.currentStatus()} potId={this.props.potId}
        note={this.props.note}
        onChangeNote={this.props.onChangeNote} showNote={true} showAddNote={false}
      /> : null;
    return <View>
      <View style={styles.statusSwitcher}>
        <Text style={styles.mainStatus}>
          {Status.longterm(this.props.status.currentStatus())}
        </Text>
        <DatePicker value={this.props.date}
          fontLoaded={this.props.fontLoaded}
          onPickDate={this.props.onPickDate} />
        {editButton}
      </View>
      <View style={styles.statusArrows}>
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
      {noteModal}
      {mainNote}
    </View>;
  }
}