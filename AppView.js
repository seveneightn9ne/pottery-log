// @flow
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import {Pot} from './Pot.js';
//import PotsStoreState from './PotsStore.js';

type AppViewProps = {
  pots: Pot[],
  onNew: () => void,
}

function AppView(props: AppViewProps): ?React.Element<*> {
  if (props.pots.length == 0) {
    return <View style={styles.container}><Text>You don't have any pots yet.</Text></View>;
  }
  const potListItems = props.pots.map(p => (<PotListItem pot={p} />));
  return <View style={styles.container}>
    {potListItems}
  </View>
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default AppView;
