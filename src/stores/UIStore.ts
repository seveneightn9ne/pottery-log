import { Action } from '../action';
import makeFluxStore from './makeFluxStore';

export type UIState = ListUiState | SearchingUiState | EditUiState | ImageUiState | SettingsUiState;

interface BaseUiState {
  page: string;
  list: {
    collapsed: string[],
    yInitial: number,
    yCurrent: number,
  };
}

export interface ListUiState extends BaseUiState {
  page: 'list';
}

export interface SearchingUiState extends ListUiState {
  searching: true;
  searchTerm: string;
}

export interface EditUiState extends BaseUiState {
  page: 'edit-pot';
  editPotId: string;
  new: boolean;
}

export interface ImageUiState extends BaseUiState {
  page: 'image';
  editPotId: string;
  imageId: string;
}

export interface SettingsUiState extends BaseUiState {
  page: 'settings';
  resumeImport: boolean;
}

function getInitialState(): UIState {
  return {page: 'list', list: {collapsed: [], yInitial: 0, yCurrent: 0}};
}

// TODO(jessk): Persist collapsed state

function reduce(state: UIState, action: Action): UIState {
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
      return {page: 'list', list: {...state.list}};
    case 'page-settings':
      return {
        page: 'settings',
        list: {...state.list,  yInitial: state.list.yCurrent},
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
      return {...state, page: 'list', searching: true, searchTerm: action.text};
    case 'list-collapse':
      if (state.list.collapsed.indexOf(action.section) !== -1) {
        return {...state, list: {...state.list,
                                  collapsed: state.list.collapsed.filter((i) => i !== action.section)}};
      }
      return {...state, list: {...state.list,
                                collapsed: [...state.list.collapsed, action.section]}};
    case 'list-scroll':
      return {...state, list: {...state.list, yCurrent: action.y}};
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
        list: {...state.list,  yInitial: state.list.yCurrent},
        resumeImport: true,
      };
    }
    case 'import-resume-affirm': {
      return {
        page: 'settings',
        list: {...state.list,  yInitial: state.list.yCurrent},
        resumeImport: false,
      }
    }
    case 'import-resume-cancel':
      return {page: 'list', list: {...state.list}};
    case 'reload':
      return getInitialState();

    default:
      return state;
  }
}

export default makeFluxStore(getInitialState, reduce);
