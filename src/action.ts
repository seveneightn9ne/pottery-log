import { Pot } from './models/Pot';


export interface ImageState {
    name: string,
    // localUri and remoteUri are deprecated
    // they will be converted to a fileUri
    localUri?: string,
    remoteUri?: string,
    fileUri?: string,
    pots: string[],
  }

export type Action = (
    MigrateFromImages2
    | Loaded
    | New
    | PageNewPot
    | PotEditField
    | PotDelete
    | PageList
    | PotCopy
    | ImageStateLoaded
    | Reload
    | ImportedMetadata
    | ImageDeleteFromPot
    | ImageDeleteAllFromPot
    | ImageAdd
    | ImageErrorRemote
    | ImageErrorLocal
    | ImageRemoteFailed
    | ImageLoaded
    | ImageFileCreated
    | ImageFileFailed
);

interface MigrateFromImages2 {
    type: 'migrate-from-images2';
    images2: any[]; // TODO
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
    value: any; // TODO
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
