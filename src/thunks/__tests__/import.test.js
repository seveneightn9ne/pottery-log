import { AsyncStorage } from 'react-native';
import * as imports from "../import";
import * as import_utils from "../../utils/imports";
import * as uploader from "../../utils/uploader";
import * as DocumentPicker from "expo-document-picker";

jest.mock("expo-document-picker", () => ({
  getDocumentAsync: jest.fn().mockResolvedValue({type: 'uri', uri: 'f/import.zip'})
}));

jest.mock("../../utils/uploader", () => ({
  startFileImport: jest.fn().mockResolvedValue({
    metadata: "meta-data",
    imageMap: {
      "a.jpg": {uri: "http://s3/a.jpg"},
      "b.jpg": {uri: "http://s3/b.jpg"},
      "c.jpg": {uri: "http://s3/c.jpg"},
    }
  }),
  startUrlImport: jest.fn().mockResolvedValue({
    metadata: "meta-data",
    imageMap: {
      "a.jpg": {uri: "http://s3/a.jpg"},
      "b.jpg": {uri: "http://s3/b.jpg"},
      "c.jpg": {uri: "http://s3/c.jpg"},
    }
  }),
}));

jest.mock("../loadInitial", () => ({
  reloadFromImport: jest.fn().mockReturnValue("reload-from-import-fn"),
}));

jest.mock("../../utils/imports", () => ({
  importMetadataNow: jest.fn().mockResolvedValue(),
  importImageRetrying: jest.fn().mockResolvedValue(),
  confirmImport: jest.fn().mockImplementation(async (confirm, cancel) => await confirm()),
}));

async function setupMocks() {
  await AsyncStorage.clear();
  await AsyncStorage.multiSet([["@Pots", []]]);
}

describe('importFromFile', () => {
  beforeEach(async () => await setupMocks());
  afterEach(() => jest.clearAllMocks());

  it('happy path', async () => {
    const { dispatch, dispatchMock } = makeDispatch(() => ({}));

    await dispatch(imports.importFromFile());
    const dispatchCalls = [
      {
        type: "import-status",
        importing: true,
        statusMessage: "Starting import...",
        imageMap: undefined,
      },
      {
        type: "import-status",
        importing: true,
        statusMessage: "Importing pots...",
        imageMap: {
            "a.jpg": {uri: "http://s3/a.jpg"},
            "b.jpg": {uri: "http://s3/b.jpg"},
            "c.jpg": {uri: "http://s3/c.jpg"},
        },
      },
      "reload-from-import-fn",
      {
        type: "import-status",
        importing: true,
        statusMessage: "Importing images (0/3)",
        imageMap: {
          "a.jpg": {uri: "http://s3/a.jpg"},
          "b.jpg": {uri: "http://s3/b.jpg"},
          "c.jpg": {uri: "http://s3/c.jpg"},
        },
      },
      {
        type: "import-status",
        importing: true,
        statusMessage: "Importing images (1/3)",
        imageMap: {
          "b.jpg": {uri: "http://s3/b.jpg", started: true},
          "c.jpg": {uri: "http://s3/c.jpg"},
        },
      },
      {
        type: "import-status",
        importing: true,
        statusMessage: "Importing images (2/3)",
        imageMap: {
          "c.jpg": {uri: "http://s3/c.jpg", started: true},
        }
      },
      {
        type: "import-status",
        importing: true,
        statusMessage: "Importing images (3/3)",
        imageMap: {},
      },
      {
        type: "import-status",
        importing: false,
        statusMessage: "Finished import.",
      },
      {
        type: "page-list",
      },
    ];

    expect(dispatchMock.mock.calls).toEqual(dispatchCalls.map(a => [a]));
    expect(uploader.startFileImport).toHaveBeenCalled();
    expect(import_utils.importMetadataNow).toHaveBeenNthCalledWith(1, "meta-data");

    expect(import_utils.importImageRetrying).toHaveBeenCalledTimes(3);
    expect(import_utils.importImageRetrying).toHaveBeenNthCalledWith(1, "http://s3/a.jpg", expect.any(Function));
    expect(import_utils.importImageRetrying).toHaveBeenNthCalledWith(2, "http://s3/b.jpg", expect.any(Function));
    expect(import_utils.importImageRetrying).toHaveBeenNthCalledWith(3, "http://s3/c.jpg", expect.any(Function));
  });

  it('cancels with no file', async () => {
    DocumentPicker.getDocumentAsync.mockResolvedValueOnce({type: 'cancel'});

    const { dispatch, dispatchMock } = makeDispatch(() => ({}));

    await dispatch(imports.importFromFile());
    const dispatchCalls = [
      {
        type: "import-status",
        importing: true,
        statusMessage: "Starting import...",
        imageMap: undefined,
      },
      {
        type: "import-status",
        importing: false,
        statusMessage: "Cancelled import.",
      },
    ];
    expect(dispatchMock.mock.calls).toEqual(dispatchCalls.map(a => [a]));
    expect(uploader.startFileImport).not.toHaveBeenCalled();
  });

  it('cancels with prompt', async () => {
    import_utils.confirmImport.mockImplementationOnce(async (confirm, cancel) => await cancel());

    const { dispatch, dispatchMock } = makeDispatch(() => ({}));

    await dispatch(imports.importFromFile());
    const dispatchCalls = [
      {
        type: "import-status",
        importing: true,
        statusMessage: "Starting import...",
        imageMap: undefined,
      },
      {
        type: "import-status",
        importing: false,
        statusMessage: "Cancelled import.",
      },
    ];
    expect(dispatchMock.mock.calls).toEqual(dispatchCalls.map(a => [a]));
    expect(uploader.startFileImport).toHaveBeenCalled();
    expect(import_utils.importMetadataNow).not.toHaveBeenCalled();
  });

  it('fails with network error', async () => {
    uploader.startFileImport.mockRejectedValueOnce('network error');

    const { dispatch, dispatchMock } = makeDispatch(() => ({}));

    await dispatch(imports.importFromFile());
    const dispatchCalls = [
      {
        type: "import-status",
        importing: true,
        statusMessage: "Starting import...",
        imageMap: undefined,
      },
      {
        type: "import-status",
        importing: false,
        statusMessage: "Import failed.\nnetwork error",
      },
    ];
    expect(dispatchMock.mock.calls).toEqual(dispatchCalls.map(a => [a]));
    expect(uploader.startFileImport).toHaveBeenCalled();
    expect(import_utils.importMetadataNow).not.toHaveBeenCalled();
  });
});

