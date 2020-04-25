import React from 'react';
import { Dimensions, Image, Text, TouchableOpacity, View } from 'react-native';
import { Pot } from '../../models/Pot';
import { ImageState } from '../../reducers/types';
import style from '../../style';
import Image3 from './Image3';

interface PotListItemProps {
  pot: Pot;
  image: ImageState | null;
  fontLoaded: boolean;
  theme: 'dark' | 'light';
  onPress: () => void;
}

export default function(props: PotListItemProps) {
  const { width } = Dimensions.get('window');
  const size = { width: width / 2 - 6, height: width / 2 - 6 };
  const darkImage = (
    <Image
      source={require('../../../assets/coffee-dark.png')}
      style={{ width: 48, height: 48 }}
    />
  );
  const lightImage = (
    <Image
      source={require('../../../assets/coffee-light.png')}
      style={{ width: 48, height: 48 }}
    />
  );
  const img = props.image ? (
    <Image3 style={size} image={props.image} />
  ) : (
    <View style={[style.s.liImagePlaceholder, size]}>
      {props.theme === 'dark' ? darkImage : lightImage}
    </View>
  );
  const old =
    props.fontLoaded && props.pot.status.isOld() ? (
      <Text style={style.s.old}>alarm</Text>
    ) : null;
  return (
    <TouchableOpacity onPress={props.onPress}>
      <View style={[style.s.listItem, size]}>
        {img}
        <View style={[style.s.listItemBar, { width: size.width }]}>
          <Text style={style.s.lititle}>{props.pot.title}</Text>
          {old}
          <Text style={style.s.lisubtitle}>{props.pot.status.text()}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}
