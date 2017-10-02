// @flow
import React from 'react';
import { StyleSheet, Text, View, ScrollView, TextInput, TouchableHighlight, Image, Dimensions, Picker, Button, TouchableOpacity } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { ExpandingTextInput } from './components/ExpandingTextInput.js'
import {Pot} from '../models/Pot.js';
import Status from '../models/Status.js';
import styles from '../style.js'
import ImagePicker from './components/ImagePicker.js';
import ImageList from './components/ImageList.js';
import Image3 from './components/Image3.js';
import DatePicker from './components/DatePicker.js';
import StatusDetail from './components/StatusDetail.js';
import StatusSwitcher from './components/StatusSwitcher.js';
import Note from './components/Note.js';
import {nameToImageState, isAnySyncing} from '../stores/ImageStore.js';

type EditPageProps = {
  pot: Pot,
  ui: Object, // UIState
  imageStoreState: Object, // ImageStoreState
  onChangeTitle: (text: string) => void,
  onChangeNote: (potId: string, status: string, text: string) => void,
  onNavigateToList: () => void,
  onAddImage: (potId, localUri) => void,
  onSetMainImage: (potId, imageName) => void,
  onDeleteImage: (imageName) => void,
  setStatus: (newStatus) => void,
  setStatusDate: (date) => void,
  onDelete: () => void,
  onCopy: () => void,
};

export default class EditPage extends React.Component {
  render() {
    const {height, width} = Dimensions.get('window');
    const pot = this.props.pot;
    const mainImgSize = width - 50;
    const mainImage = (pot.images3.length) ?
      <TouchableOpacity onLongPress={() => this.props.onDeleteImage(pot.images3[0])}>
        <Image3 image={nameToImageState(pot.images3[0])} style={{height: mainImgSize, width: mainImgSize}} />
      </TouchableOpacity> :
      <ImagePicker onPicked={(i) => this.props.onAddImage(pot.uuid, i)}
        style={{height: 150, width: width}} />;
    const imageList = (pot.images3.length) ?
      <ImageList images={pot.images3} style={{height: mainImgSize}}
        onAddImage={(i) => this.props.onAddImage(pot.uuid, i)}
        onClickImage={(i) => this.props.onSetMainImage(pot.uuid, i)}
        onDeleteImage={(i) => this.props.onDeleteImage(i)} /> :
      null;

    /* syncing */
    const isSyncing = isAnySyncing(pot.images3);
    const syncingText = isSyncing ? "🔁" : "✓";
    const syncingColor = isSyncing ? "#1122FF" : "#00CC00";
    const syncing = <Text style={{color: syncingColor, padding: 5, paddingLeft: 15}}>{syncingText}</Text>

    /* status text */
    const currentStatusIndex = Status.ordered().indexOf(pot.status.currentStatus());
    const numStatusDetails = Status.ordered().length - currentStatusIndex - 2;
    const details = Status.ordered().splice(currentStatusIndex+1, numStatusDetails).map(s =>
      <StatusDetail key={s}
        note={pot.notes2 && pot.notes2[s] || undefined}
        status={s} potId={pot.uuid} date={pot.status[s]}
        onChangeNote={this.props.onChangeNote} />
    );
    const currentNoteText = pot.notes2[pot.status.currentStatus()];
    return <View style={styles.container}>
      <View style={{flexDirection: 'row'}}>
        <TouchableHighlight onPress={this.props.onNavigateToList}>
          <Text style={styles.back}>&lt;</Text>
        </TouchableHighlight>
        <TextInput style={[styles.h1, {flex: 1}]}
          onChangeText={(text) => this.props.onChangeTitle(pot.uuid, text)}
          value={pot.title} selectTextOnFocus={true}
        />
      </View>
      <KeyboardAwareScrollView style={styles.page} extraHeight={100}>

        <View style={{flexDirection: 'row', backgroundColor: 'black'}}>
          {imageList}
          {mainImage}
        </View>
        <View style={{flexDirection: 'row', padding: 10}}>
          <StatusSwitcher status={pot.status} setStatus={this.props.setStatus} />
          <Text style={{
            paddingLeft: 10, paddingRight: 10,
            color: '#666', fontStyle: 'italic',
            fontSize: 14, padding: 5,
          }}>on</Text>
          <DatePicker value={pot.status.date()}
            style={{marginRight: 10}}
            onPickDate={this.props.setStatusDate} />
          {syncing}
        </View>
        <Note status={pot.status.currentStatus()} potId={pot.uuid}
          note={pot.notes2[pot.status.currentStatus()]}
          onChangeNote={this.props.onChangeNote} showNote={true} showAddNote={true}
          style={{padding: 10, paddingTop: 0}}
         />
        {details}
        <View style={{flexDirection: 'row'}}>
          <View style={{margin: 10}}>
            <Button onPress={this.props.onDelete} title="Delete Pot" />
          </View>
          <View style={{margin: 10}}>
            <Button onPress={this.props.onCopy} title="Copy Pot" />
          </View>
        </View>
      </KeyboardAwareScrollView>
    </View>;
  }
}
