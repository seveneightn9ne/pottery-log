import _ from 'lodash';
import React, { ReactNode } from 'react';
import {
  Dimensions,
  FlatList,
  SectionList,
  SectionListData,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import ElevatedView from 'react-native-elevated-view';
import { connect } from 'react-redux';
import { newPot, Pot } from '../models/Pot';
import Status, { capitalize } from '../models/Status';
import { FullState } from '../reducers/types';
import { filterBySearchTerm, filterByStatus, sort } from '../selectors/pots';
import style from '../style';
import { PLThunkDispatch } from '../thunks/types';
import NewPotButton from './components/NewPotButton';
import PotListItem from './components/PotListItem';
import { getDerivedDarkMode } from '../selectors/settings';

interface OwnProps {
  fontLoaded: boolean;
}

interface SectionData {
  key: string;
  data: Pot[];
}

const mapDispatchToProps = (dispatch: PLThunkDispatch) => ({
  onNewPot: () =>
    dispatch({
      type: 'new',
      pot: newPot(),
    }),
  onClickPot: (potId: string) =>
    dispatch({
      type: 'page-edit-pot',
      potId,
    }),

  onOpenSearch: () =>
    dispatch({
      type: 'list-search-open',
    }),
  onCloseSearch: () =>
    dispatch({
      type: 'list-search-close',
    }),
  onSearch: (text: string) => {
    console.log('search', text);
    dispatch({
      type: 'list-search-term',
      text,
    });
  },
  onCollapse: (section: string) =>
    dispatch({
      type: 'list-collapse',
      section,
    }),
  onNavigateToSettings: () =>
    dispatch({
      type: 'page-settings',
    }),
});

type PropsFromDispatch = ReturnType<typeof mapDispatchToProps>;

const mapStateToProps = (state: FullState) => {
  const isSearching = 'searching' in state.ui && state.ui.searching;
  const searchTerm = ('searching' in state.ui && state.ui.searchTerm) || '';

  /**
   * The idea here is to split the pots by status, then sort each group,
   * then concatenate the resulting arrays. The order of the status-groups
   * doesn't matter because everything (currently) using pots will filter
   * by a status.
   */
  const pots = _.concat(
    [],
    ..._.values(
      _.mapValues(
        _.groupBy(
          filterBySearchTerm(
            state.pots.potIds.map((potId) => state.pots.pots[potId]),
            searchTerm,
          ),
          (p) => {
            if (!p || !p.status) {
              console.warn('sorting pot with no status', p);
              return '';
            }
            return p.status.currentStatus();
          },
        ),
        (plist) => sort(plist),
      ),
    ),
  );

  return {
    potsHaveLoaded: state.pots.hasLoaded,
    pots,
    images: _.chain(state.pots.potIds)
      .keyBy((i) => i) // map keys are potId
      .mapValues((potId) => {
        // map values are pot.images3[0]
        const i3 = state.pots.pots[potId].images3;
        return i3.length ? state.images.images[i3[0]] : null;
      })
      .value(), // as { [potId: string]: ImageState },
    searchTerm,
    isSearching,
    collapsed: _.defaults(
      _.chain(state.ui.list.collapsed)
        .keyBy((s) => s)
        .mapValues(() => true)
        .value(), // the statuses in collapsed are 'true'
      _.chain(Status.ordered())
        .keyBy((s) => s)
        .mapValues(() => false)
        .value(), // the rest of the statuses are 'false'
    ), // as unknown) as { [s: string]: boolean },
    theme: getDerivedDarkMode(state.settings.darkMode),
  };
};

type PropsFromState = ReturnType<typeof mapStateToProps>;

type ListPageProps = OwnProps & PropsFromState & PropsFromDispatch;

class ListPage extends React.Component<ListPageProps, {}> {
  private width: number;

  constructor(props: ListPageProps) {
    super(props);
    const { width } = Dimensions.get('window');
    this.width = width;
  }

  public render(): ReactNode {
    const potsLoaded = this.props.potsHaveLoaded;

    const backButton = this.props.fontLoaded ? (
      <TouchableOpacity onPress={this.props.onCloseSearch}>
        <Text style={style.s.searchBack}>arrow_back</Text>
      </TouchableOpacity>
    ) : null;

    let header;
    if (this.props.isSearching) {
      header = (
        <ElevatedView style={style.s.header} elevation={4}>
          {backButton}
          <TextInput
            style={style.s.searchBox}
            underlineColorAndroid="transparent"
            placeholderTextColor="#c8e6c9"
            onChangeText={this.props.onSearch}
            autoFocus={true}
            placeholder={'search'}
            value={this.props.searchTerm}
            onBlur={this.onSearchBlur}
          />
        </ElevatedView>
      );
    } else {
      const searchButton =
        this.props.fontLoaded && potsLoaded ? (
          <TouchableOpacity onPress={this.props.onOpenSearch}>
            <Text style={[style.s.search, { paddingRight: 8 }]}>search</Text>
          </TouchableOpacity>
        ) : null;

      const settingsButton =
        this.props.fontLoaded && potsLoaded ? (
          <TouchableOpacity onPress={this.props.onNavigateToSettings}>
            <Text style={[style.s.search, { paddingLeft: 8 }]}>settings</Text>
          </TouchableOpacity>
        ) : null;

      header = (
        <ElevatedView style={style.s.header} elevation={4}>
          <Text style={[style.s.h1, { flex: 1 }]}>Pottery Log</Text>
          <View style={{ flexDirection: 'row' }}>
            {searchButton}
            {settingsButton}
          </View>
        </ElevatedView>
      );
    }

    const newPotButton = (
      <NewPotButton
        onPress={this.props.onNewPot}
        fontLoaded={this.props.fontLoaded}
      />
    );

    if (!potsLoaded) {
      return (
        <View style={style.s.container}>
          {header}
          <Text style={style.s.listMessage}>Loading...</Text>
        </View>
      );
    }

    if (this.props.pots.length === 0) {
      const message = this.props.isSearching
        ? `There are no pots matching "${this.props.searchTerm}".`
        : "You don't have any pots yet.";
      return (
        <View style={style.s.container}>
          {header}
          <Text style={style.s.listMessage}>{message}</Text>
          {newPotButton}
        </View>
      );
    }

    const sections: Array<SectionListData<Pot>> = Status.ordered()
      .reverse()
      .map((status) => {
        return {
          data: filterByStatus(this.props.pots, status),
          key: capitalize(Status.longterm(status)),
        };
      })
      .filter((section) => section.data.length > 0)
      .map((section) =>
        this.props.collapsed[section.key]
          ? {
              data: [],
              key: section.key + ' (' + section.data.length + ')',
            }
          : section,
      );

    /* TODO(jessk) - this goes in the SectionList
     * ref={sectionList => this.sectionList = sectionList}
     * onScroll={(e) => this.props.onScrollTo(e.nativeEvent.contentOffset.y)}
     */
    return (
      <View style={style.s.container}>
        {header}
        <SectionList<Pot>
          renderItem={this.renderSection}
          renderSectionHeader={this.renderSectionHeader}
          sections={sections}
          keyExtractor={this.potKeyExtractor}
          renderSectionFooter={this.renderSectionFooter}
        />
        {newPotButton}
        {/*<View style={style.s.eraseLastSeparator} />*/}
      </View>
    );
  }

  private onSearchBlur = () => {
    if (this.props.isSearching && this.props.searchTerm === '') {
      this.props.onCloseSearch();
    }
  };

  private renderSectionFooter = () => <View style={style.s.separator} />;

  private stripCount = (sectionTitle: string): string => {
    if (sectionTitle.charAt(sectionTitle.length - 1) !== ')') {
      return sectionTitle;
    }
    const parts = sectionTitle.split(' ');
    const section = parts.splice(0, parts.length - 1).join(' ');
    return section;
  };

  private sectionItemLayout = (layoutData: any, index: number) => {
    const itemSize = this.width / 2 - 2;
    return {
      length: itemSize,
      offset: itemSize * index,
      index,
    };
  };

  private renderPotListItem = (data: { item: Pot }): JSX.Element => {
    return (
      <PotListItem
        key={data.item.uuid}
        pot={data.item}
        image={this.props.images[data.item.uuid]}
        onPress={this.onClickPot(data.item)}
        {...this.props}
      />
    );
  };

  private onClickPot(pot: Pot) {
    return () => this.props.onClickPot(pot.uuid);
  }

  private renderSection = (data: { section: SectionListData<Pot> }): JSX.Element => {
    return (
      <FlatList
        numColumns={2}
        data={data.section.data}
        keyExtractor={this.potKeyExtractor}
        getItemLayout={this.sectionItemLayout}
        renderItem={this.renderPotListItem}
      />
    );
  };

  private potKeyExtractor = (pot: Pot, index: number) => pot.uuid;

  private renderSectionHeader = (info: {
    section: SectionListData<Pot>;
  }): React.ReactElement => {
    /**
     * Typecast is neccessary because I know I put a `key` in the section
     * but the type passed in has optional key
     */
    const section = info.section as SectionData;
    const content = this.props.fontLoaded ? (
      <Text style={style.s.collapse}>
        {this.props.collapsed[section.key]
          ? 'keyboard_arrow_down'
          : 'keyboard_arrow_up'}
      </Text>
    ) : null;
    return (
      <TouchableOpacity onPress={this.collapseSection(section.key)}>
        <View style={style.s.lh}>
          <Text style={style.s.lhText}>{section.key}</Text>
          {content}
        </View>
      </TouchableOpacity>
    );
  };

  private collapseSection = (section: string) => {
    return () => this.props.onCollapse(this.stripCount(section));
  };
}

export default connect<PropsFromState, PropsFromDispatch, OwnProps, FullState>(
  mapStateToProps,
  mapDispatchToProps,
)(ListPage);
