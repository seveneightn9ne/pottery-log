// @flow
import React from 'react';
import {Pot} from './Pot.js';
import styles from './style.js';
import { Text, View } from 'react-native';


type PotListItemProps = {
  pot: Pot,
}
export default class NewPotListItem extends React.Component {
	onPress() {
		console.log("Too bad.");
	}
  render() {
    return (<View style={styles.listItem} onPress={this.onPress}>
    	<Text style={styles.newPotButton}>+</Text><Text style={styles.listItemChild}> Add a pot</Text>
    </View>);
  }
}
