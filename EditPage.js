// @flow
import React from 'react';
import { StyleSheet, Text, View, ScrollView, TextInput, TouchableHighlight, Image, Dimensions, Picker, Button, TouchableOpacity } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { ExpandingTextInput } from './ExpandingTextInput.js'
import {Pot} from './Pot.js';
import Status from './Status.js';
//import PotsStoreState from './PotsStore.js';
import styles from './style.js'
import NewPotListItem from './NewPotListItem.js';
import PotListItem from './PotListItem.js';
import ImagePicker from './ImagePicker.js';
import ImageList from './ImageList.js';
import DatePicker from './DatePicker.js';

type EditPageProps = {
  pot: Pot,
  ui: Object, // UIState
  onChangeTitle: (text: string) => void,
  onChangeNote: (potId: string, date: Date, text: string) => void,
  onNewNote: () => void,
  onNavigateToList: () => void,
  onChangeImages: (newImageUris: string[]) => void,
  onAddImage: (potId, uri) => void,
  onSetMainImage: (potId, uri) => void,
  setStatus: (newStatus) => void,
  setStatusDate: (date) => void,
  onDelete: () => void,
  onCopy: () => void,
};

export default class ListPage extends React.Component {
  render() {
    const {height, width} = Dimensions.get('window');
    const pot = this.props.pot;
    const mainImgHeight = width * .75; // Images have 4:3 aspect ratio
    const mainImage = (pot.images.length) ?
      <TouchableOpacity onLongPress={() => this.props.onDeleteImage(pot.images[0])}>
        <Image source={{uri: pot.images[0]}} style={{height: mainImgHeight}} />
      </TouchableOpacity> :
      <ImagePicker onPicked={(i) => this.props.onAddImage(pot.uuid, i)}
        style={{height: 150}} />;
    const imageList = (pot.images.length) ?
      <ImageList images={pot.images}
        onAddImage={(i) => this.props.onAddImage(pot.uuid, i)}
        onClickImage={(i) => this.props.onSetMainImage(pot.uuid, i)}
        onDeleteImage={(i) => this.props.onDeleteImage(i)} /> :
      null;
    const statuses = Status.ordered(true).map(s =>
      <Picker.Item label={Status.prettify(s)} value={s} key={s} />);
    const nextButton = pot.status.next() ? <Button
        title={Status.action(pot.status.next())}
        onPress={() => this.props.setStatus(pot.status.next())} /> : null;
    const notes = pot.notes.map(noteObj => {
      const noteText = noteObj.note || '';
      const noteDate = noteObj.date;
      return <ExpandingTextInput
        style={styles.potDescInput}
        placeholder="Notes"
        value={noteText}
        key={noteDate}
        onChangeText={(text) => this.props.onChangeNote(pot.uuid, noteDate, text)}
        underlineColorAndroid="transparent"
      />
    });
    return <View style={styles.container}>
      <View style={{flexDirection: 'row'}}>
        <TouchableHighlight onPress={this.props.onNavigateToList}>
          <Text style={styles.back}>&lt;</Text>
        </TouchableHighlight>
        <TextInput style={[styles.h1, {flex: 1}]}
          onChangeText={(text) => this.props.onChangeTitle(pot.uuid, text)}
          value={pot.title} autoFocus={pot.title == 'New Pot'}
          selectTextOnFocus={true}
        />
      </View>
      <KeyboardAwareScrollView style={styles.page} extraHeight={100}>
        {mainImage}
        {imageList}
        {/*<Text>{pot.status.text()}</Text>*/}
        <View style={{flexDirection: 'row', padding: 5}}>
          <Picker selectedValue={pot.status.currentStatus()}
            onValueChange={this.props.setStatus} style={{width: 150}}>
            {statuses}
          </Picker>
          <Text style={{paddingLeft: 10, paddingRight: 10}}>on</Text>
          <DatePicker value={pot.status.date()}
            style={{marginRight: 10}}
            onPickDate={this.props.setStatusDate} />
          {nextButton}
        </View>
        <TouchableHighlight onPress={this.props.onNewNote}>
          <Text>+ Note</Text>
        </TouchableHighlight>
        {notes}
        <Button onPress={this.props.onDelete} title="Delete" />
        <Button onPress={this.props.onCopy} title="Copy Pot" />
      </KeyboardAwareScrollView>
    </View>;
  }
}
