import { Alert } from 'react-native';
import { Pot } from '../../models/Pot';
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
        dispatch({
          type: 'image-delete-from-pot',
          imageName: name,
          potId: currentPot.uuid,
        });
      },
    },
  ]);
}
