// @flow
import React from 'react';
import {Pot} from '../../models/Pot.js';
import Image3 from './Image3.js';
import { Text, View, TouchableHighlight, Image } from 'react-native';
import styles from '../../style.js';
import dispatcher from '../../AppDispatcher.js';
import {nameToImageState} from '../../stores/ImageStore.js';

type PotListItemProps = {
  pot: Pot,
  onPress: () => void,
  onError: (name: string, uri: string) => void,
};

export default class PotListItem extends React.Component {
  onPress = () => {
    dispatcher.dispatch({type: 'page-edit-pot', pot: this.props.pot});
  }

  render() {
    const imgstate = this.props.pot.images3.length ?
      nameToImageState(this.props.pot.images3[0]) : null;
    const img = this.props.pot.images3.length ?
      <Image3 image={imgstate} style={styles.liImage} /> :
      <View style={styles.liImagePlaceholder}>
        {this.props.fontLoaded ? <Text style={styles.liImagePlaceholderText}>folder</Text> : null}
      </View>;
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
