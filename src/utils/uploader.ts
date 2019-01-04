import { Constants } from 'expo';
import _ from 'lodash';
import dispatcher from '../AppDispatcher';
import {nameFromUri} from './imageutils';

// Routes
const apiPrefix = 'https://jesskenney.com/pottery-log/';
export const EXPORT_START = apiPrefix + 'export';
export const EXPORT_IMAGE = apiPrefix + 'export-image';
export const EXPORT_FINISH = apiPrefix + 'finish-export';
export const IMPORT = apiPrefix + 'import';
export const IMAGE_DELETE = 'https://jesskenney.com/pottery-log-images/delete';

async function post<Req, Res>(
  path: string, kvs: Req, onSuccess: (data: Res) => void, onError: (e: string | Error) => void) {
  const formData = new FormData();
  _.forOwn(kvs, (val, key) => {
    formData.append(key, val);
  });

  const options = {
    method: 'POST',
    body: formData,
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'multipart/form-data',
    },
  };

  let error;
  for (let tries = 0; tries < 3; tries++) {
    try {
      const response = await fetch(path, options);
      if (response.ok) {
        const r = await response.json();
        if (r.status === 'ok') {
          return onSuccess(r);
        } else if (r.status === 'error') {
          error = r.message;
        }
      } else {
        error = response.statusText;
      }
    } catch (reason) {
      console.log('Error accessing ' + path);
      console.warn(reason);
      error = reason;
    }
  }
  return onError(error);
}

function mimeFromUri(uri: string) {
  const fileName = nameFromUri(uri);
  const fileNameParts = fileName.split('.');
  let fileType = fileNameParts[fileNameParts.length - 1];
  if (fileType === 'jpg') {
    fileType = 'jpeg';
  }
  return `image/${fileType}`;
}

export async function remove(uri: string) {
  return post(IMAGE_DELETE, {uri}, () => {}, (e) => { throw e; });
}

export async function startExport(id: number, metadata: any) {
  return post(
    EXPORT_START,
    { metadata: JSON.stringify(metadata),
      deviceId: Constants.deviceId },
    () => dispatcher.dispatch({type: 'export-started', exportId: id}),
    (e) => dispatcher.dispatch({type: 'export-failure', exportId: id, error: e}));
}

export async function exportImage(id: number, uri: string) {
  return post(EXPORT_IMAGE, {
    deviceId: Constants.deviceId,
    image: {
      uri,
      name: nameFromUri(uri),
      type: mimeFromUri(uri),
    },
  },
  () => dispatcher.dispatch({type: 'export-image', exportId: id, uri}),
  (e) => dispatcher.dispatch({type: 'export-failure', exportId: id, error: e}));
}

export async function finishExport(id: number) {
  return post(EXPORT_FINISH, {deviceId: Constants.deviceId},
    (res: {uri: string}) => dispatcher.dispatch({type: 'export-finished', exportId: id, uri: res.uri}),
    (e) => dispatcher.dispatch({type: 'export-failure', exportId: id, error: e}));
}

export async function startImport(uri: string) {
  return post(IMPORT, {
    deviceId: Constants.deviceId,
    import: {
      uri,
      name: nameFromUri(uri),
      type: 'application/zip',
    },
  }, (res: {metadata: string, image_map: {[i: string]: string}}) =>
    dispatcher.dispatch({type: 'import-started', metadata: res.metadata, imageMap: res.image_map}),
  (e) => dispatcher.dispatch({type: 'import-failure', error: e}));
}
