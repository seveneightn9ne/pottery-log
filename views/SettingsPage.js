// @flow
import Expo from 'expo';
import React from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, View, ScrollView, TextInput, TouchableHighlight, Modal, Image, Dimensions, Picker, Button, TouchableOpacity, Linking } from 'react-native';
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
import Anchor from './components/Anchor.js';

type SettingsPageProps = {
  onNavigateToList: () => void,
  onStartExport: () => void,
  onStartImport: () => void,
  exports: ExportState,
};

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

  onBack() {
    if (this.props.exports.exporting && !this.props.exports.exportUri) {
      Alert.alert('Cancel this export?', undefined,
        [{text: 'Stay here', style: 'cancel'},
        {text: 'Cancel', onPress: this.props.onNavigateToList},
      ]);
    } else {
      this.props.onNavigateToList();
    }
  }
  render() {

    const backButton = this.props.fontLoaded ?
      <TouchableOpacity onPress={() => this.onBack()}>
        <Text style={styles.searchBack}>arrow_back</Text>
      </TouchableOpacity> : null;

    let body;
    if (this.props.exports.exportUri) {
      body = <View>
        <Text style={styles.settingsText}>The export is available at:</Text>
        <Text style={styles.settingsText}><Anchor href={this.props.exports.exportUri} /></Text>
        <Text style={styles.settingsText}>This link will be active for one day, so save the file somewhere safe.</Text>
      </View>;
    } else if (this.props.exports.exporting || this.props.exports.importing) {
      body = <View style={{flexDirection: 'row', paddingLeft: 20}}>
        <ActivityIndicator size="small" />
        <Text style={styles.settingsText}>{this.props.exports.statusMessage}</Text>
      </View>;
    } else {
      body = <View style={{padding: 20, paddingTop: 0}}>
        <Text style={styles.settingsText}>Exporting will save your Pottery Log data so you can move your data to a new phone.</Text>
        <Button title="Export" onPress={this.props.onStartExport} />
        <View style={{height: 20}} />
        <Button title="Import" onPress={this.props.onStartImport} />
      </View>;
    }
    
    return <View style={styles.container}>
      <View style={styles.header}>
        {backButton}
        <Text style={[styles.h1, {flex: 1}]}>Settings</Text>
      </View>
      {body}
    </View>
  }
}
