// @flow
import Expo from 'expo';
import dispatcher from './AppDispatcher.js';

export default ImageUploader = {
 	upload: async function(uri, uuid) {
	  let apiUrl = 'https://jesskenney.com/pottery-log-images/upload';

	  let uriParts = uri.split('/');
    let fileName = uriParts[uriParts.length - 1];
    let fileNameParts = fileName.split('.');
	  let fileType = fileNameParts[fileNameParts.length - 1];

	  let formData = new FormData();
	  formData.append('image', {
	    uri,
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

	  fetch(apiUrl, options).then((response) => {
      if (response.ok) {
        response.json().then(r => {
          if (r.status == "ok") {
            console.log("Uploaded image available at " + r.uri);
            dispatcher.dispatch({
              type: 'image-remote-uri',
              localUri: uri,
              remoteUri: r.uri,
              potId: uuid,
            });
          } else {
            console.log("ERROR: Upload response", r);
          }
        }).catch (err => {
          console.log("ERROR couldn't parse response");
          throw err;
        });
      } else {
        console.log("ERROR: Response " + response.status + " : " + response.statusText);
      }
    }).catch((reason) => {
      throw reason;

    });
	}
}
