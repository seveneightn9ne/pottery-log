// @flow
import React from 'react';
import {Text, View} from 'react-native';
import {Image} from '../models/Pot.js';
import styles from '../style.js'
import ListPage from './ListPage.js';
import EditPage from './EditPage.js';
import SettingsPage from './SettingsPage.js';

type AppViewProps = {
  pots: Object, // PotStoreState
  ui: Object, // UIState
  images: Object, // ImageStoreState
  onNew: () => void,
  onChangeTitle: (text: string) => void,
  onChangeNote: (potId: string, date: Date, text: string) => void,
  onNewNote: () => void,
  onEdit: (potId: string) => void,
  onNavigateToList: () => void,
  onNavigateToSettings: () => void,
  onAddImage: (potId, localUri) => void,
  onSetMainImage: (potId, name) => void,
  onDeleteImage: (name) => void,
  setStatus: (newStatus) => void,
  setStatusDate: (date) => void,
  onDelete: () => void,
  onCopy: () => void,
  onOpenSearch: () => void,
  onCloseSearch: () => void,
  onSearch: (search: string) => void,
  onExport: () => void,
  onImport: (data: string) => void,
  onImageError: (name ,uri) => void,
};

function AppView(props: AppViewProps): ?React.Element<*> {
  switch (props.ui.page) {
    case 'list':
      return <ListPage pots={props.pots} ui={props.ui}
        onNewPot={props.onNew}
        onClickPot={props.onEdit}
        onOpenSearch={props.onOpenSearch}
        onCloseSearch={props.onCloseSearch}
        onSearch={props.onSearch}
        onNavigateToSettings={props.onNavigateToSettings}
        onImageError={props.onImageError}
      />;
    case 'edit-pot':
      return <EditPage pot={props.pots.pots[props.ui.editPotId]}
        ui={props.ui}
        images={props.images}
        onChangeTitle={props.onChangeTitle}
        onChangeNote={props.onChangeNote}
        onNewNote={props.onNewNote}
        onNavigateToList={props.onNavigateToList}
        onAddImage={props.onAddImage}
        onDeleteImage={props.onDeleteImage}
        onSetMainImage={props.onSetMainImage}
        setStatus={props.setStatus}
        setStatusDate={props.setStatusDate}
        onDelete={props.onDelete} onCopy={props.onCopy}
      />;
    case 'settings':
      return <SettingsPage
        onNavigateToList={props.onNavigateToList}
        onExport={props.onExport}
        onImport={props.onImport}
        />;
    default:
      return <View style={styles.container}>
        <Text style={styles.h1}>Unknown Page</Text>
      </View>
  }
}

export default AppView;
