import React from 'react';
import {
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import ElevatedView from 'react-native-elevated-view';
import Status, { StatusString } from '../../models/Status';
import style from '../../style';
import DatePicker from './DatePicker';
import Note from './Note';
import NoteModal from './NoteModal';

interface StatusSwitcherProps {
  fontLoaded: boolean;
  status: Status;
  note: string;
  date: Date;
  setStatus: (newStatus: StatusString) => void;
  onPickDate: (newDate: Date) => void;
  onChangeNote: (status: StatusString, newNote: string) => void;
}

export default class StatusSwitcher extends React.Component<
  StatusSwitcherProps
> {
  public modal: React.RefObject<NoteModal>;
  constructor(props: StatusSwitcherProps) {
    super(props);
    this.modal = React.createRef();
  }
  public render() {
    const editButton = this.props.fontLoaded ? (
      <TouchableOpacity onPress={this.openModal}>
        <Text style={style.s.addMainNote}>
          {this.props.note ? 'mode_edit' : 'note_add'}
        </Text>
      </TouchableOpacity>
    ) : null;
    const noteModal = (
      <NoteModal
        note={this.props.note}
        status={this.props.status.currentStatus()}
        ref={this.modal}
        onChangeNote={this.props.onChangeNote}
      />
    );
    let mainNoteStyle: ViewStyle | ViewStyle[] = style.s.mainNote as ViewStyle;
    if (!this.props.status.hasTimeline()) {
      mainNoteStyle = [
        style.s.mainNote as ViewStyle,
        style.s.mainNoteNoBar as ViewStyle,
      ];
    }
    const mainNote = this.props.note ? (
      <Note
        style={mainNoteStyle}
        textStyle={style.s.mainNoteText as TextStyle}
        fontLoaded={this.props.fontLoaded}
        status={this.props.status.currentStatus()}
        note={this.props.note}
        onChangeNote={this.props.onChangeNote}
      />
    ) : null;

    const upArrow = this.props.fontLoaded ? (
      <TouchableOpacity style={style.s.statusArrow} onPress={this.onPressUp}>
        <Text style={style.s.statusArrowText}>keyboard_arrow_up</Text>
      </TouchableOpacity>
    ) : null;

    const downArrow = this.props.fontLoaded ? (
      <TouchableOpacity style={style.s.statusArrow} onPress={this.onPressDown}>
        <Text style={style.s.statusArrowText}>keyboard_arrow_down</Text>
      </TouchableOpacity>
    ) : null;

    return (
      <View>
        <View style={style.s.statusSwitcher}>
          <Text style={style.s.mainStatus}>
            {Status.longterm(this.props.status.currentStatus())}
          </Text>
          <DatePicker
            value={this.props.date}
            fontLoaded={this.props.fontLoaded}
            onPickDate={this.props.onPickDate}
          />
          {editButton}
        </View>
        <ElevatedView style={style.s.statusArrows} elevation={4}>
          {upArrow}
          {downArrow}
        </ElevatedView>
        {noteModal}
        {mainNote}
      </View>
    );
  }

  private onPressUp = () => {
    const next = this.props.status.next();
    if (next) {
      this.props.setStatus(next);
    }
  };

  private onPressDown = () => {
    const prev = this.props.status.prev();
    if (prev) {
      this.props.setStatus(prev);
    }
  };

  private openModal = () => {
    if (this.modal.current) {
      this.modal.current.open();
    }
  };
}
