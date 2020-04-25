import React from 'react';
import {
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import Status, { StatusString } from '../../models/Status';
import style from '../../style';
import Note from './Note';
import NoteModal from './NoteModal';

interface StatusDetailProps {
  fontLoaded: boolean;
  note: string;
  status: StatusString;
  date: Date;
  first: boolean;
  last: boolean;
  onChangeNote: (status: StatusString, newNote: string) => void;
}

export default class StatusDetail extends React.Component<
  StatusDetailProps,
  {}
> {
  public modal: React.RefObject<NoteModal>;
  constructor(props: StatusDetailProps) {
    super(props);
    this.modal = React.createRef();
  }
  public render() {
    const noteComponent = (
      <Note
        fontLoaded={this.props.fontLoaded}
        textStyle={style.s.statusDetailNote as TextStyle}
        note={this.props.note}
        status={this.props.status}
        onChangeNote={this.props.onChangeNote}
      />
    );
    const editButton = this.props.fontLoaded ? (
      <TouchableOpacity onPress={this.openModal}>
        <Text style={[style.s.search, style.s.editDetail]}>
          {this.props.note ? 'mode_edit' : 'note_add'}
        </Text>
      </TouchableOpacity>
    ) : null;
    const noteModal = (
      <NoteModal
        note={this.props.note}
        status={this.props.status}
        ref={this.modal}
        onChangeNote={this.props.onChangeNote}
      />
    );
    const timelineStyles: ViewStyle[] = [style.s.timeline as ViewStyle];
    if (this.props.first) {
      timelineStyles.push(style.s.timelineFirst as ViewStyle);
    }
    if (this.props.last) {
      timelineStyles.push(style.s.timelineLast as ViewStyle);
    }
    if (!this.props.first && this.props.last) {
      timelineStyles.push(style.s.timelineLastOnly as ViewStyle);
    }
    if (this.props.first && this.props.last) {
      timelineStyles.push(style.s.timelineOnly as ViewStyle);
    }
    return (
      <View style={[style.s.statusDetail, { flexDirection: 'row' }]}>
        {noteModal}
        <View style={timelineStyles}>
          <View style={style.s.timelineInner} />
        </View>
        <View style={style.s.statusDetailInner}>
          <View style={{ flexDirection: 'row' }}>
            <Text style={style.s.status}>
              {Status.prettify(this.props.status)}
            </Text>
            <Text style={style.s.statusDetailDate}>
              {Status.dateText(this.props.date)}
            </Text>
          </View>
          {this.props.note ? noteComponent : null}
        </View>
        {editButton}
      </View>
    );
  }

  private openModal = () => {
    if (this.modal.current) {
      this.modal.current.open();
    }
  };
}
