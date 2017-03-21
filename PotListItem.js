// @flow
import React from 'react';
import {Pot, statusText} from './Pot.js';
import { Text, View, TouchableHighlight, Image } from 'react-native';
import styles from './style.js';
import dispatcher from './AppDispatcher.js';


type PotListItemProps = {
  pot: Pot,
  onPress: () => void,
};

export default class PotListItem extends React.Component {
  onPress = () => {
    dispatcher.dispatch({type: 'page-edit-pot', pot: this.props.pot});
  }

  render() {
    const img = this.props.pot.images.length ?
      <Image source={{uri: this.props.pot.images[0]}} style={styles.listItemImg} /> : null;
    return (<TouchableHighlight onPress={this.props.onPress}>
      <View style={styles.listItem}>
        {img}
        <Text style={styles.listItemChild}>
          {this.props.pot.title} {statusText(this.props.pot.status)}
        </Text>
      </View>
    </TouchableHighlight>);
  }


}
