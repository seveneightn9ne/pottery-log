import React from "react";
import ElevatedView from "react-native-elevated-view";
import {
  ActivityIndicator,
  Alert,
  Button,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { ExportState, ImportState } from "../reducers/types";
import styles from "../style";
import Anchor from "./components/Anchor";
import { ExpandingTextInput } from "./components/ExpandingTextInput";
import Modal from "./components/Modal";

interface SettingsPageProps {
  onNavigateToList: () => void;
  onStartExport: () => void;
  onStartImport: () => void;
  onStartUrlImport: (url: string) => void;
  onResumeImport: () => void;
  onCancelResumeImport: () => void;
  fontLoaded: boolean;
  exports: ExportState;
  imports: ImportState;
  resumeImport: boolean;
}

interface SettingsPageState {
  linkModalOpen: boolean;
  linkText: string;
}

export default class SettingsPage extends React.Component<
  SettingsPageProps,
  SettingsPageState
> {
  state = {
    linkModalOpen: false,
    linkText: ""
  };

  public render() {
    const backButton = this.props.fontLoaded ? (
      <TouchableOpacity onPress={this.onBack}>
        <Text style={styles.searchBack}>arrow_back</Text>
      </TouchableOpacity>
    ) : null;

    let body;
    if ("exportUri" in this.props.exports) {
      body = (
        <View>
          <Text style={styles.settingsText}>The export is available at:</Text>
          <Text style={styles.settingsText}>
            <Anchor href={this.props.exports.exportUri} /> (long press the link
            to copy)
          </Text>
          <Text style={styles.settingsText}>
            This link will be active for one week. You can copy the link to a
            new phone to import the data immediately, or save the file for
            importing in the future.
          </Text>
        </View>
      );
    } else if (this.props.exports.exporting || this.props.imports.importing) {
      const status = this.props.exports.exporting
        ? this.props.exports.statusMessage
        : this.props.imports.statusMessage;
      body = (
        <View style={{ flexDirection: "row", paddingLeft: 20 }}>
          <ActivityIndicator size="small" />
          <Text style={styles.settingsText}>{status}</Text>
        </View>
      );
    } else {
      // There may be an export or import failure message
      const status =
        this.props.exports.statusMessage ||
        this.props.imports.statusMessage ||
        "Exporting will save your Pottery Log data so you can move your data to a new phone.";
      body = (
        <View style={{ padding: 20, paddingTop: 0 }}>
          <Text style={styles.settingsText}>{status}</Text>
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
    Alert.alert("Import", "Choose a source", [
      { text: "Paste Link", onPress: this.openModal },
      { text: "Upload File", onPress: this.props.onStartImport }
    ]);
  };

  private openModal = () =>
    this.setState({ linkModalOpen: true, linkText: "" });
  private closeModal = () => this.setState({ linkModalOpen: false });

  private renderResumeImport = () => {
    if (!this.props.resumeImport) {
      return null;
    }

    return Alert.alert(
      "Resume Import",
      "There is an import in progress. Would you like to resume importing?",
      [
        {
          text: "Cancel",
          style: "cancel",
          onPress: this.props.onCancelResumeImport
        },
        { text: "Resume", onPress: this.props.onResumeImport }
      ],
      { cancelable: false }
    );
  };

  private renderModal() {
    let belowInput: JSX.Element | null = null;
    const buttons = [
      { text: "CANCEL" },
      {
        text: "IMPORT",
        onPress: () => {
          this.props.onStartUrlImport(this.state.linkText);
        },
        disabled: true
      }
    ];
    if (this.state.linkText) {
      if (
        this.state.linkText.indexOf(
          "https://pottery-log-exports.s3.amazonaws.com/"
        ) !== 0
      ) {
        // Something that isn't a valid link
        belowInput = (
          <Text style={{ color: "red" }}>
            The link should start with
            https://pottery-log-exports.s3.amazonaws.com/
          </Text>
        );
      } else {
        // valid link
        buttons[1].disabled = false;
      }
    }
    return (
      <Modal
        header={"Paste link"}
        body={
          <View>
            <ExpandingTextInput
              value={this.state.linkText}
              multiline={true}
              numberOfLines={1}
              style={styles.modalInput}
              onChangeText={text => this.setState({ linkText: text })}
              autoFocus={true}
              onSubmit={() => {}}
            />
            {belowInput}
          </View>
        }
        buttons={buttons}
        open={this.state.linkModalOpen}
        close={this.closeModal}
      />
    );
  }

  private onBack = () => {
    if (this.props.exports.exporting && !("exportUri" in this.props.exports)) {
      Alert.alert("Cancel this export?", undefined, [
        { text: "Stay here", style: "cancel" },
        { text: "Cancel export", onPress: this.props.onNavigateToList }
      ]);
    } /*else if (this.props.imports.importing) {
        Alert.alert('Cancel this import?', undefined,
          [{text: 'Stay here', style: 'cancel'},
          {text: 'Cancel import', onPress: this.props.onNavigateToList},
        ]);
    }*/ else {
      this.props.onNavigateToList();
    }
  };
}
