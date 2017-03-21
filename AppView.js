// @flow
import React from 'react';
import { StyleSheet, Text, View, TextInput, TouchableHighlight, Image } from 'react-native';
import {Pot, statusText} from './Pot.js';
//import PotsStoreState from './PotsStore.js';
import styles from './style.js'
import NewPotListItem from './NewPotListItem.js';
import PotListItem from './PotListItem.js';
import ImagePicker from './ImagePicker.js';

type AppViewProps = {
  pots: Object, // PotStoreState
  ui: Object, // UIState
  onNew: () => void,
  onChangeTitle: (text: string) => void,
  onEdit: (potId: string) => void,
  onNavigateToList: () => void,
  onChangeImages: (newImageUris: string[]) => void,
  onAddImage: (potId, uri) => void,
};

function AppView(props: AppViewProps): ?React.Element<*> {
  switch (props.ui.page) {
    case 'list': {
      const potListItems = props.pots.potIds.map(id => (
        <PotListItem pot={props.pots.pots[id]} key={id}
          onPress={() => props.onEdit(id)} />));
      return (<View style={styles.container}>
        <Text style={styles.h1}>Pottery Log</Text>
        <NewPotListItem onPress={props.onNew} />
        {potListItems}
        <View />
      </View>);
    }
    case 'edit-pot': {
      const pot = props.pots.pots[props.ui.editPotId];
      const mainImage = (pot.images.length) ?
        <Image source={{uri: pot.images[0]}} style={{height: 150}} /> :
        <ImagePicker onPicked={(i) => props.onAddImage(pot.uuid, i)}
          style={{height: 150}} />;
      return <View style={styles.container}>
        <View style={{flexDirection: 'row'}}>
          <TouchableHighlight onPress={props.onNavigateToList}>
            <Text style={styles.back}>&lt;</Text>
          </TouchableHighlight>
          <TextInput style={[styles.h1, {flex: 1}]}
            onChangeText={(text) => props.onChangeTitle(pot.uuid, text)}
            value={pot.title}
          />
        </View>
        {mainImage}
        <Text>{statusText(pot.status)}</Text>
      </View>
    }
    default: {
      return <View style={styles.container}>
        <Text style={styles.h1}>Unknown Page</Text>
      </View>
    }
  }
}

export default AppView;
