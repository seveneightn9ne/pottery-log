import React from 'react';
import { Text, View, Dimensions, TouchableOpacity } from 'react-native';
import styles from '../style'
import Image3 from './components/Image3';
import {nameToImageState} from '../stores/ImageStore';
import {Pot} from '../models/Pot';

type ImagePageProps = {
  image: string,
  pot: Pot,
  fontLoaded: boolean,
  onBack: (potId: string) => void,
  onSetMainImage: (potId: string, image: string) => void,
  onDeleteImage: (image: string) => void,
};

export default class ImagePage extends React.Component<ImagePageProps> {
  render() {
    const {width} = Dimensions.get('window');
    const isMainImage = this.props.pot.images3[0] == this.props.image;
    const star = isMainImage ? 'star' : 'star_border';
    const backButton = this.props.fontLoaded ?
      <TouchableOpacity onPress={() => this.props.onBack(this.props.pot.uuid)}>
        <Text style={styles.searchBack}>close</Text>
      </TouchableOpacity> : null;
    const starButton = this.props.fontLoaded ?
      <TouchableOpacity onPress={() =>
      	  this.props.onSetMainImage(this.props.pot.uuid, this.props.image)}>
        <Text style={styles.search}>{star}</Text>
      </TouchableOpacity> : null;
    const deleteButton = this.props.fontLoaded ?
      <TouchableOpacity onPress={() => this.props.onDeleteImage(this.props.image)}>
        <Text style={styles.search}>delete</Text>
      </TouchableOpacity> : null;
    const imageState = nameToImageState(this.props.image);
    return <View style={[styles.container, {
      justifyContent: 'center',
      backgroundColor: '#000',
    }]}>
      <View style={styles.imageBar}>
        {backButton}
        <View style={{flexDirection: 'row', flex: 1, justifyContent: 'flex-end'}}>
          {starButton}
          {deleteButton}
        </View>
      </View>
      <Image3 image={imageState} key={Image3.key(imageState)} style={{width: width, height: width}} />
    </View>;
  }
}
