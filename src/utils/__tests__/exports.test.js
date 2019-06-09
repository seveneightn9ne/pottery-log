import { Alert, AsyncStorage } from "react-native";
import { DocumentPicker, FileSystem } from "expo";
import * as exports from "../exports";
import * as uploader from "../uploader";
import * as imageutils from "../imageutils";
import * as dispatcher from "../../reducers/store";

jest.mock("../uploader", () => ({
  startImport: jest.fn().mockReturnValue(Promise.resolve()),
  startUrlImport: jest.fn().mockReturnValue(Promise.resolve()),
  finishExport: jest.fn().mockReturnValue(Promise.resolve()),
  exportImage: jest.fn().mockReturnValue(Promise.resolve()),
  startExport: jest.fn().mockReturnValue(Promise.resolve())
}));
jest.mock("AsyncStorage");
jest.mock("../imageutils", () => ({
  saveToFile: jest.fn().mockReturnValue(Promise.resolve())
}));
jest.mock("../../reducers/store", () => ({
  dispatch: jest.fn()
}));
jest.mock("expo", () => ({
  DocumentPicker: {
    getDocumentAsync: jest.fn()
  },
  Constants: {
    appOwnership: "expo"
  },
  FileSystem: {
    getInfoAsync: jest.fn().mockReturnValue(Promise.resolve({ exists: true }))
  }
}));
jest.mock("Alert", () => ({
  alert: jest.fn()
}));
//jest.mock("FileSystem", () => ({
//  getInfoAsync: Promise.resolve({ exists: true })
//}));

describe("exporting", () => {
  afterEach(() => jest.clearAllMocks());

  it("startExport", async () => {
    AsyncStorage.getAllKeys.mockReturnValue(
      Promise.resolve(["@Pots", "@ImageStore", "@DoNotExport"])
    );
    AsyncStorage.multiGet.mockReturnValue(
      Promise.resolve([["@Pots", "{pots}"], ["@ImageStore", "{images}"]])
    );
    await exports.startExport(12345);

    expect(uploader.startExport).toHaveBeenCalledWith(12345, {
      "@Pots": "{pots}",
      "@ImageStore": "{images}"
    });
  });

  it("exportImage file", () => {
    const { willExport, promise } = exports.exportImage(12345, {
      localUri: "l.jpg",
      remoteUri: "r.jpg",
      fileUri: "f.jpg"
    });
    expect(willExport).toBeTruthy();
    return promise.then(() => {
      expect(uploader.exportImage).toHaveBeenCalledWith(
        12345,
        "f.jpg",
        expect.any(Function)
      );
      expect(imageutils.saveToFile).not.toHaveBeenCalled();
    });
  });

  it("exportImage save remote first", () => {
    const { willExport, promise } = exports.exportImage(12345, {
      localUri: "l.jpg",
      remoteUri: "r.jpg"
    });
    expect(willExport).toBeFalsy();
    return promise.then(() => {
      expect(uploader.exportImage).not.toHaveBeenCalled();
      expect(imageutils.saveToFile).toHaveBeenCalledWith("r.jpg", true);
    });
  });

  it("exportImage save local first", () => {
    const { willExport, promise } = exports.exportImage(12345, {
      localUri: "l.jpg"
    });
    expect(willExport).toBeFalsy();
    return promise.then(() => {
      expect(uploader.exportImage).not.toHaveBeenCalled();
      expect(imageutils.saveToFile).toHaveBeenCalledWith("l.jpg", false);
    });
  });

  it("exportImage not exportable", () => {
    const { willExport, promise } = exports.exportImage(12345, {});
    expect(willExport).toBeFalsy();
    return promise.then(() => {
      expect(uploader.exportImage).not.toHaveBeenCalled();
      expect(imageutils.saveToFile).not.toHaveBeenCalled();
    });
  });

  // TODO(jessk) test for exportImage when file not exists

  it("finishExport", () => {
    exports.finishExport(12345);
    expect(uploader.finishExport).toHaveBeenCalledWith(12345);
  });
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
    expect(dispatcher.dispatch).toHaveBeenCalledWith({
      type: "imported-metadata"
    });
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
    expect(imageutils.saveToFile).toHaveBeenCalledWith("r.png", true);
    expect(dispatcher.dispatch).toHaveBeenCalledWith({
      type: "image-timeout",
      uri: "r.png"
    });
  });
});
