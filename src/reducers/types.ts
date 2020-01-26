import { Pot } from '../models/Pot';

export interface FullState {
  pots: PotsStoreState;
  images: ImageStoreState;
  ui: UIState;
  exports: ExportState;
  imports: ImportState;
  settings: SettingsState;
}

//
// PotsStoreState
//

export interface PotsStoreState {
  potIds: string[];
  pots: { [uuid: string]: Pot };
  hasLoaded: boolean;
  // imagesLoaded?: { [name: string]: ImageState };
}

//
// ExportState
//

export type ExportState =
  | PreExportingState
  | StartExportingState
  | ExportingImagesState
  | PostExportingState;

interface PreExportingState {
  exporting: false;
  statusMessage?: string;
}

interface StartExportingState {
  exporting: true;
  exportId: number;
  statusMessage: string;
}

interface ExportingImagesState {
  exporting: true;
  exportId: number;
  exportingImages: true;
  // awaitingFile?: number,
  imagesExported: number;
  totalImages: number;
  statusMessage: string;
}

interface PostExportingState {
  exporting: false;
  exportUri: string;
  statusMessage: string;
}

//
// ImageStoreState
//

export interface ImageStoreState {
  images: { [name: string]: ImageState };
  loaded: boolean;
}

export interface ImageState {
  name: string;
  // localUri and remoteUri are deprecated
  // they will be converted to a fileUri
  localUri?: string;
  remoteUri?: string;
  fileUri?: string;
  pots: string[];
}

//
// ImportState
//

export interface ImageMapValue {
  uri: string;
  started?: true;
}
export interface ImageMapState {
  [name: string]: ImageMapValue;
}
export interface ImportStatePersisted {
  importing: boolean;
  totalImages?: number;
  statusMessage?: string;
  imageMap?: ImageMapState;
  imagesImported?: number;
}
export interface ImportState extends ImportStatePersisted {
  resumable?: ImportStatePersisted;
}

//
// UIState
//

export type UIState =
  | ListUiState
  | SearchingUiState
  | EditUiState
  | ImageUiState
  | SettingsUiState;

interface BaseUiState {
  page: string;
  list: {
    collapsed: string[];
    yInitial: number;
    yCurrent: number;
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

// Settings state

export interface SettingsState {
  darkMode?: boolean;
}
