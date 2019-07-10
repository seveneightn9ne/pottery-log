import { Action } from '../action';
import { UIState } from './types';

export function getInitialState(): UIState {
  return { page: 'list', list: { collapsed: [], yInitial: 0, yCurrent: 0 } };
}

// TODO(jessk): Persist collapsed state

export function reduceUi(
  state: UIState = getInitialState(),
  action: Action,
): UIState {
  switch (action.type) {
    case 'page-new-pot':
      if (state.page !== 'list') {
        return state;
      }
      return {
        page: 'edit-pot',
        editPotId: action.potId,
        list: {
          ...state.list,
          yInitial: state.list.yCurrent,
        },
        new: true,
      };
    case 'pot-copy': {
      return {
        ...state,
        page: 'edit-pot',
        editPotId: action.newPotId,
        new: true,
      };
    }
    case 'page-edit-pot':
      return {
        page: 'edit-pot',
        editPotId: action.potId,
        list: {
          ...state.list,
          yInitial: state.list.yCurrent,
        },
        new: false,
      };
    case 'page-list':
    case 'pot-delete':
      return { page: 'list', list: { ...state.list } };
    case 'page-settings':
      return {
        page: 'settings',
        list: { ...state.list, yInitial: state.list.yCurrent },
        resumeImport: false,
      };
    case 'list-search-open':
      return {
        page: 'list',
        searching: true,
        list: {
          yCurrent: 0,
          yInitial: 0,
          collapsed: state.list.collapsed,
        },
      };
    case 'list-search-close':
      return {
        page: 'list',
        list: state.list,
      };
    case 'list-search-term':
      return {
        ...state,
        page: 'list',
        searching: true,
        searchTerm: action.text,
      };
    case 'list-collapse':
      if (state.list.collapsed.indexOf(action.section) !== -1) {
        return {
          ...state,
          list: {
            ...state.list,
            collapsed: state.list.collapsed.filter((i) => i !== action.section),
          },
        };
      }
      return {
        ...state,
        list: {
          ...state.list,
          collapsed: [...state.list.collapsed, action.section],
        },
      };
    case 'list-scroll':
      return { ...state, list: { ...state.list, yCurrent: action.y } };
    case 'page-image':
      if (state.page !== 'edit-pot') {
        return state;
      }
      return {
        page: 'image',
        editPotId: state.editPotId,
        imageId: action.imageId,
        list: state.list,
      };
    case 'image-delete-from-pot':
      if (state.page !== 'image') {
        return state;
      }
      return {
        page: 'edit-pot',
        list: state.list,
        editPotId: state.editPotId,
        new: false,
      };
    case 'import-resume': {
      return {
        page: 'settings',
        list: { ...state.list, yInitial: state.list.yCurrent },
        resumeImport: true,
      };
    }
    case 'import-resume-affirm': {
      return {
        page: 'settings',
        list: { ...state.list, yInitial: state.list.yCurrent },
        resumeImport: false,
      };
    }
    case 'import-resume-cancel':
      return { page: 'list', list: { ...state.list } };

    default:
      return state;
  }
}
