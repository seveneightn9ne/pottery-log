import * as uploader from "../../utils/uploader";
import * as exports from "../export";

jest.mock("../../utils/uploader", () => ({
  startExport: jest.fn().mockResolvedValue(),
  exportImage: jest.fn().mockResolvedValue(),
  finishExport: jest.fn().mockResolvedValue("https://export-file-uri"),
  debug: jest.fn()
}));
jest.mock("../../utils/exports", () => ({
  ...jest.requireActual("../../utils/exports"),
  isStillExporting: jest.fn().mockReturnValue(true)
}));
jest.mock("expo-file-system", () => ({
  getInfoAsync: jest.fn().mockReturnValue(Promise.resolve({ exists: true }))
}));

describe("exportEverything", () => {
  afterEach(() => jest.clearAllMocks());

  it("happy path", async () => {
    const { dispatch, dispatchMock } = makeDispatch(() => {
      return {
        exports: { exporting: true },
        images: {
          images: {
            "1.jpg": {
              name: "1.jpg",
              fileUri: "f/1.jpg"
            },
            "2.jpg": {
              name: "2.jpg",
              fileUri: "f/2.jpg"
            }
          }
        }
      };
    });
    await dispatch(exports.exportEverything());
    const dispatchCalls = [
      {
        type: "export-status",
        exportId: expect.any(Number),
        exporting: true,
        status: "Starting export..."
      },
      {
        type: "export-status",
        exportId: expect.any(Number),
        exporting: true,
        status: "Exporting images (0/2)..."
      },
      {
        type: "export-status",
        exportId: expect.any(Number),
        exporting: true,
        status: "Exporting images (1/2)..."
      },
      {
        type: "export-status",
        exportId: expect.any(Number),
        exporting: true,
        status: "Exporting images (2/2)..."
      },
      {
        type: "export-status",
        exportId: expect.any(Number),
        exporting: true,
        status: "Finishing export..."
      },
      {
        type: "export-finished",
        exportId: expect.any(Number),
        uri: "https://export-file-uri"
      }
    ];
    expect(dispatchMock.mock.calls).toEqual(dispatchCalls.map(a => [a]));
    expect(uploader.startExport).toHaveBeenCalled();
    expect(uploader.exportImage).toHaveBeenCalledWith("f/1.jpg");
    expect(uploader.exportImage).toHaveBeenCalledWith("f/2.jpg");
    expect(uploader.finishExport).toHaveBeenCalled();
  });

  it("finishes when there are no images", async () => {
    const { dispatch, dispatchMock } = makeDispatch(() => {
      return {
        exports: { exporting: true },
        images: { images: {} }
      };
    });
    await dispatch(exports.exportEverything());

    const dispatchCalls = [
      {
        type: "export-status",
        exportId: expect.any(Number),
        exporting: true,
        status: "Starting export..."
      },
      {
        type: "export-status",
        exportId: expect.any(Number),
        exporting: true,
        status: "Finishing export..."
      },
      {
        type: "export-finished",
        exportId: expect.any(Number),
        uri: "https://export-file-uri"
      }
    ];
    expect(dispatchMock.mock.calls).toEqual(dispatchCalls.map(a => [a]));
    expect(uploader.startExport).toHaveBeenCalled();
    expect(uploader.finishExport).toHaveBeenCalled();
  });

  it("Saves and exports images with no files", () => {});

  it("discards images with no image", () => {});

  it("cancels on start-export error", () => {});

  it("cancels on export-image error", () => {});

  it("cancels on finish-export error", () => {});

  it("cancels on navigate to list", () => {});
});
