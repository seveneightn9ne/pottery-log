import React from 'react';
import { Modal, Text, TextStyle, TouchableOpacity, View, ViewStyle } from 'react-native';
import Button from 'react-native-button';
import Status, { capitalize, StatusString } from '../../models/Status';
import styles from '../../style';
import { ExpandingTextInput } from './ExpandingTextInput';

interface NoteModalProps {
  potId: string;
  note: string;
  status: StatusString;
  onChangeNote: (potId: string, status: StatusString, newNote: string) => void;
}

export class NoteModal extends React.Component<NoteModalProps, {open: boolean}> {
  constructor(props: NoteModalProps) {
    super(props);
    this.state = {open: false};
  }
  public open() {
    this.setState({open: true});
  }
  public close() {
    this.setState({open: false});
  }
  public render() {
    return <Modal animationType={'slide'} transparent={true}
      visible={this.state.open}
      onRequestClose={() => this.close()}>
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
      	<View style={styles.noteModal}>
          <Text style={styles.modalHeader}>
	    {capitalize(Status.progressive(this.props.status))} Note
	  </Text>
          <ExpandingTextInput value={this.props.note} multiline={true} numberOfLines={4}
            style={styles.modalInput}
            onChangeText={(t: string) => this.props.onChangeNote(this.props.potId, this.props.status, t)}
            autoFocus={true}
            onSubmit={() => this.close()} />
          <Button onPress={() => this.close()} style={[styles.button3, styles.modalButton]}>
          DONE</Button>
        </View>
      </View>
    </Modal>;
  }
}

interface AddNoteProps {
  onPress: () => void;
  status: StatusString;
}

function AddNote(props: AddNoteProps): JSX.Element {
  return <TouchableOpacity onPress={props.onPress}>
    <Text style={styles.noteBlankText}>
      {'+ ' + Status.progressive(props.status) + ' note'}
    </Text>
  </TouchableOpacity>;
}

interface ShowNoteProps {
  onPress: () => void;
  note: string;
  fontLoaded: boolean;
  style: TextStyle;
  showAddNote: boolean;
}

function ShowNote(props: ShowNoteProps) {
  return <TouchableOpacity onPress={props.onPress}>
    <View style={{flexDirection: 'row'}}>
      <Text style={[props.style, {flex: 1}]}>{props.note}</Text>
      {props.fontLoaded && props.showAddNote ?
        <Text style={[props.style, styles.noteEdit]}>mode_edit</Text>
        : null}
  </View></TouchableOpacity>;
}

interface NoteProps {
  status: StatusString;
  fontLoaded: boolean;
  showAddNote: boolean;
  showNote: boolean;
  potId: string;
  textStyle: TextStyle;
  style?: ViewStyle | ViewStyle[];
  note: string;
  onChangeNote: (potId: string, status: StatusString, newNote: string) => void;
}
export class Note extends React.Component<NoteProps, {}> {
  private modal: React.RefObject<NoteModal>;
  constructor(props: NoteProps) {
    super(props);
    this.modal = React.createRef();
  }
  public render() {
    const openModal = () => {this.modal.current && this.modal.current.open();};
    const addNote = <AddNote onPress={openModal} status={this.props.status} />;
    const showNote = <ShowNote fontLoaded={this.props.fontLoaded}
      showAddNote={this.props.showAddNote}
      style={this.props.textStyle} onPress={openModal} note={this.props.note} />;
    return <View style={this.props.style}>
      <NoteModal note={this.props.note} status={this.props.status} potId={this.props.potId}
	      ref={this.modal} onChangeNote={this.props.onChangeNote} />
      {this.props.note ? (this.props.showNote ? showNote : null) :
        (this.props.showAddNote ? addNote : null)}
    </View>;
  }
}
