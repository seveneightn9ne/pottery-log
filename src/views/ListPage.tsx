import React, { ReactNode } from 'react';
import { Text, View, TextInput, TouchableHighlight, Dimensions, SectionList, FlatList } from 'react-native';
import { Pot } from '../models/Pot';
import Status, { StatusString, capitalize } from '../models/Status';
import styles from '../style'
import NewPotButton from './components/NewPotButton';
import PotListItem from './components/PotListItem';
import { PotsStoreState } from '../stores/PotsStore';
import { ListUiState, SearchingUiState } from '../stores/UIStore';

type ListPageProps = {
  pots: PotsStoreState,
  ui: ListUiState | SearchingUiState,
  fontLoaded: boolean,
  onNewPot: () => void,
  onClickPot: (potId: string) => void,
  onOpenSearch: () => void,
  onCloseSearch: () => void,
  onSearch: (search: string) => void,
  onNavigateToSettings: () => void,
  onCollapse: (section: string) => void,
};

function filterSortedPots(allPots: Pot[], status: StatusString, searchTerm: string) {
  return allPots
    .filter(pot => pot.status.currentStatus() == status)
    .filter(pot => {
      // Filter for search
      if (!searchTerm) { return true; }
      if (pot.title.includes(searchTerm)) return true;
      if (pot.notes2.includes(searchTerm)) return true;
      return false;
    })
    .sort((potA, potB) => {
      // Sort the pots by date most recent at bottom.
      // Except sort pots with that are 'Finished' most recent at top.
      const dA = potA.status.date();
      const dB = potB.status.date();
      if (!dA || !dB) {
        // one of the dates is undefined. whatever
        return 0;
      }
      let tA = dA.getTime();
      let tB = dB.getTime();
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

export default class ListPage extends React.Component<ListPageProps, {}> {
  render(): ReactNode {
    const { width } = Dimensions.get('window');
    const potsLoaded = this.props.pots.hasLoaded;

    const backButton = this.props.fontLoaded ?
      <TouchableHighlight onPress={this.props.onCloseSearch}>
        <Text style={styles.searchBack}>arrow_back</Text>
      </TouchableHighlight> : null;

    let header;
    if ('searching' in this.props.ui) {
      header = (
        <View style={styles.header}>
          {backButton}
          <TextInput style={styles.searchBox}
            underlineColorAndroid='transparent'
            placeholderTextColor='#c8e6c9'
            onChangeText={this.props.onSearch}
            autoFocus={true} placeholder={'search'} value={this.props.ui.searchTerm || ''} />
        </View>
      );
    } else {
      const searchButton = this.props.fontLoaded && potsLoaded ?
        <TouchableHighlight onPress={this.props.onOpenSearch}>
          <Text style={[styles.search, {paddingRight: 8}]}>search</Text>
        </TouchableHighlight>
        : null;

      const settingsButton = this.props.fontLoaded && potsLoaded ?
        <TouchableHighlight onPress={this.props.onNavigateToSettings}>
          <Text style={[styles.search, {paddingLeft: 8}]}>settings</Text>
        </TouchableHighlight>
        : null;

      header = (
        <View style={styles.header}>
          <Text style={[styles.h1, {flex: 1}]}>Pottery Log</Text>
          <View style={{ flexDirection: 'row' }}>
            {searchButton}
            {settingsButton}
          </View>
        </View>
      );
    }

    const newPotButton = <NewPotButton onPress={this.props.onNewPot} fontLoaded={this.props.fontLoaded} />

    if (!potsLoaded) {
      return <View style={styles.container}>
        {header}
        <Text style={styles.listMessage}>Loading...</Text>
      </View>
    }

    if (this.props.pots.potIds.length == 0) {
      return <View style={styles.container}>
        {header}
        <Text style={styles.listMessage}>You don't have any pots yet.</Text>
        {newPotButton}
      </View>
    }

    const allPots = this.props.pots.potIds.map(id => this.props.pots.pots[id]);
    const searchTerm =  ('searching' in this.props.ui && this.props.ui.searchTerm) || '';

    const stripCount = (sectionTitle: string) => {
      if (sectionTitle.charAt(sectionTitle.length - 1) != ")") {
        return sectionTitle;
      }
      const parts = sectionTitle.split(" ");
      const section = parts.splice(0, parts.length - 1).join(" ");
      return section;
    }

    const collapsed = (section: string) => {
      return this.props.ui.list.collapsed.indexOf(stripCount(section)) != -1;
    }

    const sections = Status.ordered().reverse().map(status => {
      return {
        data: filterSortedPots(allPots, status, searchTerm),
        title: capitalize(Status.longterm(status)),
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
      {header}
      <SectionList
        renderItem={({ item }) => <FlatList
          numColumns={2}
          data={item.data}
          keyExtractor={(pot: Pot, index) => pot.uuid}
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
          />}
        />}
        renderSectionHeader={({ section }) =>
          <TouchableHighlight
            onPress={() => this.props.onCollapse(stripCount(section.title))}
            underlayColor="#fff"><View style={styles.lh}>
              <Text style={styles.lhText}>{section.title}</Text>
              {this.props.fontLoaded ?
                <Text style={styles.collapse}>{collapsed(stripCount(section.title)) ?
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