describe('doImport', () => {
  beforeEach(async () => await setupMocks());
  afterEach(() => jest.clearAllMocks());

  it('finishes when there are no images', async () => {
    uploader.startFileImport.mockResolvedValueOnce({
      metadata: "meta-data",
      imageMap: {},
    });

    const { dispatch, dispatchMock } = makeDispatch(() => ({}));

    await dispatch(imports.importFromFile());
    const dispatchCalls = [
      {
        type: "import-status",
        importing: true,
        statusMessage: "Starting import...",
        imageMap: undefined,
      },
      {
        type: "import-status",
        importing: true,
        statusMessage: "Importing pots...",
        imageMap: {},
      },
      "reload-from-import-fn",
      {
        type: "import-status",
        importing: false,
        statusMessage: "Finished import.",
      },
      {
        type: "page-list",
      },
    ];
    expect(dispatchMock.mock.calls).toEqual(dispatchCalls.map(a => [a]));
    expect(uploader.startFileImport).toHaveBeenCalled();
    expect(import_utils.importMetadataNow).toHaveBeenCalled();
    expect(import_utils.importImageRetrying).not.toHaveBeenCalled();
  });
})

describe('importFromUrl', () => {
  beforeEach(async () => await setupMocks());
  afterEach(() => jest.clearAllMocks());

  it('happy path', async () => {
    const { dispatch, dispatchMock } = makeDispatch(() => ({}));

    await dispatch(imports.importFromUrl("http://url.zip"));
    const dispatchCalls = [
      {
        type: "import-status",
        importing: true,
        statusMessage: "Starting import...",
        imageMap: undefined,
      },
      {
        type: "import-status",
        importing: true,
        statusMessage: "Importing pots...",
        imageMap: {
            "a.jpg": {uri: "http://s3/a.jpg"},
            "b.jpg": {uri: "http://s3/b.jpg"},
            "c.jpg": {uri: "http://s3/c.jpg"},
        },
      },
      "reload-from-import-fn",
      {
        type: "import-status",
        importing: true,
        statusMessage: "Importing images (0/3)",
        imageMap: {
          "a.jpg": {uri: "http://s3/a.jpg"},
          "b.jpg": {uri: "http://s3/b.jpg"},
          "c.jpg": {uri: "http://s3/c.jpg"},
        },
      },
      {
        type: "import-status",
        importing: true,
        statusMessage: "Importing images (1/3)",
        imageMap: {
          "b.jpg": {uri: "http://s3/b.jpg", started: true},
          "c.jpg": {uri: "http://s3/c.jpg"},
        },
      },
      {
        type: "import-status",
        importing: true,
        statusMessage: "Importing images (2/3)",
        imageMap: {
          "c.jpg": {uri: "http://s3/c.jpg", started: true},
        }
      },
      {
        type: "import-status",
        importing: true,
        statusMessage: "Importing images (3/3)",
        imageMap: {},
      },
      {
        type: "import-status",
        importing: false,
        statusMessage: "Finished import.",
      },
      {
        type: "page-list",
      },
    ];

    expect(dispatchMock.mock.calls).toEqual(dispatchCalls.map(a => [a]));
    expect(uploader.startUrlImport).toHaveBeenCalled();
    expect(import_utils.importMetadataNow).toHaveBeenNthCalledWith(1, "meta-data");

    expect(import_utils.importImageRetrying).toHaveBeenCalledTimes(3);
    expect(import_utils.importImageRetrying).toHaveBeenNthCalledWith(1, "http://s3/a.jpg", expect.any(Function));
    expect(import_utils.importImageRetrying).toHaveBeenNthCalledWith(2, "http://s3/b.jpg", expect.any(Function));
    expect(import_utils.importImageRetrying).toHaveBeenNthCalledWith(3, "http://s3/c.jpg", expect.any(Function));
  });

  it('cancels with prompt', async () => {
    import_utils.confirmImport.mockImplementationOnce(async (confirm, cancel) => await cancel());

    const { dispatch, dispatchMock } = makeDispatch(() => ({}));

    await dispatch(imports.importFromUrl("http://url.zip"));
    const dispatchCalls = [
      {
        type: "import-status",
        importing: true,
        statusMessage: "Starting import...",
        imageMap: undefined,
      },
      {
        type: "import-status",
        importing: false,
        statusMessage: "Cancelled import.",
      },
    ];
    expect(dispatchMock.mock.calls).toEqual(dispatchCalls.map(a => [a]));
    expect(uploader.startUrlImport).toHaveBeenCalled();
    expect(import_utils.importMetadataNow).not.toHaveBeenCalled();

  });

  it('fails with network error', async () => {
    uploader.startUrlImport.mockRejectedValueOnce('network error');

    const { dispatch, dispatchMock } = makeDispatch(() => ({}));

    await dispatch(imports.importFromUrl());
    const dispatchCalls = [
      {
        type: "import-status",
        importing: true,
        statusMessage: "Starting import...",
        imageMap: undefined,
      },
      {
        type: "import-status",
        importing: false,
        statusMessage: "Import failed.\nnetwork error",
      },
    ];
    expect(dispatchMock.mock.calls).toEqual(dispatchCalls.map(a => [a]));
    expect(uploader.startUrlImport).toHaveBeenCalled();
    expect(import_utils.importMetadataNow).not.toHaveBeenCalled();
  });
});

