import React from 'react';
import { ActivityIndicator, Alert, Button, Modal, Text, TouchableOpacity, View } from 'react-native';
import RNButton from 'react-native-button';
import { ExportState } from '../stores/ExportStore';
import { ImportState } from '../stores/ImportStore';
import styles from '../style';
import Anchor from './components/Anchor';
import { ExpandingTextInput } from './components/ExpandingTextInput';

interface SettingsPageProps {
  onNavigateToList: () => void;
  onStartExport: () => void;
  onStartImport: () => void;
  onStartUrlImport: (url: string) => void;
  fontLoaded: boolean;
  exports: ExportState;
  imports: ImportState;
}

interface SettingsPageState {
  linkModalOpen: boolean;
  linkText: string;
}

export default class SettingsPage extends React.Component<SettingsPageProps, SettingsPageState> {
  state = {
    linkModalOpen: false,
    linkText: "",
  };

  public render() {
    const backButton = this.props.fontLoaded ? (
      <TouchableOpacity onPress={this.onBack}>
        <Text style={styles.searchBack}>arrow_back</Text>
      </TouchableOpacity>) : null;

    let body;
    if ('exportUri' in this.props.exports) {
      body = (
        <View>
          <Text style={styles.settingsText}>The export is available at:</Text>
          <Text style={styles.settingsText}><Anchor href={this.props.exports.exportUri} /> (long press the link to copy)</Text>
          <Text style={styles.settingsText}>
            This link will be active for one week. You can copy the link to a new phone to import
            the data immediately, or save the file for importing in the future.
          </Text>
      </View>);
    } else if (this.props.exports.exporting || this.props.imports.importing) {
      const status = this.props.exports.exporting ? this.props.exports.statusMessage : this.props.imports.statusMessage;
      body = (
        <View style={{flexDirection: 'row', paddingLeft: 20}}>
          <ActivityIndicator size="small" />
          <Text style={styles.settingsText}>{status}</Text>
        </View>);
    } else {
      // There may be an export or import failure message
      const status = this.props.exports.statusMessage
        || this.props.imports.statusMessage
        || 'Exporting will save your Pottery Log data so you can move your data to a new phone.';
      body = (
        <View style={{padding: 20, paddingTop: 0}}>
          <Text style={styles.settingsText}>{status}</Text>
          <Button title="Export" onPress={this.props.onStartExport} />
          <View style={{height: 20}} />
          <Button title="Import" onPress={this.importPopup} />
      </View>);
    }

    const modal = this.renderModal();

    return (
      <View style={styles.container}>
        <View style={styles.header}>
          {backButton}
          <Text style={[styles.h1, {flex: 1}]}>Settings</Text>
        </View>
        {modal}
        {body}
    </View>);
  }

  private importPopup = () => {
    Alert.alert('Import', 'Choose a source', [
      {text: 'Paste Link', onPress: this.openModal},
      {text: 'Upload File', onPress: this.props.onStartImport}]);
  }

  private openModal = () => this.setState({linkModalOpen: true, linkText: ""});
  private closeModal = () => this.setState({linkModalOpen: false});
  private submitLink = () => {
    this.closeModal();
    this.props.onStartUrlImport(this.state.linkText);
  }

  private renderModal() {
    const belowInput = (this.state.linkText ?
      (this.state.linkText.indexOf("https://pottery-log-exports.s3.amazonaws.com/") === 0 ?
        // Valid link!
        <RNButton onPress={this.submitLink} style={[styles.button3, styles.modalButton]}>
            IMPORT
        </RNButton>
      : // Something that isn't a valid link
        <Text style={{color: 'red'}}>
          The link should start with https://pottery-log-exports.s3.amazonaws.com/
        </Text>
      ) : // Nothing in the input yet
        null
      );
    return (
    <Modal
      transparent={true}
      visible={this.state.linkModalOpen}
      onRequestClose={this.closeModal}
    >
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <View style={styles.noteModal}>
          <Text style={styles.modalHeader}>
          Paste link to export
          </Text>
          <ExpandingTextInput
            value={this.state.linkText}
            multiline={true}
            numberOfLines={1}
            style={styles.modalInput}
            onChangeText={(text) => this.setState({linkText: text})}
            autoFocus={true}
            onSubmit={this.submitLink}
          />
          {belowInput}
        </View>
      </View>
    </Modal>);
  }

  private onBack = () => {
    if (this.props.exports.exporting && !('exportUri' in this.props.exports)) {
      Alert.alert('Cancel this export?', undefined,
        [{text: 'Stay here', style: 'cancel'},
        {text: 'Cancel', onPress: this.props.onNavigateToList},
      ]);
    } else {
      this.props.onNavigateToList();
    }
  }
}
