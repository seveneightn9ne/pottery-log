import React, { ReactNode } from 'react';
import { Dimensions, FlatList, SectionList, SectionListData, Text, TextInput,
  TouchableHighlight, View } from 'react-native';
import { Pot } from '../models/Pot';
import Status, { capitalize, StatusString } from '../models/Status';
import { PotsStoreState } from '../stores/PotsStore';
import { ListUiState, SearchingUiState } from '../stores/UIStore';
import styles from '../style';
import NewPotButton from './components/NewPotButton';
import PotListItem from './components/PotListItem';

interface ListPageProps {
  pots: PotsStoreState;
  ui: ListUiState | SearchingUiState;
  fontLoaded: boolean;
  onNewPot: () => void;
  onClickPot: (potId: string) => void;
  onOpenSearch: () => void;
  onCloseSearch: () => void;
  onSearch: (search: string) => void;
  onNavigateToSettings: () => void;
  onCollapse: (section: string) => void;
}

interface SectionT {
  title: string;
  data: SectionData[];
}

interface SectionData {
  key: string;
  data: Pot[];
}

function filterSortedPots(allPots: Pot[], status: StatusString, searchTerm: string) {
  return allPots
    .filter((pot) => pot.status.currentStatus() === status)
    .filter((pot) => {
      // Filter for search
      if (!searchTerm) { return true; }
      if (pot.title.includes(searchTerm)) { return true; }
      if (pot.notes2.includes(searchTerm)) { return true; }
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
      const tA = dA.getTime();
      const tB = dB.getTime();
      let cmp = (tA < tB) ? -1 : (tA > tB) ? 1 : 0;
      if (potA.status.currentStatus() === 'pickedup') {
        cmp *= -1;
      }
      return cmp;
    });
}

export class ListPage extends React.Component<ListPageProps, {}> {
  private width: number;

  constructor(props: ListPageProps) {
    super(props);
    const { width } = Dimensions.get('window');
    this.width = width;
  }

  public render(): ReactNode {
    const potsLoaded = this.props.pots.hasLoaded;

    const backButton = this.props.fontLoaded ? (
      <TouchableHighlight onPress={this.props.onCloseSearch}>
        <Text style={styles.searchBack}>arrow_back</Text>
      </TouchableHighlight>) : null;

    let header;
    if ('searching' in this.props.ui && this.props.ui.searching) {
      header = (
        <View style={styles.header}>
          {backButton}
          <TextInput
            style={styles.searchBox}
            underlineColorAndroid="transparent"
            placeholderTextColor="#c8e6c9"
            onChangeText={this.props.onSearch}
            autoFocus={true}
            placeholder={'search'}
            value={this.props.ui.searchTerm || ''}
          />
        </View>
      );
    } else {
      const searchButton = this.props.fontLoaded && potsLoaded ? (
        <TouchableHighlight onPress={this.props.onOpenSearch}>
          <Text style={[styles.search, {paddingRight: 8}]}>search</Text>
        </TouchableHighlight>
      ) : null;

      const settingsButton = this.props.fontLoaded && potsLoaded ? (
        <TouchableHighlight onPress={this.props.onNavigateToSettings}>
          <Text style={[styles.search, {paddingLeft: 8}]}>settings</Text>
        </TouchableHighlight>
      ) : null;

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

    const newPotButton = <NewPotButton onPress={this.props.onNewPot} fontLoaded={this.props.fontLoaded} />;

    if (!potsLoaded) {
      return (
        <View style={styles.container}>
          {header}
          <Text style={styles.listMessage}>Loading...</Text>
        </View>);
    }

    if (this.props.pots.potIds.length === 0) {
      return (
        <View style={styles.container}>
          {header}
          <Text style={styles.listMessage}>You don't have any pots yet.</Text>
          {newPotButton}
        </View>);
    }

    const allPots = this.props.pots.potIds.map((id) => this.props.pots.pots[id]);
    const searchTerm =  ('searching' in this.props.ui && this.props.ui.searchTerm) || '';

    const sections: SectionT[] = Status.ordered().reverse().map((status) => {
      return {
        data: filterSortedPots(allPots, status, searchTerm),
        title: capitalize(Status.longterm(status)),
      };
    }).filter((section) => section.data.length > 0)
      .map((section) => this.collapsed(section.title) ? {
        data: [],
        title: section.title + ' (' + section.data.length + ')',
      } : section)
      .map((section) => ({
        data: [{ key: section.title, data: section.data }],
        title: section.title,
      }));

    /* TODO(jessk) - this goes in the SectionList
     * ref={sectionList => this.sectionList = sectionList}
     * onScroll={(e) => this.props.onScrollTo(e.nativeEvent.contentOffset.y)}
     */
    return (
      <View style={styles.container}>
        {header}
        <SectionList
          renderItem={this.renderSection}
          renderSectionHeader={this.renderSectionHeader}
          sections={sections}
          keyExtractor={this.sectionKeyExtractor}
          renderSectionFooter={this.renderSectionFooter}
        />
        {newPotButton}
        {/*<View style={styles.eraseLastSeparator} />*/}
      </View>
    );
  }

  private sectionKeyExtractor = (listdata: SectionT, index: number) => listdata.title;
  private renderSectionFooter = () => <View style={styles.separator} />;

  private stripCount = (sectionTitle: string): string => {
    if (sectionTitle.charAt(sectionTitle.length - 1) !== ')') {
      return sectionTitle;
    }
    const parts = sectionTitle.split(' ');
    const section = parts.splice(0, parts.length - 1).join(' ');
    return section;
  }

  private collapsed = (section: string) => {
    return this.props.ui.list.collapsed.indexOf(this.stripCount(section)) !== -1;
  }

  private sectionItemLayout = (layoutData: any, index: number) => {
    const itemSize = this.width / 2 - 2;
    return {
      length: itemSize,
      offset: itemSize * index,
      index,
    };
  }

  private renderPotListItem = (data: {item: Pot}): JSX.Element => {
    return (
      <PotListItem
        fontLoaded={this.props.fontLoaded}
        key={data.item.uuid}
        pot={data.item}
        onPress={this.onClickPot(data.item)}
      />
    );
  }

  private onClickPot(pot: Pot) {
    return () => this.props.onClickPot(pot.uuid);
  }

  private renderSection = (data: {item: SectionData}): JSX.Element => {
    return (
      <FlatList
        numColumns={2}
        data={data.item.data}
        keyExtractor={this.potKeyExtractor}
        getItemLayout={this.sectionItemLayout}
        renderItem={this.renderPotListItem}
      />
    );
  }

  private potKeyExtractor = (pot: Pot, index: number) => pot.uuid;

  private renderSectionHeader = (info: {section: SectionListData<SectionT>}): JSX.Element => {
    const section = info.section;
    const content = this.props.fontLoaded ? (
      <Text style={styles.collapse}>
        {this.collapsed(section.title) ? 'keyboard_arrow_down' : 'keyboard_arrow_up'}
      </Text>
     ) : null;
    return (
      <TouchableHighlight
        onPress={this.collapseSection(section.title)}
        underlayColor="#fff"
      >
        <View style={styles.lh}>
          <Text style={styles.lhText}>{section.title}</Text>
          {content}
        </View>
      </TouchableHighlight>
    );
  }

  private collapseSection = (section: string) => {
    return () => this.props.onCollapse(this.stripCount(section));
  }
}
