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
      // image; potId;
      // TODO(jessk)
      break;
    case 'image-delete-all-from-pot':
      // images; potId;
      // TODO(jessk)
      break;
  }
}

msDispatcher.register(logDispatch);
msDispatcher.register(uploadImages);

export default msDispatcher;
