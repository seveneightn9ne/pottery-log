import React from 'react';
import Status, { StatusString } from '../../models/Status';
import { Text, View, TouchableOpacity, ViewStyle } from 'react-native';
import styles from '../../style';
import {Note, NoteModal} from './Note';

type StatusDetailProps = {
  fontLoaded: boolean,
  note: string,
  status: StatusString,
  date: Date,
  potId: string,
  first: boolean,
  last: boolean,
  onChangeNote: (potId: string, status: StatusString, newNote: string) => void,
};

export default class StatusDetail extends React.Component<StatusDetailProps, {}> {
  modal: React.RefObject<NoteModal>;
  constructor(props: StatusDetailProps) {
    super(props);
    this.modal = React.createRef();
  }
  render() {
    const noteComponent = <Note fontLoaded={this.props.fontLoaded}
      textStyle={styles.statusDetailNote}
      note={this.props.note} status={this.props.status}
      potId={this.props.potId} onChangeNote={this.props.onChangeNote}
      showNote={true} showAddNote={false} />;
    const editButton = this.props.fontLoaded ?
          <TouchableOpacity onPress={() => {this.modal.current && this.modal.current.open()}}>
	    <Text style={[styles.search, styles.editDetail]}>
	      {this.props.note ? 'mode_edit' : 'note_add'}
	    </Text>
          </TouchableOpacity>
        : null;
    const noteModal = <NoteModal note={this.props.note}
      status={this.props.status}
      potId={this.props.potId} ref={this.modal}
      onChangeNote={this.props.onChangeNote} />
    const timelineStyles: ViewStyle[] = [styles.timeline];
    if (this.props.first) timelineStyles.push(styles.timelineFirst);
    if (this.props.last) timelineStyles.push(styles.timelineLast);
    if (!this.props.first && this.props.last) timelineStyles.push(styles.timelineLastOnly);
    if (this.props.first && this.props.last) timelineStyles.push(styles.timelineOnly);
    return <View style={[styles.statusDetail, {flexDirection: 'row'}]}>
      {noteModal}
      <View style={timelineStyles}>
	<View style={styles.timelineInner} />
      </View>
      <View style={styles.statusDetailInner}>
	<View style={{flexDirection: 'row'}}>
	    <Text style={styles.status}>
	    {Status.prettify(this.props.status)}</Text>
	    <Text style={styles.statusDetailDate}> {Status.dateText(this.props.date)} </Text>
	</View>
	{this.props.note ? noteComponent : null}
      </View>
      {editButton}
    </View>;
  }
}
