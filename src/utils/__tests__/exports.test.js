import { Alert, AsyncStorage } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import * as exports from "../exports";
import * as uploader from "../uploader";
import * as imageutils from "../imageutils";
import * as dispatcher from "../../reducers/store";
import * as loadInitial from "../../thunks/loadInitial";

jest.mock("../uploader", () => ({
  startImport: jest.fn().mockReturnValue(Promise.resolve()),
  startUrlImport: jest.fn().mockReturnValue(Promise.resolve()),
  finishExport: jest.fn().mockReturnValue(Promise.resolve()),
  exportImage: jest.fn().mockReturnValue(Promise.resolve()),
  startExport: jest.fn().mockReturnValue(Promise.resolve())
}));
jest.mock("AsyncStorage");
jest.mock("../imageutils", () => ({
  deprecatedSaveToFileImpure: jest.fn().mockReturnValue(Promise.resolve())
}));
jest.mock("../../reducers/store", () => ({
  dispatch: jest.fn()
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
jest.mock("Alert", () => ({
  alert: jest.fn()
}));
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
    expect(imageutils.deprecatedSaveToFileImpure).not.toHaveBeenCalled();
  });

  it("exportImage not exportable", async () => {
    await exports.exportImage({ localUri: "not-sufficient.jpg" });
    expect(uploader.exportImage).not.toHaveBeenCalled();
    expect(imageutils.deprecatedSaveToFileImpure).not.toHaveBeenCalled();
  });

  // TODO(jessk) test for exportImage when file not exists
});

describe("importing", () => {
  afterEach(() => jest.clearAllMocks());

  it("startImport", async () => {
    DocumentPicker.getDocumentAsync.mockReturnValue(
      Promise.resolve({ type: "success", uri: "a.zip" })
    );
    await exports.startImport();
    expect(uploader.startImport).toHaveBeenCalledWith("a.zip");
  });

  it("startUrlImport", async () => {
    await exports.startUrlImport("a.zip");
    expect(uploader.startUrlImport).toHaveBeenCalledWith("a.zip");
  });

  it("startImport cancelled", async () => {
    DocumentPicker.getDocumentAsync.mockReturnValue(
      Promise.resolve({ type: "cancel" })
    );
    await exports.startImport();
    expect(uploader.startImport).not.toHaveBeenCalled();
    expect(dispatcher.dispatch).toHaveBeenCalledWith({ type: "import-cancel" });
  });

  it.skip("importMetadata", async () => {
    jest.useFakeTimers();
    Alert.alert.mockImplementation(async (text, whoknows, array) => {
      return array[1].onPress();
    });
    AsyncStorage.getAllKeys.mockReturnValue(
      Promise.resolve(["@Pots", "@Pot:1", "@ImageStore", "@DoNotExport"])
    );
    await exports.importMetadata('{"@Pot:5": "\\"value\\""}');
    jest.runAllTimers();

    expect(AsyncStorage.removeItem).toHaveBeenCalledWith("@Pots");
    expect(AsyncStorage.removeItem).toHaveBeenCalledWith("@Pot:1");
    expect(AsyncStorage.removeItem).toHaveBeenCalledWith("@ImageStore");
    expect(AsyncStorage.removeItem).not.toHaveBeenCalledWith("@DoNotExport");

    expect(AsyncStorage.multiSet).toHaveBeenCalledWith([["@Pot:5", '"value"']]);
    expect(dispatcher.dispatch).toHaveBeenCalledWith({
      type: "imported-metadata"
    });
  });

  it("importMetadataNow", async () => {
    AsyncStorage.getAllKeys.mockReturnValue(
      Promise.resolve(["@Pots", "@Pot:1", "@ImageStore", "@DoNotExport"])
    );
    AsyncStorage.multiSet.mockReturnValue(Promise.resolve());
    await exports.importMetadataNow('{"@Pot:5": "\\"value\\""}');

    expect(AsyncStorage.removeItem).toHaveBeenCalledWith("@Pots");
    expect(AsyncStorage.removeItem).toHaveBeenCalledWith("@Pot:1");
    expect(AsyncStorage.removeItem).toHaveBeenCalledWith("@ImageStore");
    expect(AsyncStorage.removeItem).not.toHaveBeenCalledWith("@DoNotExport");

    expect(AsyncStorage.multiSet).toHaveBeenCalledWith([["@Pot:5", '"value"']]);
    expect(loadInitial.reloadFromImport).toHaveBeenCalled();
  });

  it("importMetadataNow not parsable", async () => {
    jest.useFakeTimers();
    await exports.importMetadataNow("this is not JSON");
    jest.runAllTimers();
    expect(dispatcher.dispatch.mock.calls[0][0]).toHaveProperty(
      "type",
      "import-failure"
    );
  });

  it("importImage", () => {
    jest.useFakeTimers();
    exports.importImage("r.png");
    jest.runAllTimers();
    expect(imageutils.deprecatedSaveToFileImpure).toHaveBeenCalledWith(
      "r.png",
      true
    );
    expect(dispatcher.dispatch).toHaveBeenCalledWith({
      type: "image-timeout",
      uri: "r.png"
    });
  });
});
