// @flow
import React from 'react';
import { StyleSheet, Text, View, ScrollView, TextInput, TouchableHighlight, Image, Dimensions, Picker, Button, TouchableOpacity } from 'react-native';
import {Pot, Status} from './Pot.js';
//import PotsStoreState from './PotsStore.js';
import styles from './style.js'
import NewPotListItem from './NewPotListItem.js';
import PotListItem from './PotListItem.js';
import ImagePicker from './ImagePicker.js';
import ImageList from './ImageList.js';
import DatePicker from './DatePicker.js';

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
  setStatusDate: (date) => void,
  onDelete: () => void,
  onCopy: () => void,
};

function AppView(props: AppViewProps): ?React.Element<*> {
  const {height, width} = Dimensions.get('window');
  switch (props.ui.page) {
    case 'list': {
      const lists = Status.ordered().reverse().map(status => {
        const potListItems = props.pots.potIds.
            filter(id => props.pots.pots[id].status.currentStatus() == status).
            map(id => (<PotListItem pot={props.pots.pots[id]} key={id}
              onPress={() => props.onEdit(id)} />));
        const title = <Text style={styles.lh}>{Status.progressive(status)}</Text>;
        return potListItems.length ? <View key={status}>{title}{potListItems}</View> : null;
      });

      return (<View style={styles.container}>
        <Text style={styles.h1}>Pottery Log</Text>
        <NewPotListItem onPress={props.onNew} />
        <ScrollView>
          {lists}
        </ScrollView>
        <View />
      </View>);
    }
    case 'edit-pot': {
      const pot = props.pots.pots[props.ui.editPotId];
      const mainImgHeight = width * .75; // Images have 4:3 aspect ratio
      const mainImage = (pot.images.length) ?
        <TouchableOpacity onLongPress={() => props.onDeleteImage(pot.images[0])}>
          <Image source={{uri: pot.images[0]}} style={{height: mainImgHeight}} />
        </TouchableOpacity> :
        <ImagePicker onPicked={(i) => props.onAddImage(pot.uuid, i)}
          style={{height: 150}} />;
      const imageList = (pot.images.length) ?
        <ImageList images={pot.images}
          onAddImage={(i) => props.onAddImage(pot.uuid, i)}
          onClickImage={(i) => props.onSetMainImage(pot.uuid, i)}
          onDeleteImage={(i) => props.onDeleteImage(i)} /> :
        null;
      const statuses = Status.ordered(true).map(s =>
        <Picker.Item label={Status.prettify(s)} value={s} key={s} />);
      const nextButton = pot.status.next() ? <Button
          title={pot.status.next(true /* pretty */)}
          onPress={() => props.setStatus(pot.status.next())} /> : null;
      return <View style={styles.container}>
        <View style={{flexDirection: 'row'}}>
          <TouchableHighlight onPress={props.onNavigateToList}>
            <Text style={styles.back}>&lt;</Text>
          </TouchableHighlight>
          <TextInput style={[styles.h1, {flex: 1}]}
            onChangeText={(text) => props.onChangeTitle(pot.uuid, text)}
            value={pot.title} autoFocus={pot.title == 'New Pot'}
            selectTextOnFocus={true}
          />
        </View>
        {mainImage}
        {imageList}
        {/*<Text>{pot.status.text()}</Text>*/}
        <View style={{flexDirection: 'row', padding: 5}}>
          <Picker selectedValue={pot.status.currentStatus()}
            onValueChange={props.setStatus} style={{width: 150}}>
            {statuses}
          </Picker>
          <Text style={{paddingLeft: 10, paddingRight: 10}}>on</Text>
          <DatePicker value={pot.status.date()}
            style={{marginRight: 10}}
            onPickDate={props.setStatusDate} />
          {nextButton}
        </View>
        <Button onPress={props.onDelete} title="Delete" />
        <Button onPress={props.onCopy} title="Copy Pot" />
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
