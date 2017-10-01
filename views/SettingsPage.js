// @flow
import Expo from 'expo';
import React from 'react';
import { StyleSheet, Text, View, ScrollView, TextInput, TouchableHighlight, Modal, Image, Dimensions, Picker, Button, TouchableOpacity } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { ExpandingTextInput } from './components/ExpandingTextInput.js'
import {Pot, Image as PotImage} from '../models/Pot.js';
import Status from '../models/Status.js';
import styles from '../style.js'
import ImagePicker from './components/ImagePicker.js';
import ImageList from './components/ImageList.js';
import DatePicker from './components/DatePicker.js';
import StatusDetail from './components/StatusDetail.js';
import StatusSwitcher from './components/StatusSwitcher.js';

type SettingsPageProps = {
  onNavigateToList: () => void,
  onExport: () => void,
  onImport: (data: string) => void,
};

function valid(d) {
  try {
    JSON.parse(d);
    return true;
  } catch (e) {
    return false;
  }
}

class ImportModal extends React.Component {

  async doPicker() {
    result = await Expo.DocumentPicker.getDocumentAsync({});
    console.log("DocumentPicker finished");
    if (result.type == 'success') {
      console.log("You picked a file " + result.uri);
      //data = await Expo.FileSystem.readAsStringAsync(result.uri);
      //console.log("Got the data, " + data.length + " bytes");
      this.props.doImport(result.uri);
    } else {
      console.log("DocumentPicker finished with result " + result.type);
      console.log(result);
    }
  }

  render() {
    return <Modal animationType={"slide"} transparent={true}
      visible={this.props.modalOpen}
      onRequestClose={this.props.closeModal}>
      <View style={{margin: 30, padding: 10, backgroundColor: 'white', borderWidth: 1}}>
        <View>
          <Text style={styles.h2}>App JSON</Text>
          <ExpandingTextInput value={this.props.data} multiline={true} numberOfLines={4}
            style={{fontSize: 16, marginBottom: 20}}
            onChangeText={(t) => this.props.onChangeData(t)}
            autoFocus={true} />
          <Button title="Import" onPress={this.props.doImport} disabled={!valid(this.props.data)} />
	  <Button title="Pick File" onPress={this.doPicker} />
	  </View>
      </View>
    </Modal>
  }
}


export default class SettingsPage extends React.Component {
  constructor(props: SettingsPageProps) {
    super(props);
    this.state = { modalOpen: false, data: '' };
  }
  async doPicker() {
    result = await Expo.DocumentPicker.getDocumentAsync({});
    console.log("DocumentPicker finished");
    if (result.type == 'success') {
      console.log("You picked a file " + result.uri);
      //data = await Expo.FileSystem.readAsStringAsync(result.uri);
      //console.log("Got the data, " + data.length + " bytes");
      console.log(this.props);
      this.props.onImport(result.uri);
    } else {
      console.log("DocumentPicker finished with result " + result.type);
      console.log(result);
    }
  }
  render() {
    closeModal = () => {this.setState({modalOpen: false})};
    openModal = () => {this.setState({modalOpen: true})};
    onChangeData = (d) => {this.setState({data: d})};
    return <View style={styles.container}>
      <ImportModal data={this.state.data} modalOpen={this.state.modalOpen}
        closeModal={closeModal} onChangeData={onChangeData}
        doImport={this.props.onImport} />
      <Text style={styles.h1}>Settings</Text>
      <Text style={styles.settingsText}>Device ID:</Text>
      <Text style={styles.settingsText}>{Expo.Constants.deviceId}</Text>
      <Button title="Export" onPress={this.props.onExport} />
      <Button title="Import" onPress={() => this.doPicker()} />
      <Button title="Back" onPress={this.props.onNavigateToList} />
    </View>
  }
}
