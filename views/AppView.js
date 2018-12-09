// @flow
import React from 'react';
import {Text, View} from 'react-native';
import {Image} from '../models/Pot.js';
import ImagePage from './ImagePage.js';
import styles from '../style.js'
import ListPage from './ListPage.js';
import EditPage from './EditPage.js';
import SettingsPage from './SettingsPage.js';

type AppViewProps = {
  pots: Object, // PotStoreState
  ui: Object, // UIState
  images: Object, // ImageStoreState
  exports: Object, // ExportState

  fontLoaded: bool,

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
        fontLoaded={props.fontLoaded}
        onNewPot={props.onNew}
        onClickPot={props.onEdit}
        onOpenSearch={props.onOpenSearch}
        onCloseSearch={props.onCloseSearch}
        onSearch={props.onSearch}
        onNavigateToSettings={props.onNavigateToSettings}
        onImageError={props.onImageError}
        onCollapse={props.onCollapse}
        onScrollTo={props.onScrollTo}
        onStartScroll={props.onStartScroll}
        onEndScroll={props.onEndScroll}
      />;
    case 'edit-pot':
      return <EditPage pot={props.pots.pots[props.ui.editPotId]}
        ui={props.ui}
        images={props.images}
        fontLoaded={props.fontLoaded}
        onChangeTitle={props.onChangeTitle}
        onChangeNote={props.onChangeNote}
        onNewNote={props.onNewNote}
        onNavigateToList={props.onNavigateToList}
        onAddImage={props.onAddImage}
        onDeleteImage={props.onDeleteImage}
        onSetMainImage={props.onSetMainImage}
        onExpandImage={props.onExpandImage}
        setStatus={props.setStatus}
        setStatusDate={props.setStatusDate}
        onDelete={props.onDelete} onCopy={props.onCopy}
      />;
    case 'settings':
      return <SettingsPage
        exports={props.exports}
        fontLoaded={props.fontLoaded}
        onNavigateToList={props.onNavigateToList}
        onStartExport={props.onStartExport}
        onStartImport={props.onStartImport}
        />;
    case 'image':
      return <ImagePage image={props.ui.imageId}
      	pot={props.pots.pots[props.ui.editPotId]}
      	fontLoaded={props.fontLoaded}
        onDeleteImage={props.onDeleteImage}
        onSetMainImage={props.onSetMainImage}
        onBack={props.onEdit}
      />;
    default:
      return <View style={styles.container}>
        <Text style={styles.h1}>Unknown Page</Text>
      </View>
  }
}

export default AppView;