describe('resumeImport', () => {
  beforeEach(async () => await setupMocks());
  afterEach(() => jest.clearAllMocks());

  it('resumes happy path', async () => {
    const { dispatch, dispatchMock } = makeDispatch(() => ({
      imports: {
        resumable: {
          imageMap: {
            "b.jpg": {uri: "http://s3/b.jpg"},
            "c.jpg": {uri: "http://s3/c.jpg", started: true}, // "started" should be ignored
          }
        }
      }
    }));

    await dispatch(imports.resumeImport());
    const dispatchCalls = [
      { type: "import-resume-affirm" },
      {
        type: "import-status",
        importing: true,
        statusMessage: "Importing images (0/2)",
        imageMap: {
          "b.jpg": {uri: "http://s3/b.jpg"},
          "c.jpg": {uri: "http://s3/c.jpg"},
        },
      },
      {
        type: "import-status",
        importing: true,
        statusMessage: "Importing images (1/2)",
        imageMap: {
          "c.jpg": {uri: "http://s3/c.jpg", started: true},
        },
      },
      {
        type: "import-status",
        importing: true,
        statusMessage: "Importing images (2/2)",
        imageMap: {},
      },
      {
        type: "import-status",
        importing: false,
        statusMessage: "Finished import.",
      },
      {
        type: "page-list",
      },
    ];

    expect(dispatchMock.mock.calls).toEqual(dispatchCalls.map(a => [a]));
    expect(import_utils.importMetadataNow).not.toHaveBeenCalled();

    expect(import_utils.importImageRetrying).toHaveBeenCalledTimes(2);
    expect(import_utils.importImageRetrying).toHaveBeenNthCalledWith(1, "http://s3/b.jpg", expect.any(Function));
    expect(import_utils.importImageRetrying).toHaveBeenNthCalledWith(2, "http://s3/c.jpg", expect.any(Function));
  });
});
