// @flow
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import {Pot} from './Pot.js';
//import PotsStoreState from './PotsStore.js';
import styles from './style.js'
import NewPotListItem from './NewPotListItem.js';
import PotListItem from './PotListItem.js';

type AppViewProps = {
  pots: Pot[],
  onNew: () => void,
}

function AppView(props: AppViewProps): ?React.Element<*> {
  //if (props.pots.length == 0) {
  //  return <View style={styles.container}><Text>You don't have any pots yet.</Text></View>;
  //}
  const potListItems = props.pots.map(p => (<PotListItem pot={p} />));
  return <View style={styles.container}>
    <Text style={styles.h1}>Pottery Log</Text>
    <NewPotListItem />
    {potListItems}
    <View />
  </View>
}



export default AppView;
