// @flow
import React from 'react';
import { StyleSheet, Text, View, ScrollView, TextInput, TouchableHighlight, Dimensions, Picker, Button, TouchableOpacity, SectionList, FlatList } from 'react-native';
import { Pot } from '../models/Pot';
import Status from '../models/Status';
import styles from '../style'
import NewPotListItem from './components/NewPotListItem';
import NewPotButton from './components/NewPotButton';
import PotListItem from './components/PotListItem';

type ListPageProps = {
  pots: Object, // PotStoreState
  ui: Object, // UIState
  onNewPot: () => void,
  onClickPot: (potId: string) => void,
  onOpenSearch: () => void,
  onCloseSearch: () => void,
  onSearch: (search: string) => void,
  onNavigateToSettings: () => void,
  onImageError: (name: string, uri: string) => void,
};

function filterSortedPots(allPots, status, searching, searchTerm) {
  return allPots
    .filter(pot => pot.status.currentStatus() == status)
    .filter(pot => {
      // Filter for search
      if (!searching || !searchTerm) { return true; }
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
  // TODO(jessk): it doesn't scroll all the way, why?
  /*componentDidMount() {
    if (this.sectionList && this.props.ui.y) {
    	console.log("Will scroll to " + this.props.ui.y);
	setTimeout(() => {
	    this.props.onStartScroll();
	    this.sectionList.getScrollResponder().scrollTo({y: this.props.ui.y, animated: false});
	    //this.props.onEndScroll();
	}, 0);
    } else {
    	console.log("Skipping list scroll");
    }
  }*/
  render() {
    const { height, width } = Dimensions.get('window');
    const potsLoaded = this.props.pots.hasLoaded;

    const backButton = this.props.fontLoaded ?
      <TouchableHighlight onPress={this.props.onCloseSearch}>
        <Text style={styles.searchBack}>arrow_back</Text>
      </TouchableHighlight> : null;
    const topWhenSearching = (
      <View style={styles.header}>
        {backButton}
        <TextInput style={styles.searchBox}
          underlineColorAndroid='transparent'
          placeholderTextColor='#c8e6c9'
          onChangeText={this.props.onSearch}
          autoFocus={true} placeholder={'search'} value={this.props.ui.searchTerm || ''} />
      </View>
    );

    let searchButton = this.props.fontLoaded && potsLoaded ?
      <TouchableHighlight onPress={this.props.onOpenSearch}>
        <Text style={[styles.search, {paddingRight: 8}]}>search</Text>
      </TouchableHighlight>
      : null;
    
    let settingsButton = this.props.fontLoaded && potsLoaded ?
      <TouchableHighlight onPress={this.props.onNavigateToSettings}>
        <Text style={[styles.search, {paddingLeft: 8}]}>settings</Text>
      </TouchableHighlight>
      : null;

    const topWhenNotSearching = (
      <View style={styles.header}>
        <Text style={[styles.h1, {flex: 1}]}>Pottery Log</Text>
        <View style={{ flexDirection: 'row' }}>
          {searchButton}
          {settingsButton}
        </View>
      </View>
    );

    const newPotButton = <NewPotButton onPress={this.props.onNewPot} fontLoaded={this.props.fontLoaded} />

    if (!potsLoaded) {
      return <View style={styles.container}>
        {topWhenNotSearching}
        <Text style={styles.listMessage}>Loading...</Text>
      </View>
    }

    if (this.props.pots.potIds.length == 0) {
      return <View style={styles.container}>
        {topWhenNotSearching}
        <Text style={styles.listMessage}>You don't have any pots yet.</Text>
        {newPotButton}
      </View>
    }

    const allPots = this.props.pots.potIds.map(id => this.props.pots.pots[id]);
    const searching = this.props.ui.searching;
    const searchTerm = this.props.ui.searchTerm;

    const stripCount = (sectionTitle) => {
      if (sectionTitle.charAt(sectionTitle.length - 1) != ")") {
        return sectionTitle;
      }
      const parts = sectionTitle.split(" ");
      const section = parts.splice(0, parts.length - 1).join(" ");
      return section;
    }

    const collapsed = (section) => {
      return this.props.ui.collapsed.indexOf(stripCount(section)) != -1;
    }

    const sections = Status.ordered().reverse().map(status => {
      return {
        data: filterSortedPots(allPots, status, searching, searchTerm),
        title: Status.longterm(status).capitalize(),
      };
    }).filter((section) => section.data.length > 0)
      .map((section) => collapsed(section.title) ? {
        data: [],
        title: section.title + " (" + section.data.length + ")",
      } : section)
      .map((section) => ({
        data: [{ key: section.title, data: section.data }],
        title: section.title,
      }));

    /* TODO(jessk) - this goes in the SectionList
     * ref={sectionList => this.sectionList = sectionList}
     * onScroll={(e) => this.props.onScrollTo(e.nativeEvent.contentOffset.y)}
     */
    const itemSize = width / 2 - 2;
    return (<View style={styles.container}>
      {this.props.ui.searching ? topWhenSearching : topWhenNotSearching}
      <SectionList
        renderItem={({ item }) => <FlatList
          numColumns={2}
          data={item.data}
          keyExtractor={(pot, index) => pot.uuid}
          getItemLayout={(layoutData, index) => ({
            length: itemSize,
            offset: itemSize * index,
            index,
          })}
          renderItem={({ item }) => <PotListItem
            fontLoaded={this.props.fontLoaded}
            key={item.uuid}
            pot={item}
            onPress={() => this.props.onClickPot(item.uuid)}
            onError={this.props.onImageError}
          />}
        />}
        renderSectionHeader={({ section }) =>
          <TouchableHighlight
            onPress={() => this.props.onCollapse(stripCount(section.title))}
            underlayColor="#fff"><View style={styles.lh}>
              <Text style={styles.lhText}>{section.title}</Text>
              {this.props.fontLoaded ?
                <Text style={[styles.rhText, styles.collapse]}>{collapsed(stripCount(section.title)) ?
                  "keyboard_arrow_down" : "keyboard_arrow_up"}</Text> : null}
            </View></TouchableHighlight>}
        sections={sections}
        keyExtractor={(listdata, index) => listdata.title}
        renderSectionFooter={() => <View style={styles.separator} />}
      />
      {newPotButton}
      {/*<View style={styles.eraseLastSeparator} />*/}
    </View>);
  }
}
