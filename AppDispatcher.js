// @flow
import {Dispatcher} from 'flux';

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

msDispatcher.register(logDispatch)

export default msDispatcher;
