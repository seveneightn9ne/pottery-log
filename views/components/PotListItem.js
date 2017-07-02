// @flow
import React from 'react';
import {Pot} from '../../models/Pot.js';
import { Text, View, TouchableHighlight, Image } from 'react-native';
import styles from '../../style.js';
import dispatcher from '../../AppDispatcher.js';
import {nameToUri} from '../../stores/ImageStore.js';

type PotListItemProps = {
  pot: Pot,
  onPress: () => void,
};

export default class PotListItem extends React.Component {
  onPress = () => {
    dispatcher.dispatch({type: 'page-edit-pot', pot: this.props.pot});
  }

  render() {
    const imgUri = this.props.pot.images3.length ?
      nameToUri(this.props.pot.images3[0]) : null;
    const img = this.props.pot.images3.length ?
      <Image source={{uri: imgUri}} style={styles.size50} /> : null;
    const noteStar = this.props.pot.notes2.isEmpty() ? null : <Text>*</Text>
    return (<TouchableHighlight onPress={this.props.onPress}>
      <View style={styles.listItem}>
        {img}
        <View style={[styles.listItemChild, {paddingLeft: 10, flexDirection: 'column'}]}>
          <Text style={styles.lititle}>{this.props.pot.title}</Text>
          <View style={{flexDirection: 'row'}}>
            {this.props.pot.status.text()}
            {noteStar}
          </View>
        </View>
      </View>
    </TouchableHighlight>);
  }


}
