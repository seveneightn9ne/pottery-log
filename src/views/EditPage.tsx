import React from 'react';
import {
  Alert,
  Dimensions,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Button from 'react-native-button';
import ElevatedView from 'react-native-elevated-view';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { connect } from 'react-redux';
import { Pot } from '../models/Pot';
import Status, { StatusString } from '../models/Status';
import { EditUiState, FullState } from '../reducers/types';
import style from '../style';
import { addImage, deletePot } from '../thunks/images';
import { PLThunkDispatch } from '../thunks/types';
import { deleteImage } from './components/Alerts';
import ImageList from './components/ImageList';
import StatusDetail from './components/StatusDetail';
import StatusSwitcher from './components/StatusSwitcher';

interface OwnProps {
  pot: Pot;
  fontLoaded: boolean;
}

const mapStateToProps = (state: FullState, { pot }: OwnProps) => ({
  images: pot.images3.map((name) => state.images.images[name]).filter((i) => !!i),
  new: (state.ui as EditUiState).new,
});

type PropsFromState = ReturnType<typeof mapStateToProps>;

const mapDispatchToProps = (dispatch: PLThunkDispatch, { pot }: OwnProps) => ({
  onChangeTitle: (newTitle: string) =>
    dispatch({
      type: 'pot-edit-field',
      field: 'title',
      value: newTitle,
      potId: pot.uuid,
    }),
  onChangeNote: (statusText: StatusString, noteText: string) =>
    dispatch({
      type: 'pot-edit-field',
      field: 'notes2',
      value: pot.notes2.withNoteForStatus(statusText, noteText),
      potId: pot.uuid,
    }),
  onNavigateToList: () =>
    dispatch({
      type: 'page-list',
    }),
  onAddImage: () => dispatch(addImage(pot)),
  onExpandImage: (name: string) =>
    dispatch({
      type: 'page-image',
      imageId: name,
    }),
  setStatus: (newStatus: StatusString) => {
    const newFullStatus = pot.status.withStatus(newStatus);
    dispatch({
      type: 'pot-edit-field',
      field: 'status',
      value: newFullStatus,
      potId: pot.uuid,
    });
  },
  setStatusDate: (date: Date) => {
    const currentStatus = pot.status.currentStatus();
    if (!currentStatus) {
      throw Error("Cannot set date when there's no status");
    }
    const newFullStatus = pot.status.withStatus(currentStatus, date);
    dispatch({
      type: 'pot-edit-field',
      field: 'status',
      value: newFullStatus,
      potId: pot.uuid,
    });
  },
  onDelete: () => {
    Alert.alert('Delete this pot?', undefined, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        onPress: () => {
          dispatch(deletePot(pot));
        },
      },
    ]);
  },
  onDeleteImage: (name: string) => deleteImage(dispatch, pot, name),
  onCopy: () =>
    dispatch({
      type: 'pot-copy',
      potId: pot.uuid,
      newPotId: String(Math.random()).substring(2),
      imageNames: pot.images3,
    }),
});

type PropsFromDispatch = ReturnType<typeof mapDispatchToProps>;

type EditPageProps = OwnProps & PropsFromState & PropsFromDispatch;

class EditPage extends React.Component<EditPageProps, {}> {
  public titleInput: React.RefObject<TextInput>;
  constructor(props: EditPageProps) {
    super(props);
    this.titleInput = React.createRef();
  }
  public render() {
    const { width } = Dimensions.get('window');
    const pot = this.props.pot;
    if (!pot) {
      return null;
    }
    const backButton = this.props.fontLoaded ? (
      <TouchableOpacity onPress={this.props.onNavigateToList}>
        <Text style={style.s.searchBack}>arrow_back</Text>
      </TouchableOpacity>
    ) : null;
    const editButton = this.props.fontLoaded ? (
      <TouchableOpacity onPress={this.focusTitle}>
        <Text style={style.s.search}>mode_edit</Text>
      </TouchableOpacity>
    ) : null;
    const mainImgSize = width - 100;

    /* status text */
    const currentStatus = pot.status.currentStatus();
    const currentStatusIndex = currentStatus
      ? Status.ordered().indexOf(currentStatus)
      : -1;
    const numStatusDetails = Status.ordered().length - currentStatusIndex - 2;
    const details = Status.ordered()
      .splice(currentStatusIndex + 1, numStatusDetails)
      .map((s, i) => (
        <StatusDetail
          key={s}
          fontLoaded={this.props.fontLoaded}
          note={(pot.notes2 && pot.notes2.notes[s]) || ''}
          status={s}
          date={pot.status.status[s] || new Date()}
          first={i === 0}
          last={i === numStatusDetails - 1}
          onChangeNote={this.props.onChangeNote}
        />
      ));
    const currentNoteText = pot.notes2.notes[pot.status.currentStatus()] || '';
    return (
      <View style={style.s.container}>
        <ElevatedView style={style.s.header} elevation={8}>
          {backButton}
          <TextInput
            style={style.s.searchBox}
            ref={this.titleInput}
            underlineColorAndroid="transparent"
            placeholderTextColor="#FFCCBC"
            onChangeText={this.props.onChangeTitle}
            value={pot.title}
            selectTextOnFocus={true}
            autoFocus={this.props.new}
          />
          {editButton}
        </ElevatedView>
        <KeyboardAwareScrollView extraHeight={100}>
          <View style={/*{elevation: 4, backgroundColor: '#fff'}*/null}>
            <ImageList
              size={mainImgSize}
              images={this.props.images}
              onAddImage={this.props.onAddImage}
              onClickImage={this.props.onExpandImage}
              onDeleteImage={this.props.onDeleteImage}
            />
            <StatusSwitcher
              fontLoaded={this.props.fontLoaded}
              status={pot.status}
              setStatus={this.props.setStatus}
              note={currentNoteText}
              onChangeNote={this.props.onChangeNote}
              date={pot.status.date()}
              onPickDate={this.props.setStatusDate}
            />
          </View>
          {details}
          <View style={style.s.detailPadding} />
        </KeyboardAwareScrollView>
        <ElevatedView
          style={style.s.bottomBar}
          elevation={details.length ? 8 : 0}
        >
          <Button
            onPress={this.props.onDelete}
            style={[style.s.button3, style.s.bbb]}
          >
            DELETE POT
          </Button>
          <Button
            onPress={this.props.onCopy}
            style={[style.s.button3, style.s.bbb]}
          >
            COPY POT
          </Button>
        </ElevatedView>
      </View>
    );
  }

  private focusTitle = () => {
    if (this.titleInput.current) {
      this.titleInput.current.focus();
    }
  }
}

export default connect<PropsFromState, PropsFromDispatch, OwnProps, FullState>(
  mapStateToProps,
  mapDispatchToProps,
)(EditPage);
