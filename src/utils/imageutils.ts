
import { FileSystem } from 'expo';
import _ from 'lodash';
import dispatcher from '../AppDispatcher';

export function saveToFile(uri: string, isRemote = false, isRetry = false): Promise<void> {
    // console.log("Will save " + uri);
    const onError = (e: Error | string) => {
        console.warn('saveToFile failure:', e);
        dispatcher.dispatch({type: 'image-file-failed', uri});
    };
    if (!uri) {
        console.warn('No URI passed to saveToFile');
        setTimeout(onError, 0);
        return Promise.resolve();
    }
    const name = nameFromUri(uri);
    const random = Math.floor((Math.random() * 1000000) + 1);
    const dir = FileSystem.documentDirectory + random;
    return FileSystem.makeDirectoryAsync(dir, {intermediates: true}).catch(() => {
        return FileSystem.getInfoAsync(dir).then((result) => {
        if (!result.exists) {
            return Promise.reject('The directory was not created: ' + dir);
        }
        // makeDirectoryAsync errored but the directory exists, so we can continue.
        return Promise.resolve();
        });
    }).then(() => {
        const fileUri = dir + '/' + name;
        const afterCopy = () => {
            // console.log("saveToFile SUCCESS on " + name);
            dispatcher.dispatch({
                type: 'image-file-created',
                name, fileUri,
            });
        };
        if (isRemote) {
            // console.log("saveToFile starting " + name);
            return FileSystem.downloadAsync(uri, fileUri).then(afterCopy).catch(onError);
        } else {
            // console.log("Will copyAsync");
            return FileSystem.copyAsync({from: uri, to: fileUri}).then(afterCopy).catch(onError);
        }
        // console.log("Save of " + uri + " initiated.");
    }).catch(onError);
}

export function deleteFile(uri: string) {
    FileSystem.deleteAsync(uri, {idempotent: true});
}

export function nameFromUri(uri: string): string {
  const uriParts = uri.split('/');
  return uriParts[uriParts.length - 1];
}
