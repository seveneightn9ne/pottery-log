// @flow
import {Dispatcher} from 'flux';
import ImageUploader from './ImageUploader.js'

const msDispatcher = new Dispatcher();

function logDispatch(action) {
  switch (action.type) {
  case 'loaded': {
    console.log('Action: LOADED')
    return
  }
  default: {
    console.log('Action:', action)
    return
  }
  }
}

function uploadImages(action) {
  switch (action.type) {
    case 'image-add':
      ImageUploader.upload(action.image.localUri, action.potId);
      break;
    case 'image-delete-from-pot':
      ImageUploader.delete(action.image.remoteUri);
      break;
    case 'image-delete-all-from-pot':
      // images; potId;
      for (let i=0; i<action.images.length; i++) {
        ImageUploader.delete(action.images[i].remoteUri);
      }
      // TODO(jessk)
      break;
  }
}

msDispatcher.register(logDispatch);
msDispatcher.register(uploadImages);

export default msDispatcher;
