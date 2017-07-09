// @flow
import ReactNative from 'react-native';
import {Dispatcher} from 'flux';
import {storageExport, storageImport} from './export.js'

const msDispatcher = new Dispatcher();

function logDispatch(action) {
  switch (action.type) {
  default: {
    console.log('Action:', action)
    return
  }
  }
}

function exportMiddleware(action) {
  switch (action.type) {
  case 'export-start':
    storageExport().then((snapshot) => {
      console.log("exported", snapshot);
      let shareArg = {
        title: "pottery log backup",
        message: JSON.stringify(snapshot),
      };
      ReactNative.Share.share(shareArg)
    });
    break;
  case 'import-start':
    storageImport().then(() => {
      dispatcher.dispatch({
        type: 'reload',
      });
    });
    break;
  }
}

msDispatcher.register(logDispatch);
msDispatcher.register(exportMiddleware);

export default msDispatcher;
