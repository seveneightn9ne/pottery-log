// @flow
import React from 'react';
import { StyleSheet, Text, View, ScrollView, TextInput, TouchableHighlight, Image, Dimensions, Picker, Button, TouchableOpacity } from 'react-native';
import {Pot} from '../models/Pot.js';
import Status from '../models/Status.js';
import styles from '../style.js'
import NewPotListItem from './components/NewPotListItem.js';
import PotListItem from './components/PotListItem.js';

type ListPageProps = {
  pots: Object, // PotStoreState
  ui: Object, // UIState
  onNewPot: () => void,
  onClickPot: (potId: string) => void,
  onOpenSearch: () => void,
  onCloseSearch: () => void,
  onSearch: (search: string) => void,
};

export default class ListPage extends React.Component {
  render() {
    const {height, width} = Dimensions.get('window');
    const lists = Status.ordered().reverse().map(status => {
      const potListItems = this.props.pots.potIds.
          filter(id => this.props.pots.pots[id].status.currentStatus() == status).
          filter(id => {
            // Filter for search
            if (!this.props.ui.searching) {return true;}
            const pot = this.props.pots.pots[id];
            const searchTerm = this.props.ui.searchTerm;
            if (!searchTerm) return true;
            if (pot.title.includes(searchTerm)) return true;
            if (pot.notes2.includes(searchTerm)) return true;
            return false;
          }).map(id => (<PotListItem pot={this.props.pots.pots[id]} key={id}
            onPress={() => this.props.onClickPot(id)} />));
      const title = <Text style={styles.lh}>{Status.longterm(status).capitalize()}</Text>;
      return potListItems.length ? <View key={status}>{title}{potListItems}</View> : null;
    });

    const topWhenSearching = (
      <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
        <TextInput style={[styles.h1, {flex: 1, fontWeight: 'normal'}]}
          onChangeText={this.props.onSearch}
          autoFocus={true} placeholder={'search'} value={this.props.ui.searchTerm || ''} />
        <TouchableHighlight onPress={this.props.onCloseSearch}>
          <Text style={[styles.h1, {color: 'red'}]}>X</Text>
        </TouchableHighlight>
      </View>
    );

    const topWhenNotSearching = (
      <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
        <Text style={styles.h1}>Pottery Log</Text>
        <TouchableHighlight onPress={this.props.onOpenSearch}>
          <Text style={styles.h1}>🔍</Text>
        </TouchableHighlight>
      </View>
    );

    return (<View style={styles.container}>
      {this.props.ui.searching ? topWhenSearching : topWhenNotSearching}
      <NewPotListItem onPress={this.props.onNewPot} />
      <ScrollView>
        {lists}
      </ScrollView>
      <View />
    </View>);
  }
}
