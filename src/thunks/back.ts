import { Alert } from 'react-native';
import { ThunkAction } from 'redux-thunk';
import { Action } from '../action';
import { FullState } from '../reducers/types';

export function handleBackButton(): ThunkAction<
  boolean,
  FullState,
  undefined,
  Action
> {
  return (dispatch, getState) => {
    const { ui, exports } = getState();
    if (ui.page === 'list') {
      if ('searching' in ui) {
        dispatch({
          type: 'list-search-close',
        });
        return true;
      }
      return false;
    }
    if (ui.page === 'image') {
      dispatch({
        type: 'page-edit-pot',
        potId: ui.editPotId,
      });
      return true;
    }
    if (exports.exporting && !('exportUri' in exports)) {
      Alert.alert('Cancel this export?', undefined, [
        { text: 'Stay here', style: 'cancel' },
        { text: 'Cancel', onPress: () => dispatch({ type: 'page-list' }) },
      ]);
      return true;
    }
    dispatch({
      type: 'page-list',
    });
    return true;
  };
}
