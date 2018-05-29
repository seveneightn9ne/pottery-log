// @flow
import React from 'react';
import { StyleSheet, Text, View, ScrollView, TextInput, TouchableHighlight, Image, Dimensions, Picker, Button, TouchableOpacity } from 'react-native';
import styles from '../style.js'
import Image3 from './components/Image3.js';
import {nameToImageState} from '../stores/ImageStore.js';

type ImagePageProps = {
  image: string,
};

export default class ImagePage extends React.Component {
  render() {
    const {height, width} = Dimensions.get('window');
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
      <Image3 image={nameToImageState(this.props.image)} style={{width: width, height: width}} />
    </View>;
  }
}
