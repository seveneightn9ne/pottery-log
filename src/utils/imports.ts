import { Alert, AsyncStorage } from 'react-native';
import { FullState } from '../reducers/types';
import {keyIsExportable} from './exports';
import { nameFromUri, saveToFilePure } from './imageutils';

const IMAGE_TIMEOUT_MS = 30000;

const keyIsImportable = keyIsExportable;

export async function confirmImport<A, B>(onConfirm: () => Promise<A>, onCancel: () => Promise<B>): Promise<A | B> {
  return new Promise((resolve, reject) => {
    Alert.alert(
        'Ready to import. This will erase any existing data. Are you sure?',
        undefined,
        [
          {
            text: 'Nevermind',
            style: 'cancel',
            onPress: () => {
                try {
                    resolve(onCancel());
                } catch (e) {
                    reject(e);
                }
            },
          },
          {
            text: 'Continue',
            onPress: () => {
                try {
                    resolve(onConfirm());
                } catch (e) {
                    reject(e);
                }
            },
          },
        ],
        { cancelable: false },
      );
  });
}

export async function importMetadataNow(metadata: string) {
    const existingKeys = await AsyncStorage.getAllKeys();
    for (const existingKey of existingKeys) {
        if (keyIsImportable(existingKey)) {
            await AsyncStorage.removeItem(existingKey);
        }
    }
    const kvs: { [k: string]: string } = JSON.parse(metadata);
    const kvpairs = Object.keys(kvs)
        .filter(keyIsImportable)
        .map((k) => [k, kvs[k]]);
    await AsyncStorage.multiSet(kvpairs);
}

/**
 * Promise will never reject - it will retry every 30 seconds until the image
 * is imported or the import has finished/been cancelled.
 */
export function importImageRetrying(remoteUri: string, getState: () => FullState) {
    return new Promise((resolve) => {
        importImageRetryingInner(remoteUri, getState, resolve);
    });
}

function importImageRetryingInner(
    remoteUri: string,
    getState: () => FullState,
    resolve: () => void,
) {
    const retry = () => {
        // Check if we still do need to import this image
        const state = getState();
        const name = nameFromUri(remoteUri);
        if (state.imports.importing && state.imports.imageMap && name in state.imports.imageMap) {
            console.log(`Timeout/error importing ${remoteUri}, restarting`);
            importImageRetryingInner(remoteUri, getState, resolve);
        } else {
            // Done - no longer need to import the image
            resolve();
        }
    };
    const timeout = setTimeout(retry, IMAGE_TIMEOUT_MS);
    saveToFilePure(remoteUri, true /* isRemote */)
        .then(() => {
            clearTimeout(timeout);
            resolve();
        })
        .catch((error) => {
            console.warn(error);
            clearTimeout(timeout);
            retry();
        });
}
