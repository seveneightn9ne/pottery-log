// @flow
import React from 'react';
import Status from '../../models/Status.js';
import { Text, View, Button, TouchableOpacity, Modal, TextInput } from 'react-native';
import styles from '../../style.js';

type NoteProps = {
  potId: string,
  note: string,
  status: string,
  onChangeNote: (potId, status, newNote) => void,
};

export default class Note extends React.Component {
  constructor(props: NoteProps) {
    super(props);
    this.state = { modalOpen: false };
  }
  render() {
    console.log("note props", this.props);
    closeModal = () => {this.setState({modalOpen: false})}
    return <View>
      <Modal animationType={"slide"} transparent={true}
        visible={this.state.modalOpen}
        onRequestClose={closeModal}>
        <View style={{margin: 30, padding: 10, backgroundColor: 'white', borderWidth: 1}}>
          <View>
            <Text style={styles.h2}>{Status.progressive(this.props.status).capitalize()} Note</Text>
            <TextInput value={this.props.note} multiline={true} numberOfLines={4}
              onChangeText={(t) => this.props.onChangeNote(this.props.potId, this.props.status, t)}
              autoFocus={true} />
            <Button title="Done" onPress={closeModal} />
          </View>
        </View>
      </Modal>

      <TouchableOpacity onPress={() => this.setState({modalOpen: true})}
        style={styles.note}>
        <Text style={this.props.note ? {fontSize: 16} : styles.noteBlankText}>
          {this.props.note ? this.props.note :
            "+ " + Status.progressive(this.props.status) + " note"}
        </Text>
      </TouchableOpacity>
    </View>;
  }
}
