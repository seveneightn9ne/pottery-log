// setup-tests.js

import "react-native";
import "jest-enzyme";
import Adapter from "enzyme-adapter-react-16";
import Enzyme from "enzyme";
import mockAsyncStorage from '@react-native-community/async-storage/jest/async-storage-mock';

/**
 * Set up DOM in node.js environment for Enzyme to mount to
 */
const { JSDOM } = require("jsdom");

const jsdom = new JSDOM("<!doctype html><html><body></body></html>", {
  // https://github.com/jsdom/jsdom/issues/2304#issuecomment-662972525
  url: 'http://localhost/'
});
const { window } = jsdom;

function copyProps(src, target) {
  Object.defineProperties(target, {
    ...Object.getOwnPropertyDescriptors(src),
    ...Object.getOwnPropertyDescriptors(target)
  });
}

global.window = window;
global.document = window.document;
global.navigator = {
  userAgent: "node.js"
};
copyProps(window, global);

/**
 * Set up Enzyme to mount to DOM, simulate events,
 * and inspect the DOM in tests.
 */
Enzyme.configure({ adapter: new Adapter() });

/**
 * Ignore some expected warnings
 * see: https://jestjs.io/docs/en/tutorial-react.html#snapshot-testing-with-mocks-enzyme-and-react-16
 * see https://github.com/Root-App/react-native-mock-render/issues/6
 */
const originalConsoleError = console.error;
console.error = message => {
  if (message.startsWith("Warning:")) {
    return;
  }

  originalConsoleError(message);
};

function makeDispatch(getState = () => undefined) {
  const dispatchMock = jest.fn().mockImplementation(a => a);
  async function dispatch(arg) {
    if (typeof arg == "function") {
      const r = await arg(dispatch, getState);
      if (r) {
        return await dispatch(r);
      }
    } else {
      return dispatchMock(arg);
    }
  }
  return { dispatch, dispatchMock };
}

global.makeDispatch = makeDispatch;

jest.mock('react-native/Libraries/Storage/AsyncStorage', () => mockAsyncStorage);
