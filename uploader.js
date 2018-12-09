// @flow
import Expo from 'expo';
import dispatcher from './AppDispatcher.js';
import {nameFromUri} from './stores/ImageStore.js';
import * as _ from 'lodash';

/*export async function upload(localUri: string) {
  let apiUrl = 'https://jesskenney.com/pottery-log-images/upload';

  let fileName = nameFromUri(localUri);
  let fileNameParts = fileName.split('.');
  let fileType = fileNameParts[fileNameParts.length - 1];
  if (fileType == "jpg") {
    fileType = "jpeg";
  }

  let formData = new FormData();
  // $FlowFixMe
  formData.append('image', {
    uri: localUri,
    name: fileName,
    type: `image/${fileType}`,
  });
  formData.append('deviceId', Expo.Constants.deviceId);

  let options = {
    method: 'POST',
    body: formData,
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'multipart/form-data',
    },
  };

  console.log("Will upload " + localUri);

  fetch(apiUrl, options).then((response) => {
    if (response.ok) {
      response.json().then(r => {
        if (r.status == "ok") {
          console.log("Uploaded image available at " + r.uri);
          dispatcher.dispatch({
            type: 'image-remote-uri',
            name: fileName,
            remoteUri: r.uri,
          });
        } else {
          console.log("ERROR: Upload response", r);
        }
      }).catch (err => {
        console.log("ERROR couldn't parse response");
        console.log(response);
        throw err;
      });
    } else {
      console.log("upload ERROR: Response " + response.status + " : " + response.statusText);
    }
  }).catch((reason) => {
    console.log("upload threw", reason);
    dispatcher.dispatch({
      type: 'image-remote-failed',
      name: fileName,
    });
  });
};*/

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
  for (tries = 0; tries < max_tries; tries++) {
    try {
      const response = await fetch(path, options);
      if (response.ok) {
        const r = response.json();
        if (r.status == "ok") {
          return onSuccess(r);
        } else if (r.status == "error") {
          error = r.message;
        }
      } else {
        error = response.statusText;
      }
    } catch (reason) {
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

export async function startExport(metadata: any) {
  return post(
    EXPORT_START,
    { metadata: JSON.stringify(metadata),
      deviceId: Expo.Constants.deviceId, },
    () => dispatcher.dispatch({type: 'export-started'}),
    (e) => dispatcher.dispatch({type: 'export-failure', error: e}));
};

export async function exportImage(uri: string) {
  return post(EXPORT_IMAGE, {
    deviceId: Expo.Constants.deviceId,
    image: {
      uri,
      name: nameFromUri(uri),
      type: mimeFromUri(uri),
    },
  },
  () => dispatcher.dispatch({type: 'export-image', uri}),
  (e) => dispatcher.dispatch({type: 'export-failure', error: e}));
}

export async function finishExport() {
  return post(EXPORT_FINISH, {deviceId: Expo.Constants.deviceId}, 
    (res) => dispatcher.dispatch({type: 'export-finished', uri: res.uri}),
    (e) => dispatcher.dispatch({type: 'export-failure', error: e}));
}