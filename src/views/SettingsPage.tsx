import Constants from 'expo-constants';
import _ from 'lodash';
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
import RadioForm from 'react-native-simple-radio-button';
import { connect } from 'react-redux';
import { FullState } from '../reducers/types';
import { getDerivedDarkMode, getSystemPreference } from '../selectors/settings';
import style, {radioColor} from '../style';
import { setDarkMode } from '../thunks/settings';
import { PLThunkDispatch } from '../thunks/types';
import Anchor from './components/Anchor';
import { ExpandingTextInput } from './components/ExpandingTextInput';
import Modal, { ButtonProp } from './components/Modal';

interface OwnProps {
  fontLoaded: boolean;
}

const APP_VERSION = Constants.manifest.version || 'unknown';

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
  numImages: Object.keys(state.images.images).length,
  numPots: state.pots.potIds.length,
  darkModeSetting: state.settings.darkMode,
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
  setDarkMode: (value: boolean | undefined) => dispatch(setDarkMode(value)),
});
type PropsFromDispatch = ReturnType<typeof mapDispatchToProps>;

type SettingsPageProps = PropsFromState & PropsFromDispatch & OwnProps;

interface SettingsPageState {
  linkModalOpen: boolean;
  linkText: string;
  preExportModalOpen: boolean;
  darkModalOpen: boolean;
}

interface SettingsItem {
  title: string;
  description: string;
  selectable?: boolean;
  onPress: () => void;
}

class SettingsPage extends React.Component<
  SettingsPageProps,
  SettingsPageState
