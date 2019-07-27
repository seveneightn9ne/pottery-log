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

const mapStateToProps = (state: FullState, ownProps: OwnProps) => {
  const potId =
    state.ui.page === 'image' ? state.ui.editPotId : (undefined as never);
  const pot = state.pots.pots[potId];
  const isMainImage = pot.images3[0] === ownProps.image.name;
  return { isMainImage, pot };
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

const ImagePage: React.FunctionComponent<ImagePageProps> = (props) => {
  const { width } = Dimensions.get('window');
  const star = props.isMainImage ? 'star' : 'star_border';
  const backButton = props.fontLoaded ? (
    <TouchableOpacity onPress={props.onBack}>
      <Text style={styles.searchBack}>close</Text>
    </TouchableOpacity>
  ) : null;
  const starButton = props.fontLoaded ? (
    <TouchableOpacity onPress={props.onSetMainImage}>
      <Text style={styles.search}>{star}</Text>
    </TouchableOpacity>
  ) : null;
  const deleteButton = props.fontLoaded ? (
    <TouchableOpacity onPress={props.onDeleteImage}>
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
      <Image3 style={{ width, height: width }} image={props.image} />
    </View>
  );
};

// connect<PropsFromState, PropsFromDispatch, OwnProps, ImagePageProps, FullState>(
export default connect(
  mapStateToProps,
  mapDispatchToProps,
  mergeProps,
)(ImagePage);
