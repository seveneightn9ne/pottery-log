import Notes from './models/Notes';
import { Image2, Pot } from './models/Pot';
import Status from './models/Status';
import { ImportStatePersisted, ImageState } from './reducers/types';


export type Action = PotAction | ImageAction | UiAction | ImportAction | ExportAction | Reload;

type ImageAction = (
    ImageStateLoaded
    | ImageLoaded
    | ImageAdd
    | ImageDeleteFromPot
    | ImageErrorRemote
    | ImageErrorLocal
    | ImageErrorFile
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
    | ImportInitiateUrl
    | ImportStarted
    | ImportedMetadata
    | ImportMetadataAgain
    | ImageTimeout
    | ImportCancel
    | ImportFailure
    | ImportResume
    | ImportResumeAffirm
    | ImportResumeCancel
);

type ExportAction = (
    ExportInitiate
    | ExportStarted
    | ExportImage
    | ExportImageFailure
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
    pots: { [uuid: string]: Pot };
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
    imageNames: string[];
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
    images: { [name: string]: ImageState };
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

interface ImageErrorFile {
    type: 'image-error-file';
    uri: string;
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

interface ImportInitiateUrl {
    type: 'import-initiate-url';
    url: string;
}

interface ImportStarted {
    type: 'import-started';
    metadata: string;
    imageMap: { [name: string]: string };
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

interface ImportMetadataAgain {
    type: 'import-metadata-again';
    metadata: string;
}

interface ImportResume {
    type: 'import-resume';
    data: ImportStatePersisted;
}

interface ImportResumeAffirm {
    type: 'import-resume-affirm';
}

interface ImportResumeCancel {
    type: 'import-resume-cancel';
}

interface ExportInitiate {
    type: 'export-initiate';
}

interface ExportStarted {
    type: 'export-started';
    exportId: number;
    images: { [name: string]: ImageState };
}

interface ExportImage {
    type: 'export-image';
    exportId: number;
    uri: string;
}

interface ExportImageFailure {
    type: 'export-image-failure';
    exportId: number;
    uri: string;
    reason: string;
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
