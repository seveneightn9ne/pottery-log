// @flow
import Expo from 'expo';
import dispatcher from './AppDispatcher.js';
import {nameFromUri} from './stores/ImageStore.js';

export async function upload(localUri: string) {
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
    throw reason;
  });
};

export async function remove(uri: string) {
  let apiUrl = 'https://jesskenney.com/pottery-log-images/delete';

  let formData = new FormData();
  formData.append('uri', uri);

  let options = {
    method: 'POST',
    body: formData,
  };
 
  console.log("Will delete " + uri);

  fetch(apiUrl, options).then((response) => {
    if (response.ok) {
      console.log("Deleted remote image.")
      dispatcher.dispatch({
        type: 'image-delete-succeeded',
        imageName: nameFromUri(uri),
      });
    } else {
      console.log("delete ERROR: Response " + response.status + " : " + response.statusText);
    }
  }).catch((reason) => {
    throw reason;
  });
};
