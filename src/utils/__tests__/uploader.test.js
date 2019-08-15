import * as uploader from "../uploader";
import * as dispatcher from "../../reducers/store";

jest.mock("../../reducers/store", () => ({
  dispatch: jest.fn()
}));

global.FormData = function() {
  this.append = jest.fn();
};

jest.mock("expo-constants", () => ({
  deviceId: "1001"
}));

function mockFetchJson(val) {
  global.fetch = jest.fn().mockImplementation((path, options) => {
    return Promise.resolve({
      json: function() {
        return Promise.resolve(val);
      },
      ok: true
    });
  });
  return global.fetch;
}

function mockFetchError() {
  global.fetch = jest.fn().mockImplementation((path, options) => {
    return Promise.reject("something is wrong");
  });
  return global.fetch;
}

function mockFetchError2() {
  global.fetch = jest.fn().mockImplementation((path, options) => {
    return Promise.resolve({
      ok: false,
      statusText: "something is wrong"
    });
  });
  return global.fetch;
}

function expectFormValue(fetch, field, val) {
  expect(fetch.mock.calls[0][1].body.append).toHaveBeenCalledWith(field, val);
}

describe("uploader", () => {
  afterEach(() => jest.clearAllMocks());

  it("remove", () => {
    const fetch = mockFetchJson({ status: "ok" });
    const uri = "my-image-uri";
    uploader.remove(uri);
    expect(fetch).toHaveBeenCalled();
    expect(fetch.mock.calls[0][0]).toBe(uploader.IMAGE_DELETE);
    expectFormValue(fetch, "uri", uri);
  });

  it("startExport", async () => {
    const fetch = mockFetchJson({ status: "ok" });
    const id = 1;
    const metadata = { whatever: "whatever" };
    const metadataJSON = JSON.stringify(metadata);

    await uploader.startExport(metadata);
    expect(fetch).toHaveBeenCalled();
    expect(fetch.mock.calls[0][0]).toBe(uploader.EXPORT_START);
    expectFormValue(fetch, "deviceId", "1001");
    expectFormValue(fetch, "metadata", metadataJSON);
  });

  it("startExport error", async () => {
    const fetch = mockFetchError();
    const id = 1;
    const metadata = { whatever: "whatever" };

    const p = uploader.startExport(metadata);
    expect(p).rejects;
  });

  it("startExport error2", async () => {
    const fetch = mockFetchError2();
    const id = 1;
    const metadata = { whatever: "whatever" };

    const p = uploader.startExport(metadata);
    expect(p).rejects;
  });

  it("exportImage", async () => {
    const fetch = mockFetchJson({ status: "ok" });
    const uri = "local/image.png";

    await uploader.exportImage(uri);
    expect(fetch).toHaveBeenCalled();
    expect(fetch.mock.calls[0][0]).toBe(uploader.EXPORT_IMAGE);
    expectFormValue(fetch, "deviceId", "1001");
    expectFormValue(fetch, "image", {
      uri: uri,
      name: "image.png",
      type: "image/png"
    });
  });

  it("exportImage error", async () => {
    mockFetchError();
    const uri = "local/image.png";

    const p = uploader.exportImage(uri);
    expect(p).rejects;
  });

  it("finishExport", async () => {
    const fetch = mockFetchJson({
      status: "ok",
      uri: "s3-uri"
    });

    const uri = await uploader.finishExport();
    expect(fetch).toHaveBeenCalled();
    expect(fetch.mock.calls[0][0]).toBe(uploader.EXPORT_FINISH);
    expectFormValue(fetch, "deviceId", "1001");
    expect(uri).toBe("s3-uri");
  });

  it("finishExport error", async () => {
    mockFetchError();
    const p = uploader.finishExport();
    expect(p).rejects;
  });

  it("startImport", async () => {
    const fetch = mockFetchJson({
      status: "ok",
      metadata: "meta-data",
      image_map: {}
    });
    const uri = "local/data.zip";

    await uploader.startImport(uri);
    expect(fetch).toHaveBeenCalled();
    expect(fetch.mock.calls[0][0]).toBe(uploader.IMPORT);
    expectFormValue(fetch, "deviceId", "1001");
    expectFormValue(fetch, "import", {
      uri: uri,
      name: "data.zip",
      type: "application/zip"
    });
    expect(dispatcher.dispatch).toBeCalledWith({
      type: "import-started",
      metadata: "meta-data",
      imageMap: {}
    });
  });

  it("startImport error", async () => {
    const fetch = mockFetchError();
    const id = 1;
    const uri = "local/data.zip";

    await uploader.startImport(uri);
    expect(dispatcher.dispatch).toBeCalledWith({
      type: "import-failure",
      error: "something is wrong"
    });
  });

  it("startUrlImport", async () => {
    const fetch = mockFetchJson({
      status: "ok",
      metadata: "meta-data",
      image_map: {}
    });
    const uri = "https://pottery-log-exports/data.zip";

    await uploader.startUrlImport(uri);
    expect(fetch).toHaveBeenCalled();
    expect(fetch.mock.calls[0][0]).toBe(uploader.IMPORT);
    expectFormValue(fetch, "deviceId", "1001");
    expectFormValue(fetch, "importURL", uri);
    expect(dispatcher.dispatch).toBeCalledWith({
      type: "import-started",
      metadata: "meta-data",
      imageMap: {}
    });
  });

  it("startUrlImport error", async () => {
    const fetch = mockFetchError();
    const id = 1;
    const uri = "https://pottery-log-exports/data.zip";

    await uploader.startUrlImport(uri);
    expect(dispatcher.dispatch).toBeCalledWith({
      type: "import-failure",
      error: "something is wrong"
    });
  });

  it("debug", async () => {
    const fetch = mockFetchJson({
      status: "ok"
    });
    const logName = "logName";
    const data = { a: "b" };
    await uploader.debug(logName, data);
    expect(fetch).toHaveBeenCalled();
    expect(fetch.mock.calls[0][0]).toBe(uploader.DEBUG);
    expectFormValue(fetch, "deviceId", "1001");
    expectFormValue(fetch, "name", logName);
    expectFormValue(fetch, "data", JSON.stringify(data));
  });
});
