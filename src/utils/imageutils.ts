import { FileSystem } from "expo";
import _ from "lodash";
import store from "../reducers/store";
import { ImageState } from "../reducers/types";
import * as uploader from "./uploader";

/**
 * Errors are always caught. Dispatches 'image-file-created' or 'image-file-failed'.
 */
export function saveToFile(uri: string, isRemote = false): Promise<void> {
  const onError = (e: Error | string) => {
    console.warn("saveToFile failure:", e);
    store.dispatch({ type: "image-file-failed", uri });
  };
  if (!uri) {
    console.warn("No URI passed to saveToFile");
    setTimeout(onError, 0);
    return Promise.resolve();
  }
  const name = nameFromUri(uri);
  const random = Math.floor(Math.random() * 1000000 + 1);
  const dir = FileSystem.documentDirectory + random;
  return FileSystem.makeDirectoryAsync(dir, { intermediates: true })
    .catch(() => {
      return FileSystem.getInfoAsync(dir).then(result => {
        if (!result.exists) {
          return Promise.reject("The directory was not created: " + dir);
        }
        console.log("resolving makedirectory");
        // makeDirectoryAsync errored but the directory exists, so we can continue.
        return Promise.resolve();
      });
    })
    .then(() => {
      const fileUri = dir + "/" + name;
      const afterCopy = () => {
        store.dispatch({
          type: "image-file-created",
          name,
          fileUri
        });
      };
      if (isRemote) {
        return FileSystem.downloadAsync(uri, fileUri)
          .then(afterCopy)
          .catch(onError);
      } else {
        return FileSystem.copyAsync({ from: uri, to: fileUri })
          .then(afterCopy)
          .catch(onError);
      }
    })
    .catch(onError);
}

export function deleteFile(uri: string) {
  FileSystem.deleteAsync(uri, { idempotent: true });
}

export function nameFromUri(uri: string): string {
  const uriParts = uri.split("/");
  return uriParts[uriParts.length - 1];
}

export async function deleteUnusedImage(image: ImageState) {
  if (image.remoteUri) {
    try {
      await uploader.remove(image.remoteUri);
    } catch (e) {
      console.warn("Failed to remove remote uri:", image.remoteUri);
      console.warn(e);
    }
  }
  if (image.fileUri) {
    try {
      await deleteFile(image.fileUri);
    } catch (e) {
      console.warn("Failed to delete unused image:", image.fileUri);
      console.warn(e);
    }
  }
}
