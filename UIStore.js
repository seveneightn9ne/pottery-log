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
      case 'page-list':
        console.log("Navigate to list");
        return {page: 'list'}
      case 'list-search-open':
      	console.log("Opened search");
        return {page: 'list', searching: true};
      case 'list-search-close':
        return {page: 'list', searching: false, searchTerm: ''};
      case 'list-search-term':
      	return {page: 'list', searching: true, searchTerm: action.text};
      default:
        return state;
    }
  }
}

export default new UIStore();
