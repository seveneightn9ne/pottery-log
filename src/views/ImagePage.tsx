import React from 'react';
import ElevatedView from 'react-native-elevated-view';
import { Dimensions, Text, TouchableOpacity, View } from 'react-native';
import {Pot} from '../models/Pot';
import { ImageStore } from '../stores/ImageStore';
import styles from '../style';
import Image3 from './components/Image3';

interface ImagePageProps {
  image: string;
  pot: Pot;
  fontLoaded: boolean;
  onBack: (potId: string) => void;
  onSetMainImage: (potId: string, image: string) => void;
  onDeleteImage: (image: string) => void;
}

export default class ImagePage extends React.Component<ImagePageProps> {

  public render() {
    const {width} = Dimensions.get('window');
    const isMainImage = this.props.pot.images3[0] === this.props.image;
    const star = isMainImage ? 'star' : 'star_border';
    const backButton = this.props.fontLoaded ? (
      <TouchableOpacity onPress={this.onBack}>
        <Text style={styles.searchBack}>close</Text>
      </TouchableOpacity>
     ) : null;
    const starButton = this.props.fontLoaded ? (
      <TouchableOpacity onPress={this.onSetMainImage}>
        <Text style={styles.search}>{star}</Text>
      </TouchableOpacity>
     ) : null;
    const deleteButton = this.props.fontLoaded ? (
      <TouchableOpacity onPress={this.onDeleteImage}>
        <Text style={styles.search}>delete</Text>
      </TouchableOpacity>
     ) : null;
    const imageState = ImageStore.imageState(this.props.image);
    return (
    <View style={[styles.container, styles.imagePage]}>
      <ElevatedView style={styles.imageBar} elevation={4}>
        {backButton}
        <View style={{flexDirection: 'row', flex: 1, justifyContent: 'flex-end'}}>
          {starButton}
          {deleteButton}
        </View>
      </ElevatedView>
      <Image3 image={imageState} key={Image3.key(imageState)} style={{width, height: width}} />
    </View>
    );
  }

  private onBack = () => this.props.onBack(this.props.pot.uuid);

  private onSetMainImage = () => {
    this.props.onSetMainImage(this.props.pot.uuid, this.props.image);
  }

  private onDeleteImage = () => {
    this.props.onDeleteImage(this.props.image);
  }
}
