// @flow
import {ReduceStore} from 'flux/utils';
import dispatcher from '../AppDispatcher.js';

interface UIState {
  page: string,
  editPotId: string,
}

class UIStore extends ReduceStore<UIState> {
  constructor() {
    super(dispatcher);
  }
  getInitialState(): UIState {
    return {page: 'list', collapsed: []}
  }

  // TODO(jessk): Persist collapsed state

  reduce(state: UIState, action: Object): UIState {
    const collapsed = [...state.collapsed];
    switch (action.type) {
      case 'page-new-pot':
      case 'page-edit-pot':
        return {page: 'edit-pot', editPotId: action.potId, collapsed};
      case 'page-list':
        console.log("Navigate to list");
        return {page: 'list', collapsed}
      case 'page-settings':
        console.log("Navigate to settings");
        return {page: 'settings', collapsed}
      case 'list-search-open':
      	console.log("Opened search");
        return {page: 'list', searching: true, collapsed};
      case 'list-search-close':
        return {page: 'list', searching: false, searchTerm: '', collapsed};
      case 'list-search-term':
      	return {page: 'list', searching: true, searchTerm: action.text, collapsed};
      case 'list-collapse':
        if (state.collapsed.indexOf(action.section) != -1) {
          return {...state, collapsed: collapsed.filter(i => i != action.section)};
        }
        return {...state, collapsed: [...collapsed, action.section]};
      case 'reload':
        return this.getInitialState();

      default:
        return state;
    }
  }
}

export default new UIStore();
