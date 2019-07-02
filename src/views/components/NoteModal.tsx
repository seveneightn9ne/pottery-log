import React from 'react';
import Status, { capitalize, StatusString } from '../../models/Status';
import styles from '../../style';
import { ExpandingTextInput } from './ExpandingTextInput';
import Modal from './Modal';

interface NoteModalProps {
  note: string;
  status: StatusString;
  onChangeNote: (status: StatusString, newNote: string) => void;
}

export default class NoteModal extends React.Component<
  NoteModalProps,
  { open: boolean }
> {
  constructor(props: NoteModalProps) {
    super(props);
    this.state = { open: false };
  }
  public open = () => {
    this.setState({ open: true });
  }
  public close = () => {
    this.setState({ open: false });
  }
  public render() {
    return (
      <Modal
        header={capitalize(Status.progressive(this.props.status)) + ' Note'}
        body={
          <ExpandingTextInput
            value={this.props.note}
            multiline={true}
            numberOfLines={4}
            style={styles.modalInput}
            onChangeText={this.onChangeNote}
            autoFocus={true}
            onSubmit={this.close}
          />
        }
        buttons={[{ text: 'DONE' }]}
        open={this.state.open}
        close={this.close}
      />
    );
  }

  private onChangeNote = (t: string) => {
    this.props.onChangeNote(this.props.status, t);
  }
}
