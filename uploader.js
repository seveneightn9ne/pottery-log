// @flow
import Expo from 'expo';
import dispatcher from './AppDispatcher.js';
import {nameFromUri} from './stores/ImageStore.js';
import * as _ from 'lodash';

// Routes
const apiPrefix = 'https://jesskenney.com/pottery-log/';
const EXPORT_START = apiPrefix + 'export';
const EXPORT_IMAGE = apiPrefix + 'export-image';
const EXPORT_FINISH = apiPrefix + 'finish-export';
const IMPORT = apiPrefix + 'import';
const IMAGE_DELETE = 'https://jesskenney.com/pottery-log-images/delete';

async function post(path, kvs, onSuccess, onError) {
  const formData = new FormData();
  _.forOwn(kvs, (val, key) => {
    formData.append(key, val);
  });
  
  let options = {
    method: 'POST',
    body: formData,
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'multipart/form-data',
    },
  };

  let error = undefined;
  for (tries = 0; tries < 3; tries++) {
    try {
      const response = await fetch(path, options);
      if (response.ok) {
        const r = await response.json();
        if (r.status == "ok") {
          return onSuccess(r);
        } else if (r.status == "error") {
          error = r.message;
        }
      } else {
        error = response.statusText;
      }
    } catch (reason) {
      console.log("Error accessing " + path);
      console.error(reason);
      error = reason;
    }
  }
  return onError(error);
}

function mimeFromUri(uri: string) {
  let fileName = nameFromUri(uri);
  let fileNameParts = fileName.split('.');
  let fileType = fileNameParts[fileNameParts.length - 1];
  if (fileType == "jpg") {
    fileType = "jpeg";
  }
  return `image/${fileType}`;
}

export async function remove(uri: string) {
  return post(IMAGE_DELETE, {uri}, () => dispatcher.dispatch({
    type: 'image-delete-succeeded',
    imageName: nameFromUri(uri),
  }), (e) => {throw e});
};

export async function startExport(id: number, metadata: any) {
  return post(
    EXPORT_START,
    { metadata: JSON.stringify(metadata),
      deviceId: Expo.Constants.deviceId, },
    () => dispatcher.dispatch({type: 'export-started', id}),
    (e) => dispatcher.dispatch({type: 'export-failure', id, error: e}));
};

export async function exportImage(id: number, uri: string) {
  return post(EXPORT_IMAGE, {
    deviceId: Expo.Constants.deviceId,
    image: {
      uri,
      name: nameFromUri(uri),
      type: mimeFromUri(uri),
    },
  },
  () => dispatcher.dispatch({type: 'export-image', id, uri}),
  (e) => dispatcher.dispatch({type: 'export-failure', id, error: e}));
}

export async function finishExport(id: number) {
  return post(EXPORT_FINISH, {deviceId: Expo.Constants.deviceId}, 
    (res) => dispatcher.dispatch({type: 'export-finished', id, uri: res.uri}),
    (e) => dispatcher.dispatch({type: 'export-failure', id, error: e}));
}

export async function startImport(uri: string) {
  return post(IMPORT, {
    deviceId: Expo.Constants.deviceId,
    import: {
      uri,
      name: nameFromUri(uri),
      type: 'application/zip',
    }
  }, (res) => dispatcher.dispatch({type: 'import-started', metadata: res.metadata, imageMap: res.image_map}),
  (e) => dispatcher.dispatch({type: 'import-failure', error: e}));
}