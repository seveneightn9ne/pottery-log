// @flow
import React from 'react';
import { StyleSheet, Text, View, TextInput, TouchableHighlight, Image, Dimensions, Picker } from 'react-native';
import {Pot, Status} from './Pot.js';
//import PotsStoreState from './PotsStore.js';
import styles from './style.js'
import NewPotListItem from './NewPotListItem.js';
import PotListItem from './PotListItem.js';
import ImagePicker from './ImagePicker.js';
import ImageList from './ImageList.js';

type AppViewProps = {
  pots: Object, // PotStoreState
  ui: Object, // UIState
  onNew: () => void,
  onChangeTitle: (text: string) => void,
  onEdit: (potId: string) => void,
  onNavigateToList: () => void,
  onChangeImages: (newImageUris: string[]) => void,
  onAddImage: (potId, uri) => void,
  onSetMainImage: (potId, uri) => void,
  setStatus: (newStatus) => void,
};

function AppView(props: AppViewProps): ?React.Element<*> {
  const {height, width} = Dimensions.get('window');
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
      const mainImgHeight = width * .75; // Images have 4:3 aspect ratio
      const mainImage = (pot.images.length) ?
        <Image source={{uri: pot.images[0]}} style={{height: mainImgHeight}} /> :
        <ImagePicker onPicked={(i) => props.onAddImage(pot.uuid, i)}
          style={{height: 150}} />;
      const imageList = (pot.images.length) ?
        <ImageList images={pot.images}
          onAddImage={(i) => props.onAddImage(pot.uuid, i)}
          onClickImage={(i) => props.onSetMainImage(pot.uuid, i)} /> :
        null;
      const statuses = Status.ordered(true).map(s =>
        <Picker.Item label={Status.prettify(s)} value={s} key={s} />);
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
        {imageList}
        <Text>{pot.status.text()}</Text>
        <Picker selectedValue={pot.status.currentStatus()}
          onValueChange={props.setStatus}>
          {statuses}
        </Picker>
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
