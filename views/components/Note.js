// @flow
import React from 'react';
import Status from '../../models/Status.js';
import { Text, View, Button, TouchableOpacity, Modal, TextInput } from 'react-native';
import styles from '../../style.js';
import { ExpandingTextInput } from './ExpandingTextInput.js'

type NoteProps = {
  potId: string,
  note: string,
  status: string,
  onChangeNote: (potId, status, newNote) => void,
};

class NoteModal extends React.Component {
  render() {
    return <Modal animationType={"slide"} transparent={true}
      visible={this.props.modalOpen}
      onRequestClose={this.props.closeModal}>
      <View style={{margin: 30, padding: 10, backgroundColor: 'white', borderWidth: 1}}>
        <View>
          <Text style={styles.h2}>{Status.progressive(this.props.status).capitalize()} Note</Text>
          <ExpandingTextInput value={this.props.note} multiline={true} numberOfLines={4}
            style={{fontSize: 16, marginBottom: 20}}
            onChangeText={(t) => this.props.onChangeNote(this.props.potId, this.props.status, t)}
            autoFocus={true} />
          <Button title="Done" onPress={this.props.closeModal} />
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
      <View><Text style={{fontSize: 16}}>{this.props.note}</Text></View>
    </TouchableOpacity>
  }

}

export default class Note extends React.Component {
  constructor(props: NoteProps) {
    super(props);
    this.state = { modalOpen: false };
  }
  render() {
    closeModal = () => {this.setState({modalOpen: false})}
    openModal = () => {this.setState({modalOpen: true})}
    const addNote = <AddNote onPress={openModal} status={this.props.status} />
    const showNote = <ShowNote onPress={openModal} note={this.props.note} />
    return <View style={this.props.style}>
      <NoteModal note={this.props.note} status={this.props.status} potId={this.props.potId}
        modalOpen={this.state.modalOpen} closeModal={closeModal}
        onChangeNote={this.props.onChangeNote} />
      {this.props.note ? (this.props.showNote ? showNote : null) :
        (this.props.showAddNote ? addNote : null)}
    </View>;
  }
}
