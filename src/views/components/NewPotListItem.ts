// @flow
import React from 'react';
import {Pot} from '../../models/Pot';
import styles from '../../style';
import { Text, View, TouchableHighlight } from 'react-native';

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
