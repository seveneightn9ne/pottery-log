import { Alert } from 'react-native';
import { Pot } from '../../models/Pot';
import { deleteImage as deleteImageThunk } from '../../thunks/images';
import { PLThunkDispatch } from '../../thunks/types';

export function deleteImage(
  dispatch: PLThunkDispatch,
  currentPot: Pot,
  name: string,
) {
  Alert.alert('Delete this image?', undefined, [
    { text: 'Cancel', style: 'cancel' },
    {
      text: 'Delete',
      onPress: () => {
        dispatch({
          type: 'pot-edit-field',
          field: 'images3',
          value: currentPot.images3.filter((i) => i !== name),
          potId: currentPot.uuid,
        });
        dispatch(deleteImageThunk(name, currentPot));
      },
    },
  ]);
}
