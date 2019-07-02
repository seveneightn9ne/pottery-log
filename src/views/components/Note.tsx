import React from 'react';
import {
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import Status, { StatusString } from '../../models/Status';
import styles from '../../style';
import NoteModal from './NoteModal';

interface AddNoteProps {
  onPress: () => void;
  status: StatusString;
}

function AddNote(props: AddNoteProps): JSX.Element {
  return (
    <TouchableOpacity onPress={props.onPress}>
      <Text style={styles.noteBlankText}>
        {'+ ' + Status.progressive(props.status) + ' note'}
      </Text>
    </TouchableOpacity>
  );
}

interface ShowNoteProps {
  onPress: () => void;
  note: string;
  fontLoaded: boolean;
  style: TextStyle;
  showAddNote: boolean;
}

function ShowNote(props: ShowNoteProps) {
  const button =
    props.fontLoaded && props.showAddNote ? (
      <Text style={[props.style, styles.noteEdit]}>mode_edit</Text>
    ) : null;
  return (
    <TouchableOpacity onPress={props.onPress}>
      <View style={{ flexDirection: 'row' }}>
        <Text style={[props.style, { flex: 1 }]}>{props.note}</Text>
        {button}
      </View>
    </TouchableOpacity>
  );
}

interface NoteProps {
  status: StatusString;
  fontLoaded: boolean;
  showAddNote: boolean;
  showNote: boolean;
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
    const addNote = <AddNote onPress={openModal} status={this.props.status} />;
    const showNote = (
      <ShowNote
        fontLoaded={this.props.fontLoaded}
        showAddNote={this.props.showAddNote}
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
        {this.props.note
          ? this.props.showNote
            ? showNote
            : null
          : this.props.showAddNote
          ? addNote
          : null}
      </View>
    );
  }
}
