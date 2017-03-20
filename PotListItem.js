// @flow
import React from 'react';
import {Pot} from './Pot.js';
import { Text, View } from 'react-native';


type PotListItemProps = {
  pot: Pot,
}
export default class PotListItem extends React.Component {
  onPress() {
    console.log("Too bad.");
  }

  render() {
    return (<View style={styles.listItem} onPress={this.onPress}>
      <Text style={styles.listItemChild}>{this.props.pot.title}: {this.props.pot.uuid} thrown on {this.props.pot.status.thrown}</Text>
    </View>);
  }
}
