// @flow
import Button from 'react-native-button';
import React from 'react';
import Status from '../../models/Status.js';
import { Text, View, TouchableOpacity, Modal, TextInput } from 'react-native';
import styles from '../../style.js';
import { ExpandingTextInput } from './ExpandingTextInput.js'

type NoteProps = {
  potId: string,
  note: string,
  status: string,
  onChangeNote: (potId, status, newNote) => void,
};

export class NoteModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {open: false};
  }
  open() {
    this.setState({open: true});
  }
  close() {
    this.setState({open: false});
  }
  render() {
    return <Modal animationType={"slide"} transparent={true}
      visible={this.state.open}
      onRequestClose={() => this.close()}>
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
      	<View style={styles.noteModal}>
          <Text style={styles.modalHeader}>
	    {Status.progressive(this.props.status).capitalize()} Note
	  </Text>
          <ExpandingTextInput value={this.props.note} multiline={true} numberOfLines={4}
            style={styles.modalInput}
            onChangeText={(t) => this.props.onChangeNote(this.props.potId, this.props.status, t)}
            autoFocus={true}
            onSubmit={() => this.close()} />
          <Button onPress={() => this.close()} style={[styles.button3, styles.modalButton]}>
          DONE</Button>
        </View>
      </View>
    </Modal>
  }
}

class AddNote extends React.Component {
  render() {
    return <TouchableOpacity onPress={this.props.onPress}>
      <Text style={styles.noteBlankText}>
        {"+ " + Status.progressive(this.props.status) + " note"}
      </Text>
    </TouchableOpacity>
  }
}

class ShowNote extends React.Component {
  render() {
    return <TouchableOpacity onPress={this.props.onPress}>
      <View style={{flexDirection: 'row'}}>
        <Text style={[this.props.style, {flex: 1}]}>{this.props.note}</Text>
        {this.props.fontLoaded && this.props.showAddNote ?
      	  <Text style={[this.props.style, styles.noteEdit]}>mode_edit</Text>
      	  : null}
    </View></TouchableOpacity>;
  }

}

export class Note extends React.Component {
  render() {
    openModal = () => {this.modal && this.modal.open()}
    const addNote = <AddNote onPress={openModal} status={this.props.status} />
    const showNote = <ShowNote fontLoaded={this.props.fontLoaded}
      showAddNote={this.props.showAddNote}
      style={this.props.textStyle} onPress={openModal} note={this.props.note} />
    return <View style={this.props.style}>
      <NoteModal note={this.props.note} status={this.props.status} potId={this.props.potId}
	ref={(e) => this.modal = e} onChangeNote={this.props.onChangeNote} />
      {this.props.note ? (this.props.showNote ? showNote : null) :
        (this.props.showAddNote ? addNote : null)}
    </View>;
  }
}
