import * as uploader from "../../utils/uploader";
import * as exports from "../export";

jest.mock("../../utils/uploader", () => ({
  startExport: jest.fn().mockResolvedValue(),
  finishExport: jest.fn().mockResolvedValue("https://export-file-uri"),
  debug: jest.fn()
}));
jest.mock("../../utils/exports", () => ({
  ...jest.requireActual("../../utils/exports"),
  isStillExporting: jest.fn().mockReturnValue(true)
}));

describe("exportEverything", () => {
  afterEach(() => jest.clearAllMocks());

  it("happy path", async () => {});

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
      /*{
                type: 'export-status',
                exportId: expect.any(String),
                exporting: true,
                status: 'Saving 0 images...',
            },*/
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
  });

  it("Saves and exports images with no files", () => {});

  it("discards images with no image", () => {});

  it("cancels on start-export error", () => {});

  it("cancels on export-image error", () => {});

  it("cancels on finish-export error", () => {});

  it("cancels on navigate to list", () => {});
});
