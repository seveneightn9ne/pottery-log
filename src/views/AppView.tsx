import React from 'react';
import {Text, View} from 'react-native';
import { StatusString } from '../models/Status';
import { ExportState } from '../stores/ExportStore';
import { ImageStoreState } from '../stores/ImageStore';
import { ImportState } from '../stores/ImportStore';
import { PotsStoreState } from '../stores/PotsStore';
import { UIState } from '../stores/UIStore';
import styles from '../style';
import EditPage from './EditPage';
import ImagePage from './ImagePage';
import { ListPage } from './ListPage';
import SettingsPage from './SettingsPage';

export interface AppViewProps {
  pots: PotsStoreState;
  ui: UIState;
  images: ImageStoreState;
  exports: ExportState;
  imports: ImportState;

  fontLoaded: boolean;

  onNew: () => void;
  onChangeTitle: (potId: string, text: string) => void;
  onChangeNote: (potId: string, status: StatusString, text: string) => void;
  onEdit: (potId: string) => void;
  onNavigateToList: () => void;
  onNavigateToSettings: () => void;
  onAddImage: (potId: string, localUri: string) => void;
  onSetMainImage: (potId: string, name: string) => void;
  onDeleteImage: (name: string) => void;
  onExpandImage: (name: string) => void;
  setStatus: (newStatus: StatusString) => void;
  setStatusDate: (date: Date) => void;
  onDelete: () => void;
  onCopy: () => void;
  onOpenSearch: () => void;
  onCloseSearch: () => void;
  onSearch: (search: string) => void;
  onStartExport: () => void;
  onStartImport: () => void;
  onCollapse: (section: string) => void;
}

function AppView(props: AppViewProps): React.ReactElement<AppViewProps> {
  switch (props.ui.page) {
    case 'list':
      return (
      <ListPage
        pots={props.pots}
        ui={props.ui}
        fontLoaded={props.fontLoaded}
        onNewPot={props.onNew}
        onClickPot={props.onEdit}
        onOpenSearch={props.onOpenSearch}
        onCloseSearch={props.onCloseSearch}
        onSearch={props.onSearch}
        onNavigateToSettings={props.onNavigateToSettings}
        onCollapse={props.onCollapse}
      />);
    case 'edit-pot':
      return (
      <EditPage
        pot={props.pots.pots[props.ui.editPotId]}
        ui={props.ui}
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
      />);
    case 'settings':
      return (
      <SettingsPage
        exports={props.exports}
        imports={props.imports}
        fontLoaded={props.fontLoaded}
        onNavigateToList={props.onNavigateToList}
        onStartExport={props.onStartExport}
        onStartImport={props.onStartImport}
      />);
    case 'image':
      return (
      <ImagePage
        image={props.ui.imageId}
        pot={props.pots.pots[props.ui.editPotId]}
        fontLoaded={props.fontLoaded}
        onDeleteImage={props.onDeleteImage}
        onSetMainImage={props.onSetMainImage}
        onBack={props.onEdit}
      />);
    default:
      return (
      <View style={styles.container}>
        <Text style={styles.h1}>Unknown Page</Text>
      </View>);
  }
}

export default AppView;
