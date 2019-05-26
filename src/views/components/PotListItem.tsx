import React from 'react';
import { Dimensions, Image, Text, TouchableOpacity, View } from 'react-native';
import {Pot} from '../../models/Pot';
import { ImageStore, getImageState } from '../../stores/ImageStore';
import styles from '../../style';
import Image3 from './Image3';

interface PotListItemProps {
  pot: Pot;
  fontLoaded: boolean;
  onPress: () => void;
}

export default function(props: PotListItemProps) {
  const { width } = Dimensions.get('window');
  const imgstate = props.pot.images3.length ?
    getImageState(ImageStore.getState(), props.pot.images3[0]) : null;
  const size = {width: width / 2 - 6, height: width / 2 - 6};
  const img = props.pot.images3.length ?
    <Image3 image={imgstate} style={size} key={Image3.key(imgstate)} /> : (
    <View style={[styles.liImagePlaceholder, size]}>
      <Image source={require('../../../assets/coffee.png')} style={{width: 48, height: 48}} />
    </View>);
  const old = props.fontLoaded && props.pot.status.isOld() ?
    <Text style={styles.old}>alarm</Text> : null;
  return (
  <TouchableOpacity onPress={props.onPress}>
    <View style={[styles.listItem, size]}>
      {img}
      <View style={[styles.listItemBar, {width: size.width}]}>
        <Text style={styles.lititle}>{props.pot.title}</Text>
        {old}
        <Text style={styles.lisubtitle}>{props.pot.status.text()}</Text>
      </View>
    </View>
  </TouchableOpacity>);
}
