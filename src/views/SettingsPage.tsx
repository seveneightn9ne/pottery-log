import React from 'react';
import {
  ActivityIndicator,
  Alert,
  Button,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import ElevatedView from 'react-native-elevated-view';
import { connect } from 'react-redux';
import { FullState } from '../reducers/types';
import styles from '../style';
import { PLThunkDispatch } from '../thunks/types';
import Anchor from './components/Anchor';
import { ExpandingTextInput } from './components/ExpandingTextInput';
import Modal from './components/Modal';

interface OwnProps {
  fontLoaded: boolean;
}

const mapStateToProps = (state: FullState) => ({
  resumeImport:
    state.ui.page === 'settings' ? state.ui.resumeImport : (undefined as never),
  statusMessage:
    state.exports.statusMessage ||
    state.imports.statusMessage ||
    'Exporting will save your Pottery Log data so you can move your data to a new phone.',
  exportUri: 'exportUri' in state.exports ? state.exports.exportUri : undefined,
  exporting: state.exports.exporting,
  importing: state.imports.importing,
});
type PropsFromState = ReturnType<typeof mapStateToProps>;

const mapDispatchToProps = (dispatch: PLThunkDispatch) => ({
  onNavigateToList: () =>
    dispatch({
      type: 'page-list',
    }),

  onStartExport: () => dispatch({ type: 'export-initiate' }),
  onStartImport: () => dispatch({ type: 'import-initiate' }),
  onStartUrlImport: (url: string) =>
    dispatch({
      type: 'import-initiate-url',
      url,
    }),
  onResumeImport: () => dispatch({ type: 'import-resume-affirm' }),
  onCancelResumeImport: () => dispatch({ type: 'import-resume-cancel' }),
});
type PropsFromDispatch = ReturnType<typeof mapDispatchToProps>;

type SettingsPageProps = PropsFromState & PropsFromDispatch & OwnProps;

interface SettingsPageState {
  linkModalOpen: boolean;
  linkText: string;
}

class SettingsPage extends React.Component<
  SettingsPageProps,
  SettingsPageState
> {
  public state = {
    linkModalOpen: false,
    linkText: '',
  };

  public render() {
    const backButton = this.props.fontLoaded ? (
      <TouchableOpacity onPress={this.onBack}>
        <Text style={styles.searchBack}>arrow_back</Text>
      </TouchableOpacity>
    ) : null;

    let body;
    if (this.props.exportUri) {
      body = (
        <View>
          <Text style={styles.settingsText}>The export is available at:</Text>
          <Text style={styles.settingsText}>
            <Anchor href={this.props.exportUri} /> (long press the link to copy)
          </Text>
          <Text style={styles.settingsText}>
            This link will be active for one week. You can copy the link to a
            new phone to import the data immediately, or save the file for
            importing in the future.
          </Text>
        </View>
      );
    } else if (this.props.exporting || this.props.importing) {
      body = (
        <View style={{ flexDirection: 'row', paddingLeft: 20 }}>
          <ActivityIndicator size="small" />
          <Text style={styles.settingsText}>{this.props.statusMessage}</Text>
        </View>
      );
    } else {
      // There may be an export or import failure message
      body = (
        <View style={{ padding: 20, paddingTop: 0 }}>
          <Text style={styles.settingsText}>{this.props.statusMessage}</Text>
          <Button title="Export" onPress={this.props.onStartExport} />
          <View style={{ height: 20 }} />
          <Button title="Import" onPress={this.importPopup} />
          <Text style={styles.settingsText}>App version: 2.24.7</Text>
        </View>
      );
    }

    const modal = this.renderModal();
    const resumeImport = this.renderResumeImport();

    return (
      <View style={styles.container}>
        <ElevatedView style={styles.header} elevation={4}>
          {backButton}
          <Text style={[styles.h1, { flex: 1 }]}>Settings</Text>
        </ElevatedView>
        {modal}
        {resumeImport}
        {body}
      </View>
    );
  }

  private importPopup = () => {
    Alert.alert('Import', 'Choose a source', [
      { text: 'Paste Link', onPress: this.openModal },
      { text: 'Upload File', onPress: this.props.onStartImport },
    ]);
  }

  private openModal = () =>
    this.setState({ linkModalOpen: true, linkText: '' })
  private closeModal = () => this.setState({ linkModalOpen: false });

  private renderResumeImport = () => {
    if (!this.props.resumeImport) {
      return null;
    }

    return Alert.alert(
      'Resume Import',
      'There is an import in progress. Would you like to resume importing?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: this.props.onCancelResumeImport,
        },
        { text: 'Resume', onPress: this.props.onResumeImport },
      ],
      { cancelable: false },
    );
  }

  private startUrlImport = () =>
    this.props.onStartUrlImport(this.state.linkText)
  private setLinkText = (linkText: string) => this.setState({ linkText });

  private renderModal() {
    let belowInput: JSX.Element | null = null;
    const buttons = [
      { text: 'CANCEL' },
      {
        text: 'IMPORT',
        onPress: this.startUrlImport,
        disabled: true,
      },
    ];
    if (this.state.linkText) {
      if (
        this.state.linkText.indexOf(
          'https://pottery-log-exports.s3.amazonaws.com/',
        ) !== 0
      ) {
        // Something that isn't a valid link
        belowInput = (
          <Text style={{ color: 'red' }}>
            The link should start with
            https://pottery-log-exports.s3.amazonaws.com/
          </Text>
        );
      } else {
        // valid link
        buttons[1].disabled = false;
      }
    }
    const modalBody = (
      <View>
        <ExpandingTextInput
          value={this.state.linkText}
          multiline={true}
          numberOfLines={1}
          style={styles.modalInput}
          onChangeText={this.setLinkText}
          autoFocus={true}
          onSubmit={this.doNothing}
        />
        {belowInput}
      </View>
    );
    return (
      <Modal
        header={'Paste link'}
        body={modalBody}
        buttons={buttons}
        open={this.state.linkModalOpen}
        close={this.closeModal}
      />
    );
  }

  private doNothing = () => {};

  private onBack = () => {
    if (this.props.exporting && !this.props.exportUri) {
      Alert.alert('Cancel this export?', undefined, [
        { text: 'Stay here', style: 'cancel' },
        { text: 'Cancel export', onPress: this.props.onNavigateToList },
      ]);
    } else {
      this.props.onNavigateToList();
    }
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(SettingsPage);
