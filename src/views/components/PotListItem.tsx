import React from 'react';
import { Dimensions, Image, Text, TouchableOpacity, View } from 'react-native';
import { Pot } from '../../models/Pot';
import { ImageState } from '../../reducers/types';
import styles from '../../style';
import Image3 from './Image3';

interface PotListItemProps {
  pot: Pot;
  image: ImageState | null;
  fontLoaded: boolean;
  onPress: () => void;
  onImageLoad: (name: string) => void;
  onImageLoadFailure: (
    nameOrUri: string,
    type: 'local' | 'file' | 'remote',
  ) => void;
  onResetImageLoad: (oldUri: string, newUri: string) => void;
}

export default function(props: PotListItemProps) {
  const { width } = Dimensions.get('window');
  const size = { width: width / 2 - 6, height: width / 2 - 6 };
  const img = props.image ? (
    <Image3 style={size} key={Image3.key(props.image)} {...props} />
  ) : (
    <View style={[styles.liImagePlaceholder, size]}>
      <Image
        source={require('../../../assets/coffee.png')}
        style={{ width: 48, height: 48 }}
      />
    </View>
  );
  const old =
    props.fontLoaded && props.pot.status.isOld() ? (
      <Text style={styles.old}>alarm</Text>
    ) : null;
  return (
    <TouchableOpacity onPress={props.onPress}>
      <View style={[styles.listItem, size]}>
        {img}
        <View style={[styles.listItemBar, { width: size.width }]}>
          <Text style={styles.lititle}>{props.pot.title}</Text>
          {old}
          <Text style={styles.lisubtitle}>{props.pot.status.text()}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}
