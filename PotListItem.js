// @flow
import React from 'react';
import {Pot} from './Pot.js';
import { Text, View, TouchableHighlight } from 'react-native';
import styles from './style.js';
import dispatcher from './AppDispatcher.js';


type PotListItemProps = {
  pot: Pot,
  onPress: () => void,
}
export default class PotListItem extends React.Component {
  onPress = () => {
    dispatcher.dispatch({type: 'page-edit-pot', pot: this.props.pot});
  }

  render() {
    return (<TouchableHighlight onPress={this.props.onPress}>
      <View style={styles.listItem}>
        <Text style={styles.listItemChild}>{this.props.pot.title}: {this.props.pot.uuid} thrown on {this.props.pot.status.thrown}</Text>
      </View>
    </TouchableHighlight>);
  }
}
