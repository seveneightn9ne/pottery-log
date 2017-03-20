// @flow
import {ReduceStore} from 'flux/utils';
import {Pot, PotStatus} from './Pot.js';
import dispatcher from './AppDispatcher.js';

interface UIState {
  page: string,
  editPotId: string,
}

class UIStore extends ReduceStore<UIState> {
  constructor() {
    super(dispatcher);
  }
  getInitialState(): UIState {
    return {page: 'list'}
  }

  reduce(state: UIState, action: Object): UIState {
    switch (action.type) {
      case 'page-new-pot':
      case 'page-edit-pot':
        return {page: 'edit-pot', editPotId: action.potId};
      default:
        return state;
    }
  }
}

export default new UIStore();
