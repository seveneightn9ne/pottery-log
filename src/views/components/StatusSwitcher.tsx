import React from 'react';
import Status, { StatusString } from '../../models/Status';
import { Text, View, TouchableOpacity, ViewStyle } from 'react-native';
import DatePicker from './DatePicker';
import styles from '../../style';
import { Note, NoteModal } from './Note';

type StatusSwitcherProps = {
  fontLoaded: boolean,
  status: Status,
  note: string,
  potId: string,
  date: Date,
  setStatus: (newStatus: StatusString) => void,
  onPickDate: (newDate: Date) => void,
  onChangeNote: (potId: string, status: StatusString, newNote: string) => void,
};

export default class StatusSwitcher extends React.Component<StatusSwitcherProps> {
  modal: React.RefObject<NoteModal>;
  constructor(props: StatusSwitcherProps) {
    super(props);
    this.modal = React.createRef();
  }
  render() {
    const editButton = this.props.fontLoaded ?
      <TouchableOpacity onPress={() => { this.modal.current && this.modal.current.open() }}>
        <Text style={styles.addMainNote}>{this.props.note ? 'mode_edit' : 'note_add'}</Text>
      </TouchableOpacity>
      : null;
    const noteModal = <NoteModal note={this.props.note} status={this.props.status.currentStatus()}
      potId={this.props.potId} ref={this.modal}
      onChangeNote={this.props.onChangeNote} />
    let mainNoteStyle: ViewStyle | ViewStyle[] = styles.mainNote;
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
            onPress={() => {
              const next = this.props.status.next();
              if (next) this.props.setStatus(next)
            }}>
            <Text style={styles.statusArrowText}>keyboard_arrow_up</Text>
          </TouchableOpacity> : null}
        {/* Down Arrow */}
        {this.props.fontLoaded ?
          <TouchableOpacity style={styles.statusArrow}
            onPress={() => {
              const prev = this.props.status.prev();
              if (prev) this.props.setStatus(prev)
            }}>
            <Text style={styles.statusArrowText}>keyboard_arrow_down</Text>
          </TouchableOpacity> : null}
      </View>
      {noteModal}
      {mainNote}
    </View>;
  }
}
