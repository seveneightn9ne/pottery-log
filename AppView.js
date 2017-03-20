// @flow
import React from 'react';
import { StyleSheet, Text, View, TextInput } from 'react-native';
import {Pot} from './Pot.js';
//import PotsStoreState from './PotsStore.js';
import styles from './style.js'
import NewPotListItem from './NewPotListItem.js';
import PotListItem from './PotListItem.js';

type AppViewProps = {
  pots: Object, // PotStoreState
  ui: Object, // UIState
  onNew: () => void,
  onChangeTitle: (text: string) => void,
  onEdit: (potId: string) => void,
}

function AppView(props: AppViewProps): ?React.Element<*> {
  //if (props.pots.length == 0) {
  //  return <View style={styles.container}><Text>You don't have any pots yet.</Text></View>;
  //}
  switch (props.ui.page) {
    case 'list':
      const potListItems = props.pots.potIds.map(id => (
        <PotListItem pot={props.pots.pots[id]} key={id}
          onPress={() => props.onEdit(id)} />));
      return <View style={styles.container}>
        <Text style={styles.h1}>Pottery Log</Text>
        <NewPotListItem onPress={props.onNew} />
        {potListItems}
        <View />
      </View>
    case 'edit-pot':
      console.log(props.ui);
      console.log(props.pots);
      return <View style={styles.container}>
        <Text style={styles.h1}>Edit a pot</Text>
        <TextInput
        style={{height: 40, borderColor: 'gray', borderWidth: 1}}
        onChangeText={(text) => props.onChangeTitle(props.ui.editPotId, text)}
        value={props.pots.pots[props.ui.editPotId].title}
      />
      </View>
    default:
      return <View style={styles.container}>
        <Text style={styles.h1}>Unknown Page</Text>
      </View>
  }
}



export default AppView;
