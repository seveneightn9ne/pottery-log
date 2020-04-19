import React from 'react';
import {
  ActivityIndicator,
  Alert,
  Clipboard,
  FlatList,
  ListRenderItem,
  Text,
  ToastAndroid,
  TouchableHighlight,
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
import Modal, { ButtonProp } from './components/Modal';

interface OwnProps {
  fontLoaded: boolean;
}

const APP_VERSION = '2.25.0';

const mapStateToProps = (state: FullState) => ({
  resumeImport:
    state.ui.page === 'settings' ? state.ui.resumeImport : (undefined as never),
  exportUri: 'exportUri' in state.exports ? state.exports.exportUri : undefined,
  exportModal: state.exports.exporting || !!state.exports.statusMessage,
  importModal: state.imports.importing || !!state.imports.statusMessage,
  exporting: state.exports.exporting,
  importing: state.imports.importing,
  statusMessage:
    state.exports.statusMessage || state.imports.statusMessage || '',
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

interface SettingsItem {
  title: string;
  description: string;
  onPress: () => void;
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

    const settingsItems: SettingsItem[] = [
      {
        title: 'Backup',
        description:
          'Backing up your Pottery Log will save your data so you can move it to a new phone.',
        onPress: this.props.onStartExport,
      },
      {
        title: 'Restore',
        description: 'Restore Pottery Log data from a previous backup.',
        onPress: this.importPopup,
      },
      {
        title: 'App Version',
        description: APP_VERSION,
        onPress: () => {
          Clipboard.setString(APP_VERSION);
          ToastAndroid.show('Copied to clipboard', ToastAndroid.SHORT);
        },
      },
    ];

    return (
      <View style={styles.container}>
        <ElevatedView style={styles.header} elevation={4}>
          {backButton}
          <Text style={[styles.h1, { flex: 1 }]}>Settings</Text>
        </ElevatedView>
        {this.renderImportUrlModal()}
        {this.renderExportImportModal()}
        {this.renderResumeImport()}
        <FlatList
          data={settingsItems}
          renderItem={this.renderSettingsItem}
          keyExtractor={this.settingsItemKeyExtractor}
        />
      </View>
    );
  }

  private renderSettingsItem: ListRenderItem<SettingsItem> = ({
    item: { title, description, onPress },
  }) => {
    return (
      <TouchableHighlight style={styles.settingsItem} onPress={onPress}>
        <React.Fragment>
          <Text style={styles.settingsItemTitle}>{title}</Text>
          <Text style={styles.settingsItemDescription}>{description}</Text>
        </React.Fragment>
      </TouchableHighlight>
    );
  };

  private settingsItemKeyExtractor = (i: SettingsItem) => i.title;

  private importPopup = () => {
    Alert.alert('Restore', 'Choose a source', [
      { text: 'Paste Link', onPress: this.openImportUrlModal },
      { text: 'Upload File', onPress: this.props.onStartImport },
    ]);
  };

  private openImportUrlModal = () =>
    this.setState({ linkModalOpen: true, linkText: '' });
  private closeImportUrlModal = () => this.setState({ linkModalOpen: false });

  private renderResumeImport = () => {
    if (!this.props.resumeImport) {
      return null;
    }

    return Alert.alert(
      'Resume Restore',
      'There is a restore in progress. Would you like to resume?',
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
  };

  private startUrlImport = () =>
    this.props.onStartUrlImport(this.state.linkText);
  private setLinkText = (linkText: string) => this.setState({ linkText });

  private renderImportUrlModal() {
    let belowInput: JSX.Element | null = null;
    const buttons = [
      { text: 'CANCEL', close: true },
      {
        text: 'IMPORT',
        onPress: this.startUrlImport,
        disabled: true,
        close: true,
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
        close={this.closeImportUrlModal}
      />
    );
  }

  private renderExportImportModal = () => {
    const header = this.props.exportModal ? 'Backup' : 'Restore';
    let body;
    let buttons: ButtonProp[] = [];
    if (this.props.exportUri) {
      const uri = this.props.exportUri;
      body = (
        <View>
          <Text style={styles.settingsText}>The export is available at:</Text>
          <Text style={styles.settingsText}>
            <Anchor href={uri} />
          </Text>
          <Text style={styles.settingsText}>
            This link will be active for one week. You can copy the link to a
            new phone to import the data immediately, or save the file for
            importing in the future.
          </Text>
        </View>
      );
      buttons = [
        {
          text: 'Copy URL',
          onPress: () => {
            Clipboard.setString(uri);
            ToastAndroid.show('Copied to clipboard', ToastAndroid.SHORT);
          },
          close: false,
        },
        {
          text: 'Close',
          onPress: this.closeExportImportModal,
          close: true,
        },
      ];
    } else {
      body = (
        <View style={{ flexDirection: 'row' }}>
          {this.props.exporting || this.props.importing ? (
            <ActivityIndicator size="small" />
          ) : null}
          <Text style={[styles.settingsText, { padding: 20, paddingLeft: 10 }]}>
            {this.props.statusMessage}
          </Text>
        </View>
      );
      if (this.props.exporting) {
        buttons = [
          {
            text: 'Cancel',
            onPress: this.closeExportImportModal,
            close: true,
          },
        ];
      }
    }

    return (
      <Modal
        header={header}
        body={body}
        buttons={buttons}
        open={this.props.exportModal || this.props.importModal}
        close={this.closeExportImportModal}
      />
    );
  };

  private closeExportImportModal = () => {
    if (this.props.exportModal && !this.props.exportUri) {
      Alert.alert('Cancel this backup?', undefined, [
        { text: 'Stay here', style: 'cancel' },
        { text: 'Cancel backup', onPress: this.props.onNavigateToList },
      ]);
    } else {
      this.props.onNavigateToList();
    }
  };

  private doNothing = () => {};

  private onBack = () => {
    if (this.props.exporting && !this.props.exportUri) {
      Alert.alert('Cancel this backup?', undefined, [
        { text: 'Stay here', style: 'cancel' },
        { text: 'Cancel backup', onPress: this.props.onNavigateToList },
      ]);
    } else {
      this.props.onNavigateToList();
    }
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(SettingsPage);
