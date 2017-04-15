// @flow
import React from 'react';
import {Text, View} from 'react-native';
import styles from '../style.js'
import ListPage from './ListPage.js';
import EditPage from './EditPage.js';

type AppViewProps = {
  pots: Object, // PotStoreState
  ui: Object, // UIState
  onNew: () => void,
  onChangeTitle: (text: string) => void,
  onChangeNote: (potId: string, date: Date, text: string) => void,
  onNewNote: () => void,
  onEdit: (potId: string) => void,
  onNavigateToList: () => void,
  onChangeImages: (newImageUris: string[]) => void,
  onAddImage: (potId, uri) => void,
  onSetMainImage: (potId, uri) => void,
  setStatus: (newStatus) => void,
  setStatusDate: (date) => void,
  onDelete: () => void,
  onCopy: () => void,
  onOpenSearch: () => void,
  onCloseSearch: () => void,
  onSearch: (search: string) => void,
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
      />;
    case 'edit-pot':
      return <EditPage pot={props.pots.pots[props.ui.editPotId]}
        ui={props.ui}
        onChangeTitle={props.onChangeTitle}
        onChangeNote={props.onChangeNote}
        onNewNote={props.onNewNote}
        onNavigateToList={props.onNavigateToList}
        onChangeImages={props.onChangeImages}
        onAddImage={props.onAddImage}
        onSetMainImage={props.onSetMainImage}
        setStatus={props.setStatus}
        setStatusDate={props.setStatusDate}
        onDelete={props.onDelete} onCopy={props.onCopy}
      />;
    default:
      return <View style={styles.container}>
        <Text style={styles.h1}>Unknown Page</Text>
      </View>
  }
}

export default AppView;