> {
  public state = {
    linkModalOpen: false,
    linkText: '',
    preExportModalOpen: false,
    darkModalOpen: false,
  };

  public render() {
    const backButton = this.props.fontLoaded ? (
      <TouchableOpacity onPress={this.onBack}>
        <Text style={style.s.searchBack}>arrow_back</Text>
      </TouchableOpacity>
    ) : null;

    const theme = _.capitalize(getDerivedDarkMode(this.props.darkModeSetting));

    const settingsItems: SettingsItem[] = [
      {
        title: 'Theme',
        description: theme,
        onPress: this.openDarkModal,
      },
      {
        title: 'Backup',
        description:
          'Backing up your Pottery Log will save your data so you can move it to a new phone.',
        onPress: this.openPreExportModal,
      },
      {
        title: 'Restore',
        description: 'Restore Pottery Log data from a previous backup.',
        onPress: this.importPopup,
      },
      {
        title: 'App Version',
        description: APP_VERSION,
        selectable: true,
        onPress: () => {
          Clipboard.setString(APP_VERSION);
          ToastAndroid.show('Copied to clipboard', ToastAndroid.SHORT);
        },
      },
    ];

    return (
      <View style={style.s.container}>
        <ElevatedView style={style.s.header} elevation={4}>
          {backButton}
          <Text style={[style.s.h1, { flex: 1 }]}>Settings</Text>
        </ElevatedView>
        {this.renderImportUrlModal()}
        {this.renderExportImportModal()}
        {this.renderResumeImport()}
        {this.renderPreExportModal()}
        {this.renderDarkModal()}
        <FlatList
          data={settingsItems}
          renderItem={this.renderSettingsItem}
          keyExtractor={this.settingsItemKeyExtractor}
        />
      </View>
    );
  }

  private renderSettingsItem: ListRenderItem<SettingsItem> = ({
    item: { title, description, onPress, selectable },
  }) => {
    return (
      <TouchableHighlight style={style.s.settingsItem} onPress={onPress}>
        <React.Fragment>
          <Text style={style.s.settingsItemTitle}>{title}</Text>
          <Text style={style.s.settingsItemDescription} selectable={!!selectable}>{description}</Text>
        </React.Fragment>
      </TouchableHighlight>
    );
  }

  private settingsItemKeyExtractor = (i: SettingsItem) => i.title;

  private importPopup = () => {
    Alert.alert('Restore a backup', 'Choose a source', [
      { text: 'Paste Link', onPress: this.openImportUrlModal },
      { text: 'Upload File', onPress: this.props.onStartImport },
    ], {cancelable: true});
  }

  private openImportUrlModal = () =>
    this.setState({ linkModalOpen: true, linkText: '' })
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
  }

  private startUrlImport = () =>
    this.props.onStartUrlImport(this.state.linkText)
  private setLinkText = (linkText: string) => this.setState({ linkText });

  private renderImportUrlModal() {
    let belowInput: JSX.Element | null = null;
    const buttons = [
      { text: 'CANCEL', close: true },
      {
        text: 'START',
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
          style={style.s.modalInput}
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
        cancelable={true}
      />
    );
  }

  private renderDarkModal = () => {
    const setting = this.props.darkModeSetting;
    // Is it too expensive to get the system setting on render?
    const system = getSystemPreference();
    const derived = getDerivedDarkMode(setting);
    const hasSystemPref = system !== 'no-preference';
    // Note: default to light
    // When !hasSystemPref, undefined -> light
    const selectedIndex = hasSystemPref ? (
      setting === undefined ? 0 : setting === false ? 1 : 2
    ) : setting === true ? 1 : 0;

    const options = [
      {
        label: 'Light',
        value: false as boolean | undefined,
      },
      {
        label: 'Dark',
        value: true,
      },
    ];
    if (hasSystemPref) {
      options.unshift({
        label: 'Use system setting (' + system + ')',
        value: undefined,
      });
    }

    const modalBody = (
      <View>
        <RadioForm
          radio_props={options}
          initial={selectedIndex}
          onPress={this.saveDarkModeSetting}
          labelStyle={style.s.settingsText}
          buttonColor={radioColor(derived)}
          selectedButtonColor={radioColor(derived)}
        />
      </View>
    );
    return (
      <Modal
        header={'Theme'}
        body={modalBody}
        buttons={[{ text: 'CLOSE', close: true }]}
        open={this.state.darkModalOpen}
        close={this.closeDarkModal}
        cancelable={true}
      />
    );
  }

  private saveDarkModeSetting = (value: boolean | undefined) => {
    this.closeDarkModal();
    this.props.setDarkMode(value);
  }

  private openDarkModal = () => this.setState({darkModalOpen: true});
  private closeDarkModal = () => this.setState({darkModalOpen: false});

  private renderPreExportModal = () => {
    const buttons = [
      { text: 'CANCEL', close: true },
      {
        text: 'START',
        onPress: this.props.onStartExport,
        close: true,
      },
    ];
    const numMinutes = Math.round(this.props.numImages / 20);
    const minutes = numMinutes === 1 ? 'minute' : 'minutes';
    const pots = this.props.numPots === 1 ? 'pot' : 'pots';
    const images = this.props.numImages === 1 ? 'image' : 'images';
    const modalBody = (
      <View>
        <Text style={style.s.settingsText}>
          You have {this.props.numPots} {pots} with {this.props.numImages} {images}.
          The backup will take about {numMinutes} {minutes}.
        </Text>
      </View>
    );
    return (
      <Modal
        header={'Start Backup'}
        body={modalBody}
        buttons={buttons}
        open={this.state.preExportModalOpen}
        close={this.closePreExportModal}
        cancelable={true}
      />
    );
  }

  private openPreExportModal = () => this.setState({preExportModalOpen: true});
  private closePreExportModal = () => this.setState({preExportModalOpen: false});

  private renderExportImportModal = () => {
    const header = this.props.exportModal ? 'Backup' : 'Restore';
    let body;
    let buttons: ButtonProp[] = [];
    if (this.props.exportUri) {
      const uri = this.props.exportUri;
      body = (
        <View>
          <Text style={style.s.settingsText}>The export is available at:</Text>
          <Text style={style.s.settingsText}>
            <Anchor href={uri} />
          </Text>
          <Text style={style.s.settingsText}>
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
      const activityIndicator = this.props.exporting || this.props.importing ? (
        <ActivityIndicator size="small" />
      ) : null;
      body = (
        <View style={{ flexDirection: 'row' }}>
          {activityIndicator}
          <Text style={[style.s.settingsText, { padding: 20, paddingLeft: 10 }]}>
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
        cancelable={false}
      />
    );
  }

  private closeExportImportModal = () => {
    if (this.props.exportModal && !this.props.exportUri) {
      Alert.alert('Cancel this backup?', undefined, [
        { text: 'Stay here', style: 'cancel' },
        { text: 'Cancel backup', onPress: this.props.onNavigateToList },
      ]);
    } else {
      this.props.onNavigateToList();
    }
  }

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
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(SettingsPage);
