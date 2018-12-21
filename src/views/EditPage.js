// @flow
import React from 'react';
import { StyleSheet, Text, View, ScrollView, TextInput, TouchableHighlight, Image, Dimensions, Picker, TouchableOpacity } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { ExpandingTextInput } from './components/ExpandingTextInput.js'
import { Pot } from '../models/Pot.js';
import Status from '../models/Status.js';
import styles from '../style.js'
import ImagePicker from './components/ImagePicker.js';
import ImageList from './components/ImageList.js';
import Image3 from './components/Image3.js';
import StatusDetail from './components/StatusDetail.js';
import StatusSwitcher from './components/StatusSwitcher.js';
import { Note } from './components/Note.js';
import { nameToImageState, isAnySyncing } from '../stores/ImageStore.js';
import Button from 'react-native-button';

type EditPageProps = {
  pot: Pot,
  ui: Object, // UIState
  imageStoreState: Object, // ImageStoreState
  onChangeTitle: (text: string) => void,
  onChangeNote: (potId: string, status: string, text: string) => void,
  onNavigateToList: () => void,
  onAddImage: (potId: string, localUri: string) => void,
  onSetMainImage: (potId, imageName: string) => void,
  onDeleteImage: (imageName) => void,
  setStatus: (newStatus) => void,
  setStatusDate: (date) => void,
  onDelete: () => void,
  onCopy: () => void,
};

export default class EditPage extends React.Component {
  titleInput: TextInput;
  render() {
    const { height, width } = Dimensions.get('window');
    const pot = this.props.pot;
    const backButton = this.props.fontLoaded ?
      <TouchableOpacity onPress={this.props.onNavigateToList}>
        <Text style={styles.searchBack}>arrow_back</Text>
      </TouchableOpacity> : null;
    let editButton = this.props.fontLoaded ?
      <TouchableOpacity onPress={() => {
        if (this.titleInput) {
          this.titleInput.focus();
        }
      }}>
        <Text style={styles.search}>mode_edit</Text>
      </TouchableOpacity>
      : null;
    const mainImgSize = width - 100;

    /* syncing */
    const isSyncing = isAnySyncing(pot.images3);
    const syncingText = isSyncing ? "🔁" : "✓";
    const syncingColor = isSyncing ? "#1122FF" : "#00CC00";
    const syncing = <Text style={{ color: syncingColor, padding: 5, paddingLeft: 15 }}>{syncingText}</Text>

    /* status text */
    const currentStatusIndex = Status.ordered().indexOf(pot.status.currentStatus());
    const numStatusDetails = Status.ordered().length - currentStatusIndex - 2;
    const details = Status.ordered().splice(currentStatusIndex + 1, numStatusDetails).map((s, i) =>
      <StatusDetail key={s} fontLoaded={this.props.fontLoaded}
        note={pot.notes2 && pot.notes2[s] || undefined}
        status={s} potId={pot.uuid} date={pot.status[s]}
        first={i == 0} last={i == numStatusDetails - 1}
        onChangeNote={this.props.onChangeNote} />
    );
    const currentNoteText = pot.notes2[pot.status.currentStatus()];
    const bottomBarStyle = [styles.bottomBar,];
    if (details.length) {
      bottomBarStyle.push(styles.bottomBarWithContent);
    }
    return <View style={styles.container}>
      <View style={[styles.header, { elevation: 8 }]}>
        {backButton}
        <TextInput style={styles.searchBox}
          ref={(e) => this.titleInput = e}
          underlineColorAndroid='transparent'
          placeholderTextColor='#FFCCBC'
          onChangeText={(text) => this.props.onChangeTitle(pot.uuid, text)}
          value={pot.title} selectTextOnFocus={true} autoFocus={this.props.ui.new}
        />
        {editButton}
      </View>
      <KeyboardAwareScrollView style={styles.page} extraHeight={100}>
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
