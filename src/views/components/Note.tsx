import React from 'react';
import {
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { StatusString } from '../../models/Status';
import NoteModal from './NoteModal';

interface ShowNoteProps {
  onPress: () => void;
  note: string;
  fontLoaded: boolean;
  style: TextStyle;
}

function ShowNote(props: ShowNoteProps) {
  return (
    <TouchableOpacity onPress={props.onPress}>
      <View style={{ flexDirection: 'row' }}>
        <Text style={[props.style, { flex: 1 }]}>{props.note}</Text>
      </View>
    </TouchableOpacity>
  );
}

interface NoteProps {
  status: StatusString;
  fontLoaded: boolean;
  textStyle: TextStyle;
  style?: ViewStyle | ViewStyle[];
  note: string;
  onChangeNote: (status: StatusString, newNote: string) => void;
}
export default class Note extends React.Component<NoteProps, {}> {
  private modal: React.RefObject<NoteModal>;
  constructor(props: NoteProps) {
    super(props);
    this.modal = React.createRef();
  }
  public render() {
    const openModal = () => {
      if (this.modal.current) {
        this.modal.current.open();
      }
    };
    const showNote = (
      <ShowNote
        fontLoaded={this.props.fontLoaded}
        style={this.props.textStyle}
        onPress={openModal}
        note={this.props.note}
      />
    );
    return (
      <View style={this.props.style}>
        <NoteModal
          note={this.props.note}
          status={this.props.status}
          ref={this.modal}
          onChangeNote={this.props.onChangeNote}
        />
        {this.props.note ? showNote : null}
      </View>
    );
  }
}
