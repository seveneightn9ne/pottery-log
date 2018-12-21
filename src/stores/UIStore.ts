// @flow
import {ReduceStore} from 'flux/utils';
import dispatcher from '../AppDispatcher';

interface UIState {
  page: string,
  editPotId: string,
}

class UIStore extends ReduceStore<UIState> {
  constructor() {
    super(dispatcher);
  }
  getInitialState(): UIState {
    return {page: 'list', collapsed: [], yInitial: 0, yCurrent: 0, scrollEnabled: true}
  }

  // TODO(jessk): Persist collapsed state

  reduce(state: UIState, action: Object): UIState {
    const collapsed = [...state.collapsed];
    switch (action.type) {
      case 'page-new-pot':
        return {...state,
            page: 'edit-pot',
            editPotId: action.potId,
            yInitial: state.yCurrent,
            new: true,
        };
      case 'page-edit-pot':
        return {...state,
            page: 'edit-pot',
            editPotId: action.potId,
            yInitial: state.yCurrent,
            new: false,
        };
      case 'page-list':
        console.log("Navigate to list");
        return {...state, page: 'list'}
      case 'page-settings':
        console.log("Navigate to settings");
        return {...state, page: 'settings', yInitial: state.yCurrent}
      case 'list-search-open':
      	console.log("Opened search");
        return {...state, page: 'list', searching: true, yCurrent: 0, yInitial: 0};
      case 'list-search-close':
        return {...state, page: 'list', searching: false, searchTerm: ''};
      case 'list-search-term':
      	return {...state, page: 'list', searching: true, searchTerm: action.text};
      case 'list-collapse':
      	console.log("toggle collapse on " + action.section);
      	console.log(state.collapsed);
        if (state.collapsed.indexOf(action.section) != -1) {
          return {...state, collapsed: collapsed.filter(i => i != action.section)};
        }
        return {...state, collapsed: [...collapsed, action.section]};
      case 'list-scroll':
      	if (state.scrollEnabled) {
      	  return {...state, yCurrent: action.y};
	}
      case 'list-scroll-disable':
	return {...state, scrollEnabled: false};
      case 'list-scroll-enable':
	return {...state, scrollEnabled: true};
      case 'page-image':
      	return {...state, page: 'image', imageId: action.imageId};
      case 'image-delete-from-pot':
      	return {...state, page: 'edit-pot'};
      case 'reload':
        return this.getInitialState();

      default:
        return state;
    }
  }
}

export default new UIStore();