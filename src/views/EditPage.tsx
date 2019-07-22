import React from 'react';
import {
  Dimensions,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Button from 'react-native-button';
import ElevatedView from 'react-native-elevated-view';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Pot } from '../models/Pot';
import Status, { StatusString } from '../models/Status';
import { EditUiState, ImageStoreState } from '../reducers/types';
import styles from '../style';
import ImageList from './components/ImageList';
import StatusDetail from './components/StatusDetail';
import StatusSwitcher from './components/StatusSwitcher';

interface EditPageProps {
  pot: Pot;
  images: ImageStoreState;
  ui: EditUiState;
  fontLoaded: boolean;
  onChangeTitle: (potId: string, text: string) => void;
  onChangeNote: (currentPot: Pot, status: StatusString, text: string) => void;
  onNavigateToList: () => void;
  onAddImage: (currentPot: Pot) => void;
  onSetMainImage: (currentPot: Pot, imageName: string) => void;
  onDeleteImage: (currentPot: Pot, imageName: string) => void;
  onExpandImage: (imageName: string) => void;
  setStatus: (currentPot: Pot, newStatus: StatusString) => void;
  setStatusDate: (currentPot: Pot, date: Date) => void;
  onDelete: (currentPot: Pot) => void;
  onCopy: (currentPot: Pot) => void;
}

export default class EditPage extends React.Component<EditPageProps, {}> {
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
