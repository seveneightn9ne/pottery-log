import * as ExportStore from "../ExportStore";
import * as exports from "../../utils/exports";

jest.mock("../../utils/exports");

describe("ExportStore", () => {
  afterEach(() => jest.clearAllMocks());

  it("initial state", () => {
    const initialState = ExportStore.getInitialState();
    expect(initialState).toEqual({ exporting: false });
  });

  it("initiate", () => {
    const state = ExportStore.reduceExport(
      { exporting: false },
      { type: "export-initiate" }
    );
    expect(state).toHaveProperty("exporting", true);
    expect(state).toHaveProperty("exportId");
    expect(exports.startExport).toHaveBeenCalled();
  });

  it("ignores wrong export id", () => {
    const initialState = { exporting: true, exportId: 1 };
    const state = ExportStore.reduceExport(initialState, {
      type: "export-failure",
      exportId: 2
    });
    expect(state).toEqual(initialState);
  });

  it("starts export on each image", () => {
    exports.exportImage.mockReturnValueOnce({ willExport: false });
    exports.exportImage.mockReturnValue({ willExport: true });

    const state = ExportStore.reduceExport(
      { exportId: 1, exporting: true },
      {
        type: "export-started",
        exportId: 1,
        images: {
          a: { fileUri: "a.png" },
          b: { fileUri: "b.png" },
          c: { fileUri: "c.png" }
        }
      }
    );
    expect(exports.exportImage).toBeCalledTimes(3);
    expect(state).toHaveProperty("totalImages", 2);
    expect(state).toHaveProperty("imagesExported", 0);
    expect(state).toHaveProperty("exportId", 1);
    expect(state).toHaveProperty("exporting", true);
    expect(state).toHaveProperty("exportingImages", true);
  });

  it("finishes export when there are no images", () => {
    const state = ExportStore.reduceExport(
      { exportId: 1, exporting: true },
      { type: "export-started", exportId: 1, images: {} }
    );
    expect(exports.finishExport).toHaveBeenCalled();
  });

  it("adds an exported image", () => {
    const state = ExportStore.reduceExport(
      {
        exportId: 1,
        exporting: true,
        exportingImages: true,
        imagesExported: 0,
        totalImages: 2
      },
      {
        type: "export-image"
      }
    );

    expect(exports.finishExport).not.toHaveBeenCalled();
    expect(state).toHaveProperty("imagesExported", 1);
    expect(state).toHaveProperty("totalImages", 2);
    expect(state).toHaveProperty("exportId", 1);
    expect(state).toHaveProperty("exporting", true);
  });

  it("finishes export", () => {
    const state = ExportStore.reduceExport(
      {
        exportId: 1,
        exporting: true,
        exportingImages: true,
        imagesExported: 1,
        totalImages: 2
      },
      {
        type: "export-image"
      }
    );

    expect(exports.finishExport).toHaveBeenCalled();
    expect(state).toHaveProperty("imagesExported", 2);
    expect(state).toHaveProperty("totalImages", 2);
    expect(state).toHaveProperty("exportId", 1);
    expect(state).toHaveProperty("exporting", true);
    expect(state).not.toHaveProperty("exportingImages", true);
  });

  it("skips an image when not exportingImages", () => {
    const state = ExportStore.reduceExport(
      {
        exportId: 1,
        exporting: true,
        imagesExported: 2,
        totalImages: 2
      },
      {
        type: "export-image"
      }
    );

    expect(exports.finishExport).not.toHaveBeenCalled();
    expect(state).toHaveProperty("imagesExported", 2);
    expect(state).toHaveProperty("totalImages", 2);
    expect(state).toHaveProperty("exportId", 1);
    expect(state).toHaveProperty("exporting", true);
    expect(state).not.toHaveProperty("exportingImages", false);
  });

  it("enqueues a new image", () => {
    exports.exportImage.mockReturnValue({ willExport: true });

    const state = ExportStore.reduceExport(
      {
        exportId: 1,
        exporting: true,
        exportingImages: true,
        imagesExported: 1,
        totalImages: 2
      },
      {
        type: "image-file-created",
        fileUri: "z.png"
      }
    );

    expect(exports.exportImage).toHaveBeenCalled();
    expect(state).toHaveProperty("totalImages", 3);
    expect(state).toHaveProperty("imagesExported", 1);
    expect(state).toHaveProperty("exportId", 1);
    expect(state).toHaveProperty("exporting", true);
    expect(state).toHaveProperty("exportingImages", true);
  });

  it("returns uri after finishing", () => {
    const state = ExportStore.reduceExport(
      {
        exportId: 1,
        exporting: true
      },
      {
        type: "export-finished",
        uri: "export-uri"
      }
    );

    expect(state).toHaveProperty("exporting", false);
    expect(state).toHaveProperty("exportUri", "export-uri");
  });

  it("cancels on error", () => {
    const state = ExportStore.reduceExport(
      {
        exportId: 1,
        exporting: true,
        exportingImages: true,
        imagesExported: 1,
        totalImages: 2
      },
      {
        type: "export-failure",
        error: "unknown"
      }
    );

    expect(state).toHaveProperty("exporting", false);
  });

  it("cancels on navigation", () => {
    const state = ExportStore.reduceExport(
      {
        exportId: 1,
        exporting: true
      },
      {
        type: "page-list"
      }
    );

    expect(state).toEqual(ExportStore.getInitialState());
  });

  it("resets on settings navigation", () => {
    const state = ExportStore.reduceExport(
      {
        exportId: 1,
        exporting: true
      },
      {
        type: "page-settings"
      }
    );

    expect(state).toEqual(ExportStore.getInitialState());
  });
});
