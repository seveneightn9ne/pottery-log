import React from 'react';
import { Dimensions, Text, TouchableOpacity, View } from 'react-native';
import ElevatedView from 'react-native-elevated-view';
import { Pot } from '../models/Pot';
import { ImageState } from '../reducers/types';
import styles from '../style';
import Image3 from './components/Image3';

interface ImagePageProps {
  image: ImageState;
  pot: Pot;
  fontLoaded: boolean;
  onBack: (potId: string) => void;
  onSetMainImage: (currentPot: Pot, image: string) => void;
  onDeleteImage: (currentPot: Pot, image: string) => void;
  onImageLoad: (name: string) => void;
  onImageLoadFailure: (
    nameOrUri: string,
    type: 'local' | 'file' | 'remote',
  ) => void;
  onResetImageLoad: (oldUri: string, newUri: string) => void;
}

export default class ImagePage extends React.Component<ImagePageProps> {
  public render() {
    const { width } = Dimensions.get('window');
    const isMainImage = this.props.pot.images3[0] === this.props.image.name;
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
    return (
      <View style={[styles.container, styles.imagePage]}>
        <ElevatedView style={styles.imageBar} elevation={4}>
          {backButton}
          <View
            style={{
              flexDirection: 'row',
              flex: 1,
              justifyContent: 'flex-end',
            }}
          >
            {starButton}
            {deleteButton}
          </View>
        </ElevatedView>
        <Image3
          key={Image3.key(this.props.image)}
          style={{ width, height: width }}
          {...this.props}
        />
      </View>
    );
  }

  private onBack = () => this.props.onBack(this.props.pot.uuid);

  private onSetMainImage = () => {
    this.props.onSetMainImage(this.props.pot, this.props.image.name);
  }

  private onDeleteImage = () => {
    this.props.onDeleteImage(this.props.pot, this.props.image.name);
  }
}
