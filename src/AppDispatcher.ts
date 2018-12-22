import {Dispatcher} from 'flux';
import * as types from './action';

const dispatcher = new Dispatcher<types.Action>();

function logDispatch(action: types.Action) {
  switch (action.type) {
    case 'loaded':
      console.log('Action: loaded (body omitted)');
      return;
    case 'migrate-from-images2':
      console.log('Action: migrate-from-images2 ' + action.images2.length + ' images (body omitted)');
      return;
    default: {
      console.log('Action:', action.type, action);
      return;
    }
  }
}

dispatcher.register(logDispatch);
export default dispatcher;
