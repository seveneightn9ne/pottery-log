import React from "react";
import { Text, View } from "react-native";
import { StatusString } from "../models/Status";
import {
  ExportState,
  ImageStoreState,
  ImportState,
  PotsStoreState,
  UIState,
  FullState
} from "../reducers/types";
import styles from "../style";
import EditPage from "./EditPage";
import ImagePage from "./ImagePage";
import { ListPage } from "./ListPage";
import SettingsPage from "./SettingsPage";
import { Pot } from "../models/Pot";

export interface AppViewStateProps {
  pots: PotsStoreState;
  ui: UIState;
  images: ImageStoreState;
  exports: ExportState;
  imports: ImportState;

  fontLoaded: boolean;
}
export interface AppViewDispatchProps {
  onNew: () => void;
  onChangeTitle: (potId: string, text: string) => void;
  onChangeNote: (currentPot: Pot, status: StatusString, text: string) => void;
  onEdit: (potId: string) => void;
  onNavigateToList: () => void;
  onNavigateToSettings: () => void;
  onAddImage: (currentPot: Pot, localUri: string) => void;
  onSetMainImage: (currentPot: Pot, name: string) => void;
  onDeleteImage: (currentPot: Pot, name: string) => void;
  onExpandImage: (name: string) => void;
  setStatus: (currentPot: Pot, newStatus: StatusString) => void;
  setStatusDate: (currentPot: Pot, date: Date) => void;
  onDelete: (currentPot: Pot) => void;
  onCopy: (currentPot: Pot) => void;
  onOpenSearch: () => void;
  onCloseSearch: () => void;
  onSearch: (search: string) => void;
  onStartExport: () => void;
  onStartImport: () => void;
  onStartUrlImport: (url: string) => void;
  onCollapse: (section: string) => void;
  onResumeImport: () => void;
  onCancelResumeImport: () => void;
  onImageLoad: (name: string) => void;
  onImageLoadFailure: (
    nameOrUri: string,
    type: "local" | "file" | "remote"
  ) => void;
  addBackButtonHandler: (state: FullState) => void;
  loadInitial: () => void;
}

class AppView extends React.Component<
  AppViewDispatchProps & AppViewStateProps
> {
  componentDidMount() {
    this.props.addBackButtonHandler(this.props);
    this.props.loadInitial();
  }
  render() {
    const props = this.props;
    switch (props.ui.page) {
      case "list":
        return (
          <ListPage
            pots={props.pots}
            ui={props.ui}
            images={props.images}
            fontLoaded={props.fontLoaded}
            onNewPot={props.onNew}
            onClickPot={props.onEdit}
            onOpenSearch={props.onOpenSearch}
            onCloseSearch={props.onCloseSearch}
            onSearch={props.onSearch}
            onNavigateToSettings={props.onNavigateToSettings}
            onCollapse={props.onCollapse}
            onImageLoad={props.onImageLoad}
            onImageLoadFailure={props.onImageLoadFailure}
          />
        );
      case "edit-pot":
        return (
          <EditPage
            pot={props.pots.pots[props.ui.editPotId]}
            ui={props.ui}
            images={props.images}
            fontLoaded={props.fontLoaded}
            onChangeTitle={props.onChangeTitle}
            onChangeNote={props.onChangeNote}
            onNavigateToList={props.onNavigateToList}
            onAddImage={props.onAddImage}
            onDeleteImage={props.onDeleteImage}
            onSetMainImage={props.onSetMainImage}
            onExpandImage={props.onExpandImage}
            setStatus={props.setStatus}
            setStatusDate={props.setStatusDate}
            onDelete={props.onDelete}
            onCopy={props.onCopy}
            onImageLoad={props.onImageLoad}
            onImageLoadFailure={props.onImageLoadFailure}
          />
        );
      case "settings":
        return (
          <SettingsPage
            exports={props.exports}
            imports={props.imports}
            fontLoaded={props.fontLoaded}
            onNavigateToList={props.onNavigateToList}
            onStartExport={props.onStartExport}
            onStartImport={props.onStartImport}
            onStartUrlImport={props.onStartUrlImport}
            resumeImport={props.ui.resumeImport}
            onResumeImport={props.onResumeImport}
            onCancelResumeImport={props.onCancelResumeImport}
          />
        );
      case "image":
        return (
          <ImagePage
            image={props.images.images[props.ui.imageId]}
            pot={props.pots.pots[props.ui.editPotId]}
            fontLoaded={props.fontLoaded}
            onDeleteImage={props.onDeleteImage}
            onSetMainImage={props.onSetMainImage}
            onBack={props.onEdit}
            onImageLoad={props.onImageLoad}
            onImageLoadFailure={props.onImageLoadFailure}
          />
        );
      default:
        return (
          <View style={styles.container}>
            <Text style={styles.h1}>Unknown Page</Text>
          </View>
        );
    }
  }
}

export default AppView;
