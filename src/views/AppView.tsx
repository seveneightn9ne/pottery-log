import React from 'react';
import { Text, View } from 'react-native';
import { Pot } from '../models/Pot';
import {
  ExportState,
  ImageStoreState,
  ImportState,
  PotsStoreState,
  UIState,
} from '../reducers/types';
import styles from '../style';
import EditPage from './EditPage';
import ImagePage from './ImagePage';
import { ListPage } from './ListPage';
import SettingsPage from './SettingsPage';

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
  onEdit: (potId: string) => void;
  onNavigateToList: () => void;
  onNavigateToSettings: () => void;
  onOpenSearch: () => void;
  onCloseSearch: () => void;
  onSearch: (search: string) => void;
  onStartExport: () => void;
  onStartImport: () => void;
  onStartUrlImport: (url: string) => void;
  onCollapse: (section: string) => void;
  onResumeImport: () => void;
  onCancelResumeImport: () => void;
  addBackButtonHandler: () => () => void;
  removeBackButtonHandler: (handler: undefined | (() => void)) => undefined;
  loadInitial: () => void;
  onSetMainImage: (currentPot: Pot, name: string) => void;
  onDeleteImage: (currentPot: Pot, name: string) => void;
}

class AppView extends React.Component<
  AppViewDispatchProps & AppViewStateProps
> {
  private backHandler: (() => void) | undefined;
  public componentDidMount() {
    this.backHandler = this.props.addBackButtonHandler();
    this.props.loadInitial();
  }

  public componentWillUnmount() {
    this.backHandler = this.props.removeBackButtonHandler(this.backHandler);
  }
  public render() {
    const props = this.props;
    switch (props.ui.page) {
      case 'list':
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
          />
        );
      case 'edit-pot':
        return (
          <EditPage
            pot={props.pots.pots[props.ui.editPotId]}
            fontLoaded={props.fontLoaded}
          />
        );
      case 'settings':
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
      case 'image':
        return (
          <ImagePage
            image={props.images.images[props.ui.imageId]}
            pot={props.pots.pots[props.ui.editPotId]}
            fontLoaded={props.fontLoaded}
            onDeleteImage={props.onDeleteImage}
            onSetMainImage={props.onSetMainImage}
            onBack={props.onEdit}
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
