import Notes from './models/Notes';
import { Image2, Pot } from './models/Pot';
import Status from './models/Status';

export interface ImageState {
    name: string;
    // localUri and remoteUri are deprecated
    // they will be converted to a fileUri
    localUri?: string;
    remoteUri?: string;
    fileUri?: string;
    pots: string[];
  }

export type Action = PotAction | ImageAction | UiAction | ImportAction | ExportAction | Reload;

type ImageAction = (
    ImageStateLoaded
    | ImageLoaded
    | ImageAdd
    | ImageDeleteFromPot
    | ImageDeleteAllFromPot
    | ImageErrorRemote
    | ImageErrorLocal
    | ImageRemoteFailed
    | ImageFileCreated
    | ImageFileFailed
);

type PotAction = (
    Loaded
    | MigrateFromImages2
    | New
    | PotEditNote
    | PotEditTitle
    | PotEditImages3
    | PotEditStatus
    | PotDelete
    | PotCopy
);

type UiAction = (
    PageNewPot
    | PageList
    | PageEditPot
    | PageSettings
    | ListSearchOpen
    | ListSearchClose
    | ListSearchTerm
    | ListCollapse
    | ListScroll
    | PageImage
);

type ImportAction = (
    ImportInitiate
    | ImportStarted
    | ImportedMetadata
    | ImageTimeout
    | ImportCancel
    | ImportFailure
);

type ExportAction = (
    ExportInitiate
    | ExportStarted
    | ExportImage
    | ExportFinished
    | ExportFailure
);

interface MigrateFromImages2 {
    type: 'migrate-from-images2';
    images2: Image2[];
    potId: string;
}

interface Loaded {
    type: 'loaded';
    pots: {[uuid: string]: Pot};
    potIds: string[];
    isImport: boolean;
}

interface New {
    type: 'new';
}

interface PageNewPot {
    type: 'page-new-pot';
    potId: string;
}

interface PotEditField {
    type: 'pot-edit-field';
    potId: string;
    field: string;
    value: any;
}

interface PotEditNote extends PotEditField {
    field: 'notes2';
    value: Notes;
}

interface PotEditTitle extends PotEditField {
    field: 'title';
    value: string;
}

interface PotEditImages3 extends PotEditField {
    field: 'images3';
    value: string[];
}

interface PotEditStatus extends PotEditField {
    field: 'status';
    value: Status;
}

interface PotDelete {
    type: 'pot-delete';
    potId: string;
}

interface PageList {
    type: 'page-list';
}

interface PotCopy {
    type: 'pot-copy';
    potId: string;
    imageNames: string[];
}

interface ImageStateLoaded {
    type: 'image-state-loaded';
    isImport: boolean;
    images: {[name: string]: ImageState};
}

interface Reload {
    type: 'reload';
}

interface ImportedMetadata {
    type: 'imported-metadata';
}

interface ImageDeleteFromPot {
    type: 'image-delete-from-pot';
    imageName: string;
    potId: string;
}

interface ImageDeleteAllFromPot {
    type: 'image-delete-all-from-pot';
    potId: string;
    imageNames: string[];
}

interface ImageAdd {
    type: 'image-add';
    potId: string;
    localUri: string;
}

interface ImageErrorRemote {
    type: 'image-error-remote';
    name: string;
}

interface ImageErrorLocal {
    type: 'image-error-local';
    name: string;
}

interface ImageRemoteFailed {
    type: 'image-remote-failed';
    name: string;
}

interface ImageLoaded {
    type: 'image-loaded';
    name: string;
}

interface ImageFileCreated {
    type: 'image-file-created';
    name: string;
    fileUri: string;
}

interface ImageFileFailed {
    type: 'image-file-failed';
    uri: string;
}

interface ImportInitiate {
    type: 'import-initiate';
}

interface ImportStarted {
    type: 'import-started';
    metadata: string;
    imageMap: {[name: string]: string};
}

interface ImageTimeout {
    type: 'image-timeout';
    uri: string;
}

interface ImportCancel {
    type: 'import-cancel';
}

interface ImportFailure {
    type: 'import-failure';
    error: string | Error;
}

interface ExportInitiate {
    type: 'export-initiate';
}

interface ExportStarted {
    type: 'export-started';
    exportId: number;
}

interface ExportImage {
    type: 'export-image';
    exportId: number;
    uri: string;
}

interface ExportFinished {
    type: 'export-finished';
    exportId: number;
    uri: string;
}

interface ExportFailure {
    type: 'export-failure';
    exportId: number;
    error: string | Error;
}

interface PageEditPot {
    type: 'page-edit-pot';
    potId: string;
}

interface PageSettings {
    type: 'page-settings';
}

interface ListSearchOpen {
    type: 'list-search-open';
}

interface ListSearchClose {
    type: 'list-search-close';
}

interface ListSearchTerm {
    type: 'list-search-term';
    text: string;
}

interface ListCollapse {
    type: 'list-collapse';
    section: string;
}

interface ListScroll {
    type: 'list-scroll';
    y: number;
}

interface PageImage {
    type: 'page-image';
    imageId: string;
}
