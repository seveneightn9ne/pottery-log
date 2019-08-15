import Constants from 'expo-constants';
import _ from 'lodash';
import store from '../reducers/store';
import { nameFromUri } from './imageutils';

// Routes
const apiPrefix = 'https://jesskenney.com/pottery-log/';
export const EXPORT_START = apiPrefix + 'export';
export const EXPORT_IMAGE = apiPrefix + 'export-image';
export const EXPORT_FINISH = apiPrefix + 'finish-export';
export const IMPORT = apiPrefix + 'import';
export const IMAGE_DELETE = 'https://jesskenney.com/pottery-log-images/delete';
export const DEBUG = apiPrefix + 'debug';

async function post<Req>(path: string, kvs: Req): Promise<void> {
  return postAndReturn(path, kvs, () => {});
}

async function postAndReturn<Req, Res, Ret>(
  path: string,
  kvs: Req,
  onSuccess: (data: Res) => Ret,
  onError?: (e: string | Error) => Ret,
): Promise<Ret> {
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
        error = response.statusText || `HTTP ${response.status}`;
        console.log(`Error accessing ${path}`, error);
      }
    } catch (reason) {
      console.log('Error accessing ' + path);
      console.warn(reason);
      error = reason;
    }
  }
  if (onError) {
    return onError(error);
  }
  throw error;
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
  return postAndReturn(
    IMAGE_DELETE,
    { uri },
    () => {},
    (e) => {
      throw e;
    },
  );
}

export async function startExport(metadata: any) {
  return post(EXPORT_START, {
    metadata: JSON.stringify(metadata),
    deviceId: Constants.deviceId,
  });
}

export async function exportImage(uri: string) {
  return post(EXPORT_IMAGE, {
    deviceId: Constants.deviceId,
    image: {
      uri,
      name: nameFromUri(uri),
      type: mimeFromUri(uri),
    },
  });
}

export async function finishExport() {
  return postAndReturn(
    EXPORT_FINISH,
    { deviceId: Constants.deviceId },
    (res: { uri: string }) => res.uri,
  );
}

export async function startImport(uri: string) {
  return postAndReturn(
    IMPORT,
    {
      deviceId: Constants.deviceId,
      import: {
        uri,
        name: nameFromUri(uri),
        type: 'application/zip',
      },
    },
    handleImportResponse,
    handleImportFailure,
  );
}

export async function startUrlImport(uri: string) {
  return postAndReturn(
    IMPORT,
    {
      deviceId: Constants.deviceId,
      importURL: uri,
    },
    handleImportResponse,
    handleImportFailure,
  );
}

const handleImportResponse = (res: {
  metadata: string;
  image_map: { [i: string]: string };
}) => {
  store.dispatch({
    type: 'import-started',
    metadata: res.metadata,
    imageMap: res.image_map,
  });
};

const handleImportFailure = (e: string | Error) =>
  store.dispatch({ type: 'import-failure', error: e });

export async function debug(name: string, data: any) {
  console.log('DEBUG: ', name, data);
  return post(DEBUG, {
    appOwnership: Constants.appOwnership,
    deviceId: Constants.deviceId,
    data: JSON.stringify(data),
    name,
  });
}
