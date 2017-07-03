// @flow
import Expo from 'expo';
import React from 'react';
import { StyleSheet, Text, View, ScrollView, TextInput, TouchableHighlight, Image, Dimensions, Picker, Button, TouchableOpacity } from 'react-native';
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
import Note from './components/Note.js';

type SettingsPageProps = {
  onNavigateToList: () => void,
  onExport: () => void,
};

export default class SettingsPage extends React.Component {
  render() {
    return <View style={styles.container}>
      <Text style={styles.h1}>Settings</Text>
      <Text style={styles.settingsText}>Device ID:</Text>
      <Text style={styles.settingsText}>{Expo.Constants.deviceId}</Text>
      <Button title="Export" onPress={this.props.onExport} />
      <Button title="Back" onPress={this.props.onNavigateToList} />
    </View>
  }
}
