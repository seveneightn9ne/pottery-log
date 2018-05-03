// @flow
import React from 'react';
import { StyleSheet, Text, View, ScrollView, TextInput, TouchableHighlight, Dimensions, Picker, Button, TouchableOpacity, SectionList } from 'react-native';
import {Pot} from '../models/Pot.js';
import Status from '../models/Status.js';
import styles from '../style.js'
import NewPotListItem from './components/NewPotListItem.js';
import NewPotButton from './components/NewPotButton.js';
import PotListItem from './components/PotListItem.js';
import {shouldShowSettings} from '../export.js';

type ListPageProps = {
  pots: Object, // PotStoreState
  ui: Object, // UIState
  onNewPot: () => void,
  onClickPot: (potId: string) => void,
  onOpenSearch: () => void,
  onCloseSearch: () => void,
  onSearch: (search: string) => void,
  onNavigateToSettings: () => void,
  onImageError: (name, uri) => void,
};

function filterSortedPots(allPots, status, searching, searchTerm) {
  return allPots
    .filter(pot => pot.status.currentStatus() == status)
    .filter(pot => {
      // Filter for search
      if (!searching || !searchTerm) {return true;}
      if (pot.title.includes(searchTerm)) return true;
      if (pot.notes2.includes(searchTerm)) return true;
      return false;
    })
    .sort((potA, potB) => {
      // Sort the pots by date most recent at bottom.
      // Except sort pots with that are 'Finished' most recent at top.
      let tA = potA.status.date().getTime();
      let tB = potB.status.date().getTime();
      let cmp = 0;
      if (tA < tB) {
        cmp = -1;
      } else {
        cmp = 1;
      }
      if (tA == tB) {
        cmp = 0;
      }
      if (potA.status.currentStatus() === "pickedup") {
        cmp *= -1;
      }
      return cmp;
    });
}

export default class ListPage extends React.Component {
  render() {
    const {height, width} = Dimensions.get('window');

    const backButton = this.props.fontLoaded ?
      <TouchableHighlight onPress={this.props.onCloseSearch}>
        <Text style={styles.searchBack}>arrow_back</Text>
      </TouchableHighlight> : null;
    const topWhenSearching = (
      <View style={styles.header}>
        {backButton}
        <TextInput style={styles.searchBox}
          underlineColorAndroid='transparent'
          placeholderTextColor='#FFCCBC'
          onChangeText={this.props.onSearch}
          autoFocus={true} placeholder={'search'} value={this.props.ui.searchTerm || ''} />
      </View>
    );

    let showSettings = shouldShowSettings();
    let searchButton = this.props.fontLoaded ?
          <TouchableHighlight onPress={this.props.onOpenSearch}>
	   <Text style={styles.search}>search</Text>
          </TouchableHighlight>
        : null;

    const topWhenNotSearching = (
      <View style={styles.header}>
        <Text style={styles.h1}>Pottery Log</Text>
        <View style={{flexDirection: 'row'}}>
	  {searchButton}
          {showSettings && <TouchableHighlight onPress={this.props.onNavigateToSettings}>
            <Text style={styles.h1}>⚙</Text>
          </TouchableHighlight>}
        </View>
      </View>
    );

    const allPots = this.props.pots.potIds.map(id => this.props.pots.pots[id]);
    const searching = this.props.ui.searching;
    const searchTerm = this.props.ui.searchTerm;

    const sections = Status.ordered().reverse().map(status => {
      return {
        data: filterSortedPots(allPots, status, searching, searchTerm),
        title: status,
      };
    }).filter((section) => section.data.length > 0);

    return (<View style={styles.container}>
      {this.props.ui.searching ? topWhenSearching : topWhenNotSearching}
      <NewPotButton onPress={this.props.onNewPot} fontLoaded={this.props.fontLoaded} />
        <SectionList
          renderItem={({item}) => <PotListItem
            fontLoaded={this.props.fontLoaded}
            key={item.uuid}
            pot={item}
            onPress={() => this.props.onClickPot(item.uuid)}
            onError={this.props.onImageError}
          />}
          renderSectionHeader={({section}) =>  <Text style={styles.lh}>
            {Status.longterm(section.title).capitalize()}
            </Text>}
          sections={sections}
          keyExtractor={(pot, index) => pot.uuid}
          renderSectionFooter={() => <View style={styles.separator} />}
        />
      {/*<View style={styles.eraseLastSeparator} />*/}
    </View>);
  }
}
