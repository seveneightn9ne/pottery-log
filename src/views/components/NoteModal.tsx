import React from 'react';
import { Modal, Text, View } from 'react-native';
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

export default class NoteModal extends React.Component<NoteModalProps, {open: boolean}> {
  constructor(props: NoteModalProps) {
    super(props);
    this.state = {open: false};
  }
  public open = () => {
    this.setState({open: true});
  }
  public close = () => {
    this.setState({open: false});
  }
  public render() {
    return (
    <Modal
      animationType={'slide'}
      transparent={true}
      visible={this.state.open}
      onRequestClose={this.close}
    >
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <View style={styles.noteModal}>
          <Text style={styles.modalHeader}>
          {capitalize(Status.progressive(this.props.status))} Note
          </Text>
          <ExpandingTextInput
            value={this.props.note}
            multiline={true}
            numberOfLines={4}
            style={styles.modalInput}
            onChangeText={this.onChangeNote}
            autoFocus={true}
            onSubmit={this.close}
          />
          <Button onPress={this.close} style={[styles.button3, styles.modalButton]}>
            DONE
          </Button>
        </View>
      </View>
    </Modal>);
  }

  private onChangeNote = (t: string) => {
    this.props.onChangeNote(this.props.potId, this.props.status, t);
  }
}
