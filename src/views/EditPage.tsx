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
import styles from '../style';
import { addImage } from '../thunks/images';
import { PLThunkDispatch } from '../thunks/types';
import { deleteImage } from './components/Alerts';
import ImageList from './components/ImageList';
import StatusDetail from './components/StatusDetail';
import StatusSwitcher from './components/StatusSwitcher';

interface OwnProps {
  pot: Pot;
  fontLoaded: boolean;
}

// TODO move more computed values into mapStateToProps
const mapStateToProps = (state: FullState) => ({
  images: state.images,
  ui: state.ui as EditUiState,
});

type PropsFromState = ReturnType<typeof mapStateToProps>;

const mapDispatchToProps = (dispatch: PLThunkDispatch) => ({
  onChangeTitle: (potId: string, newTitle: string) =>
    dispatch({
      type: 'pot-edit-field',
      field: 'title',
      value: newTitle,
      potId,
    }),
  onChangeNote: (currentPot: Pot, statusText: StatusString, noteText: string) =>
    dispatch({
      type: 'pot-edit-field',
      field: 'notes2',
      value: currentPot.notes2.withNoteForStatus(statusText, noteText),
      potId: currentPot.uuid,
    }),
  onNavigateToList: () =>
    dispatch({
      type: 'page-list',
    }),
  onAddImage: (currentPot: Pot) => dispatch(addImage(currentPot)),
  onExpandImage: (name: string) =>
    dispatch({
      type: 'page-image',
      imageId: name,
    }),
  setStatus: (currentPot: Pot, newStatus: StatusString) => {
    const newFullStatus = currentPot.status.withStatus(newStatus);
    dispatch({
      type: 'pot-edit-field',
      field: 'status',
      value: newFullStatus,
      potId: currentPot.uuid,
    });
  },
  setStatusDate: (currentPot: Pot, date: Date) => {
    const currentStatus = currentPot.status.currentStatus();
    if (!currentStatus) {
      throw Error("Cannot set date when there's no status");
    }
    const newFullStatus = currentPot.status.withStatus(currentStatus, date);
    dispatch({
      type: 'pot-edit-field',
      field: 'status',
      value: newFullStatus,
      potId: currentPot.uuid,
    });
  },
  onDelete: (currentPot: Pot) => {
    Alert.alert('Delete this pot?', undefined, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        onPress: () => {
          dispatch({
            type: 'pot-delete',
            potId: currentPot.uuid,
            imageNames: currentPot.images3,
          });
        },
      },
    ]);
  },
  onDeleteImage: (currentPot: Pot, name: string) =>
    deleteImage(dispatch, currentPot, name),
  onCopy: (currentPot: Pot) =>
    dispatch({
      type: 'pot-copy',
      potId: currentPot.uuid,
      newPotId: String(Math.random()).substring(2),
      imageNames: currentPot.images3,
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
        <Text style={styles.searchBack}>arrow_back</Text>
      </TouchableOpacity>
    ) : null;
    const editButton = this.props.fontLoaded ? (
      <TouchableOpacity onPress={this.focusTitle}>
        <Text style={styles.search}>mode_edit</Text>
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
          onChangeNote={this.onChangeNote}
        />
      ));
    const currentNoteText = pot.notes2.notes[pot.status.currentStatus()] || '';
    const images = pot.images3.map((name) => this.props.images.images[name]);
    return (
      <View style={styles.container}>
        <ElevatedView style={styles.header} elevation={8}>
          {backButton}
          <TextInput
            style={styles.searchBox}
            ref={this.titleInput}
            underlineColorAndroid="transparent"
            placeholderTextColor="#FFCCBC"
            onChangeText={this.onChangeTitle}
            value={pot.title}
            selectTextOnFocus={true}
            autoFocus={this.props.ui.new}
          />
          {editButton}
        </ElevatedView>
        <KeyboardAwareScrollView extraHeight={100}>
          <View style={/*{elevation: 4, backgroundColor: '#fff'}*/null}>
            <ImageList
              size={mainImgSize}
              images={images}
              onAddImage={this.onAddImage}
              onClickImage={this.props.onExpandImage}
              onDeleteImage={this.onDeleteImage}
            />
            <StatusSwitcher
              fontLoaded={this.props.fontLoaded}
              status={pot.status}
              setStatus={this.setStatus}
              note={currentNoteText}
              onChangeNote={this.onChangeNote}
              date={pot.status.date()}
              onPickDate={this.onSetStatusDate}
            />
          </View>
          {details}
          <View style={styles.detailPadding} />
        </KeyboardAwareScrollView>
        <ElevatedView
          style={styles.bottomBar}
          elevation={details.length ? 8 : 0}
        >
          <Button onPress={this.onDelete} style={[styles.button3, styles.bbb]}>
            DELETE POT
          </Button>
          <Button onPress={this.onCopy} style={[styles.button3, styles.bbb]}>
            COPY POT
          </Button>
        </ElevatedView>
      </View>
    );
  }

  private onAddImage = () => this.props.onAddImage(this.props.pot);
  private onChangeTitle = (text: string) =>
    this.props.onChangeTitle(this.props.pot.uuid, text)
  private onChangeNote = (status: StatusString, note: string) =>
    this.props.onChangeNote(this.props.pot, status, note)
  private onDeleteImage = (imageName: string) =>
    this.props.onDeleteImage(this.props.pot, imageName)
  private setStatus = (newStatus: StatusString) =>
    this.props.setStatus(this.props.pot, newStatus)
  private onSetStatusDate = (newDate: Date) =>
    this.props.setStatusDate(this.props.pot, newDate)
  private onCopy = () => this.props.onCopy(this.props.pot);
  private onDelete = () => this.props.onDelete(this.props.pot);

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
