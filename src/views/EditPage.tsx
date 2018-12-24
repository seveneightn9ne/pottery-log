import React from 'react';
import { Dimensions, Text, TextInput, TouchableOpacity, View, ViewStyle } from 'react-native';
import Button from 'react-native-button';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Pot } from '../models/Pot';
import Status, { StatusString } from '../models/Status';
import { EditUiState } from '../stores/UIStore';
import styles from '../style';
import ImageList from './components/ImageList';
import StatusDetail from './components/StatusDetail';
import StatusSwitcher from './components/StatusSwitcher';

interface EditPageProps {
  pot: Pot;
  ui: EditUiState;
  fontLoaded: boolean;
  onChangeTitle: (potId: string, text: string) => void;
  onChangeNote: (potId: string, status: StatusString, text: string) => void;
  onNavigateToList: () => void;
  onAddImage: (potId: string, localUri: string) => void;
  onSetMainImage: (potId: string, imageName: string) => void;
  onDeleteImage: (imageName: string) => void;
  onExpandImage: (imageName: string) => void;
  setStatus: (newStatus: StatusString) => void;
  setStatusDate: (date: Date) => void;
  onDelete: () => void;
  onCopy: () => void;
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
    const backButton = this.props.fontLoaded ?
      <TouchableOpacity onPress={this.props.onNavigateToList}>
        <Text style={styles.searchBack}>arrow_back</Text>
      </TouchableOpacity> : null;
    const editButton = this.props.fontLoaded ?
      <TouchableOpacity onPress={() => {
        if (this.titleInput.current) {
          this.titleInput.current.focus();
        }
      }}>
        <Text style={styles.search}>mode_edit</Text>
      </TouchableOpacity>
      : null;
    const mainImgSize = width - 100;

    /* status text */
    const currentStatus = pot.status.currentStatus();
    const currentStatusIndex = currentStatus ? Status.ordered().indexOf(currentStatus) : -1;
    const numStatusDetails = Status.ordered().length - currentStatusIndex - 2;
    const details = Status.ordered().splice(currentStatusIndex + 1, numStatusDetails).map((s, i) =>
      <StatusDetail key={s} fontLoaded={this.props.fontLoaded}
        note={pot.notes2 && pot.notes2.notes[s] || ''}
        status={s} potId={pot.uuid} date={pot.status.status[s] || new Date()}
        first={i == 0} last={i == numStatusDetails - 1}
        onChangeNote={this.props.onChangeNote} />,
    );
    const currentNoteText = pot.notes2.notes[pot.status.currentStatus()] || '';
    const bottomBarStyle: ViewStyle[] = [styles.bottomBar];
    if (details.length) {
      bottomBarStyle.push(styles.bottomBarWithContent);
    }
    return <View style={styles.container}>
      <View style={[styles.header, { elevation: 8 }]}>
        {backButton}
        <TextInput style={styles.searchBox}
          ref={this.titleInput}
          underlineColorAndroid="transparent"
          placeholderTextColor="#FFCCBC"
          onChangeText={(text) => this.props.onChangeTitle(pot.uuid, text)}
          value={pot.title} selectTextOnFocus={true} autoFocus={this.props.ui.new}
        />
        {editButton}
      </View>
      <KeyboardAwareScrollView extraHeight={100}>
        <View style={/*{elevation: 4, backgroundColor: '#fff'}*/null}>
          <ImageList size={mainImgSize} images={pot.images3}
            onAddImage={(i) => this.props.onAddImage(pot.uuid, i)}
            onClickImage={this.props.onExpandImage}
            onDeleteImage={(i) => this.props.onDeleteImage(i)} />
          <StatusSwitcher fontLoaded={this.props.fontLoaded}
            status={pot.status} setStatus={this.props.setStatus}
            note={currentNoteText}
            onChangeNote={this.props.onChangeNote} potId={pot.uuid}
            date={pot.status.date()}
            onPickDate={this.props.setStatusDate}
          />
        </View>
        {details}
        <View style={styles.detailPadding} />
      </KeyboardAwareScrollView>
      <View style={bottomBarStyle}>
        <Button onPress={this.props.onDelete} style={[styles.button3, styles.bbb]}>DELETE POT</Button>
        <Button onPress={this.props.onCopy} style={[styles.button3, styles.bbb]}>COPY POT</Button>
      </View>
    </View>;
  }
}
