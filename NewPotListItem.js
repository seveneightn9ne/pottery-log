// @flow
import React from 'react';
import {Pot} from './Pot.js';
import styles from './style.js';
import { Text, View, TouchableHighlight } from 'react-native';
import dispatcher from './AppDispatcher.js';


type PotListItemProps = {
  pot: Pot,
  onPress: () => void,
}
export default class NewPotListItem extends React.Component {
  render() {
    return (<TouchableHighlight onPress={this.props.onPress}>
    	<View style={styles.listItem}>
    		<Text style={styles.newPotButton}>+</Text><Text style={styles.listItemChild}> Add a pot</Text>
    	</View>
    </TouchableHighlight>);
  }
}
