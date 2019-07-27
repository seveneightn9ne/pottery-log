import React from 'react';
import { Dimensions, Text, TouchableOpacity, View } from 'react-native';
import ElevatedView from 'react-native-elevated-view';
import { connect } from 'react-redux';
import { Pot } from '../models/Pot';
import { FullState, ImageState } from '../reducers/types';
import styles from '../style';
import { PLThunkDispatch } from '../thunks/types';
import { deleteImage } from './components/Alerts';
import Image3 from './components/Image3';

interface OwnProps {
  image: ImageState;
  fontLoaded: boolean;
}

const mapDispatchToProps = (dispatch: PLThunkDispatch, ownProps: OwnProps) => ({
  onBack: (potId: string) =>
    dispatch({
      type: 'page-edit-pot',
      potId,
    }),

  onSetMainImage: (currentPot: Pot) =>
    dispatch({
      type: 'pot-edit-field',
      field: 'images3',
      value: [
        ownProps.image.name,
        ...currentPot.images3.filter((i) => i !== ownProps.image.name),
      ],
      potId: currentPot.uuid,
    }),

  onDeleteImage: (currentPot: Pot) =>
    deleteImage(dispatch, currentPot, ownProps.image.name),
});

type PropsFromDispatch = ReturnType<typeof mapDispatchToProps>;

const mapStateToProps = (state: FullState) => {
  const potId =
    state.ui.page === 'image' ? state.ui.editPotId : (undefined as never);
  const pot = state.pots.pots[potId];
  return { pot };
};

type PropsFromState = ReturnType<typeof mapStateToProps>;

const mergeProps = (
  stateProps: PropsFromState,
  dispatchProps: PropsFromDispatch,
  ownProps: OwnProps,
) => ({
  ...dispatchProps,
  ...stateProps,
  ...ownProps,
  onBack: () => dispatchProps.onBack(stateProps.pot.uuid),
  onSetMainImage: () => dispatchProps.onSetMainImage(stateProps.pot),
  onDeleteImage: () => dispatchProps.onDeleteImage(stateProps.pot),
});

type ImagePageProps = ReturnType<typeof mergeProps>;

class ImagePage extends React.Component<ImagePageProps> {
  public render() {
    const { width } = Dimensions.get('window');
    const isMainImage = this.props.pot.images3[0] === this.props.image.name;
    const star = isMainImage ? 'star' : 'star_border';
    const backButton = this.props.fontLoaded ? (
      <TouchableOpacity onPress={this.props.onBack}>
        <Text style={styles.searchBack}>close</Text>
      </TouchableOpacity>
    ) : null;
    const starButton = this.props.fontLoaded ? (
      <TouchableOpacity onPress={this.props.onSetMainImage}>
        <Text style={styles.search}>{star}</Text>
      </TouchableOpacity>
    ) : null;
    const deleteButton = this.props.fontLoaded ? (
      <TouchableOpacity onPress={this.props.onDeleteImage}>
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
        <Image3 style={{ width, height: width }} image={this.props.image} />
      </View>
    );
  }
}

// connect<PropsFromState, PropsFromDispatch, OwnProps, ImagePageProps, FullState>(
export default connect(
  mapStateToProps,
  mapDispatchToProps,
  mergeProps,
)(ImagePage);
