import React from 'react';
import {Pot} from '../../models/Pot';
import Image3 from './Image3';
import { Dimensions, Text, View, TouchableOpacity, Image } from 'react-native';
import styles from '../../style';
import dispatcher from '../../AppDispatcher';
import {nameToImageState} from '../../stores/ImageStore';

type PotListItemProps = {
  pot: Pot,
  fontLoaded: boolean
  onPress: () => void,
};

export default class PotListItem extends React.Component<PotListItemProps, {}> {
  onPress = () => {
    dispatcher.dispatch({type: 'page-edit-pot', potId: this.props.pot.uuid});
  }

  render() {
    const { width } = Dimensions.get('window');
    const imgstate = this.props.pot.images3.length ?
      nameToImageState(this.props.pot.images3[0]) : null;
    const size = {width: width/2-6, height: width/2-6};
    const img = this.props.pot.images3.length ?
      <Image3 image={imgstate} style={size} key={Image3.key(imgstate)} /> :
      <View style={[styles.liImagePlaceholder, size]}>
      	  <Image source={require('../../../assets/coffee.png')}
	    style={{width: 48, height: 48}} />
      </View>;
    const old = this.props.fontLoaded && this.props.pot.status.isOld() ?
    	  <Text style={styles.old}>alarm</Text> : null;
    return (<TouchableOpacity onPress={this.props.onPress}>
      <View style={[styles.listItem, size]}>
        {img}
        <View style={[styles.listItemBar, {width: size.width}]}>
          <Text style={styles.lititle}>{this.props.pot.title}</Text>
	{old}
	  <Text style={styles.lisubtitle}>
            {this.props.pot.status.text()}
	  </Text>
        </View>
      </View>
    </TouchableOpacity>);
  }
}
