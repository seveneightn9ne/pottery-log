import { AsyncStorage } from "react-native";
import * as exports from "../../utils/exports";
import * as ImportStore from "../ImportStore";
import { StorageWriter } from "../../utils/sync";

jest.mock("react-native-appearance");
jest.mock("../../utils/exports");
jest.mock("../../utils/sync", () => ({
  StorageWriter: {
    put: jest.fn(),
    delete: jest.fn()
  }
}));
jest.mock("../../reducers/store", () => ({
  dispatch: jest.fn()
}));
jest.mock("../../utils/exports");
jest.useFakeTimers();

describe("ImportStore", () => {
  afterEach(() => jest.clearAllMocks());

  it("initial state", () => {
    const initialState = ImportStore.getInitialState();
    expect(initialState).toEqual({ importing: false });
  });

  it("initiate", () => {
    const state = ImportStore.reduceImport(
      { importing: false },
      { type: "import-initiate" }
    );
    expect(state).toHaveProperty("importing", true);
    expect(exports.startImport).toHaveBeenCalled();
  });

  it("imports metadata", () => {
    const metadata = "some-metadata";
    const state = ImportStore.reduceImport(
      {
        importing: true
      },
      {
        type: "import-started",
        metadata,
        imageMap: { a: "a.png" }
      }
    );

    expect(exports.importMetadataNow).toHaveBeenCalledWith(metadata);
    expect(state).toHaveProperty("importing", true);
    expect(state).toHaveProperty("imageMap", { a: { uri: "a.png" } });
  });

  it("imports first 2 images", () => {
    const state = ImportStore.reduceImport(
      {
        importing: true,
        imageMap: {
          a: { uri: "a.png" },
          b: { uri: "b.png" },
          c: { uri: "c.png" },
          d: { uri: "d.png" }
        }
      },
      {
        type: "imported-metadata"
      }
    );

    expect(exports.importImage).toHaveBeenCalledTimes(
      ImportStore.PARALLEL_IMAGE_IMPORTS
    );
    expect(state).toHaveProperty("totalImages", 4);
    expect(state).toHaveProperty("imagesImported", 0);
  });

  it("finishes import with no images", () => {
    const state = ImportStore.reduceImport(
      {
        importing: true,
        imageMap: {}
      },
      {
        type: "imported-metadata"
      }
    );

    expect(state).toHaveProperty("importing", false);
  });

  it("starts a new image after one finishes", () => {
    const state = ImportStore.reduceImport(
      {
        importing: true,
        imagesImported: 0,
        totalImages: 4,
        imageMap: {
          a: { uri: "a.png", started: true },
          b: { uri: "b.png", started: true },
          c: { uri: "c.png", started: true },
          d: { uri: "d.png" }
        }
      },
      {
        type: "image-file-created",
        name: "a"
      }
    );

    expect(exports.importImage).toHaveBeenCalledTimes(1);
    expect(exports.importImage).toHaveBeenCalledWith("d.png");
    expect(state).toHaveProperty("imagesImported", 1);
    expect(state.imageMap).not.toHaveProperty("a");
  });

  it("doesn't start an import when the rest are done", () => {
    const state = ImportStore.reduceImport(
      {
        importing: true,
        imagesImported: 0,
        totalImages: 3,
        imageMap: {
          a: { uri: "a.png", started: true },
          b: { uri: "b.png", started: true },
          c: { uri: "c.png", started: true }
        }
      },
      {
        type: "image-file-created",
        name: "a"
      }
    );

    expect(exports.importImage).not.toHaveBeenCalled();
    expect(state).toHaveProperty("imagesImported", 1);
    expect(state.imageMap).not.toHaveProperty("a");
  });

  it("finishes after all images imported", () => {
    const state = ImportStore.reduceImport(
      {
        importing: true,
        imagesImported: 3,
        totalImages: 4,
        imageMap: {
          a: { uri: "a.png", started: true }
        }
      },
      {
        type: "image-file-created",
        name: "a"
      }
    );

    expect(state).toHaveProperty("importing", false);
  });

  it("retries a failed image", () => {
    const state = ImportStore.reduceImport(
      {
        importing: true,
        imagesImported: 0,
        totalImages: 1,
        imageMap: { "a.png": { uri: "r/a.png", started: true } }
      },
      {
        type: "image-file-failed",
        uri: "r/a.png"
      }
    );

    expect(exports.importImage).toHaveBeenCalledWith("r/a.png");
  });

  it("doesn't retry a failed image not in map", () => {
    const state = ImportStore.reduceImport(
      {
        importing: true,
        imagesImported: 0,
        totalImages: 1,
        imageMap: { "b.png": { uri: "r/b.png", started: true } }
      },
      {
        type: "image-file-failed",
        uri: "r/a.png"
      }
    );

    expect(exports.importImage).not.toHaveBeenCalled();
  });

  it("retries a timeout", () => {
    const state = ImportStore.reduceImport(
      {
        importing: true,
        imagesImported: 0,
        totalImages: 1,
        imageMap: { "a.png": { uri: "r/a.png", started: true } }
      },
      {
        type: "image-timeout",
        uri: "r/a.png"
      }
    );

    expect(exports.importImage).toHaveBeenCalledWith("r/a.png");
  });

  it("doesn't retry a finished one", () => {
    const state = ImportStore.reduceImport(
      {
        importing: true,
        imagesImported: 0,
        totalImages: 1,
        imageMap: { "a.png": { uri: "r/a.png", started: true } }
      },
      {
        type: "image-timeout",
        uri: "r/b.png"
      }
    );

    expect(exports.importImage).not.toHaveBeenCalled();
  });

  it("cancels", () => {
    const state = ImportStore.reduceImport(
      {
        importing: true,
        imagesImported: 0,
        totalImages: 1,
        imageMap: { "a.png": { uri: "r/a.png", started: true } }
      },
      {
        type: "import-cancel"
      }
    );
    expect(state).toEqual({ importing: false });
  });

  it("cancels on error", () => {
    const state = ImportStore.reduceImport(
      {
        importing: true,
        imagesImported: 0,
        totalImages: 1,
        imageMap: { "a.png": { uri: "r/a.png", started: true } }
      },
      {
        type: "import-failure",
        error: "unknown"
      }
    );
    expect(state).toHaveProperty("importing", false);
  });

  it("doesn't cancel on navigation", () => {
    const prevState = {
      importing: true,
      imagesImported: 0,
      totalImages: 1,
      imageMap: { "a.png": { uri: "r/a.png", started: true } }
    };
    const state = ImportStore.reduceImport(prevState, {
      type: "page-settings"
    });
    expect(state).toEqual(prevState);
  });

  it("doesn't cancel on list navigation", () => {
    const prevState = {
      importing: true,
      imagesImported: 0,
      totalImages: 1,
      imageMap: { "a.png": { uri: "r/a.png", started: true } }
    };
    const state = ImportStore.reduceImport(prevState, {
      type: "page-list"
    });
    expect(state).toEqual(prevState);
  });

  it("starts URL import", () => {
    const url = "url.com";
    const state = ImportStore.reduceImport(
      { importing: false },
      {
        type: "import-initiate-url",
        url
      }
    );
    expect(state).toHaveProperty("importing", true);
    expect(exports.startUrlImport).toHaveBeenCalledWith(url);
  });

  it("handles resume initiation", () => {
    const resumableState = {
      importing: true,
      imagesImported: 0,
      totalImages: 1,
      imageMap: { "a.png": { uri: "r/a.png" } }
    };
    const state = ImportStore.reduceImport(
      { importing: false },
      {
        type: "import-resume",
        data: resumableState
      }
    );
    expect(state).toHaveProperty("importing", false);
    expect(state).toHaveProperty("resumable", resumableState);
  });

  it("does resume", () => {
    const resumableState = {
      importing: true,
      imagesImported: 0,
      totalImages: 1,
      imageMap: { "a.png": { uri: "r/a.png" } }
    };
    const state = ImportStore.reduceImport(
      {
        importing: false,
        resumable: resumableState
      },
      { type: "import-resume-affirm" }
    );
    const expectedState = {
      importing: true,
      imagesImported: 0,
      totalImages: 1,
      imageMap: { "a.png": { uri: "r/a.png", started: true } }
    };
    expect(state).toEqual(expectedState);
    expect(exports.importImage).toHaveBeenCalledWith("r/a.png");
  });

  it("does resume with parallelism", () => {
    const resumableState = {
      importing: true,
      imagesImported: 1,
      totalImages: 3,
      imageMap: {
        "b.png": { uri: "r/b.png" },
        "c.png": { uri: "r/c.png", started: true }
      }
    };
    const state = ImportStore.reduceImport(
      {
        importing: false,
        resumable: resumableState
      },
      { type: "import-resume-affirm" }
    );
    const expectedState = {
      importing: true,
      imagesImported: 1,
      totalImages: 3,
      imageMap: {
        "b.png": { uri: "r/b.png", started: true },
        "c.png": { uri: "r/c.png", started: true }
      }
    };
    expect(state).toEqual(expectedState);

    expect(exports.importImage).toHaveBeenCalledWith("r/b.png");
    expect(exports.importImage).toHaveBeenCalledWith("r/c.png");
  });

  it("aborts resume", () => {
    // TODO import-resume-cancel
  });
  /*
            case 'import-initiate-url': {
                startUrlImport(action.url);
                return {
                    importing: true,
                    statusMessage: 'Starting import...',
                };
            }
            case 'import-resume': {
                return {
                    importing: false,
                    resumable: action.data,
                }
            }
            case 'import-resume-affirm': {
                if (!state.resumable) {
                    return state;
                }
                const newState = this.resume(state.resumable);
                this.persist(newState);
                return newState;
            }
            case 'import-resume-cancel': {
                const newState = {
                    importing: false,
                };
                this.persist(newState);
                return newState;
            }*/
});
