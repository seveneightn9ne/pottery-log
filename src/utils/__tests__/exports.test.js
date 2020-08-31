import * as exports from "../exports";
import * as uploader from "../uploader";

// All these mocks might not be needed...

jest.mock("react-native-appearance");
jest.mock("../uploader", () => ({
  finishExport: jest.fn().mockReturnValue(Promise.resolve()),
  exportImage: jest.fn().mockReturnValue(Promise.resolve()),
  startExport: jest.fn().mockReturnValue(Promise.resolve())
}));
jest.mock("expo-document-picker", () => ({
  getDocumentAsync: jest.fn()
}));
jest.mock("expo-constants", () => ({
  appOwnership: "expo"
}));
jest.mock("expo-file-system", () => ({
  getInfoAsync: jest.fn().mockReturnValue(Promise.resolve({ exists: true }))
}));
// Cannot find module 'Alert' from 'exports.test.js'
// jest.mock("Alert", () => ({
//   alert: jest.fn(),
// }));
jest.mock("../../thunks/loadInitial");

describe("exporting", () => {
  afterEach(() => jest.clearAllMocks());

  it("exportImage file", async () => {
    await exports.exportImage({
      localUri: "l.jpg",
      remoteUri: "r.jpg",
      fileUri: "f.jpg"
    });
    expect(uploader.exportImage).toHaveBeenCalledWith("f.jpg");
  });

  it("exportImage not exportable", async () => {
    await exports.exportImage({ localUri: "not-sufficient.jpg" });
    expect(uploader.exportImage).not.toHaveBeenCalled();
  });

  // TODO(jessk) test for exportImage when file not exists
});
