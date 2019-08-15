import * as ExportStore from "../ExportStore";
import * as exports from "../../utils/exports";

jest.mock("react-native-appearance");
jest.mock("../../utils/exports");

describe("ExportStore", () => {
  it("initial state", () => {
    const initialState = ExportStore.getInitialState();
    expect(initialState).toEqual({ exporting: false });
  });

  it("starts an export", () => {
    const state = ExportStore.reduceExport(ExportStore.getInitialState(), {
      type: "export-status",
      exportId: 1,
      exporting: true,
      status: "starting"
    });
    expect(state).toEqual({
      exporting: true,
      exportId: 1,
      statusMessage: "starting"
    });
  });

  it("updates status", () => {
    const initialState = {
      exporting: true,
      exportId: 1,
      statusMessage: "Starting"
    };
    const state = ExportStore.reduceExport(initialState, {
      type: "export-status",
      exportId: 1,
      exporting: true,
      status: "middle"
    });
    expect(state).toEqual({
      exporting: true,
      exportId: 1,
      statusMessage: "middle"
    });
  });

  it("finishes an export", () => {
    const initialState = {
      exporting: true,
      exportId: 1,
      statusMessage: "status"
    };
    const state = ExportStore.reduceExport(initialState, {
      type: "export-finished",
      exportId: 1,
      uri: "uri.com"
    });
    expect(state).toEqual({
      exporting: false,
      exportId: 1,
      exportUri: "uri.com",
      statusMessage: "Export finished!"
    });
  });

  it("handles failure", () => {
    const initialState = {
      exporting: true,
      exportId: 1,
      statusMessage: "status"
    };
    const state = ExportStore.reduceExport(initialState, {
      type: "export-status",
      exporting: false,
      exportId: 1,
      status: "failure"
    });
    expect(state).toEqual({
      exporting: false,
      exportId: 1,
      statusMessage: "failure"
    });
  });

  it("ignores failure after finished", () => {
    const initialState = {
      exporting: false,
      exportId: 1,
      exportUri: "foo.com",
      statusMessage: "All good"
    };
    const state = ExportStore.reduceExport(initialState, {
      type: "export-status",
      exporting: false,
      exportId: 1,
      status: "failure"
    });
    expect(state).toEqual(initialState);
  });

  it("ignores wrong export id", () => {
    const initialState = { exporting: true, exportId: 1 };
    const state = ExportStore.reduceExport(initialState, {
      type: "export-status",
      exportId: 2,
      status: "Don't want to see this"
    });
    expect(state).toEqual(initialState);
  });

  it("ignores status updates after failure", () => {
    const initialState = {
      exporting: false,
      exportId: 1,
      statusMessage: "Failed"
    };
    const state = ExportStore.reduceExport(initialState, {
      type: "export-status",
      exportId: 1,
      status: "Everything is OK"
    });
    expect(state).toEqual(initialState);
  });

  it("ignores status updates after finish", () => {
    const initialState = {
      exporting: false,
      exportId: 1,
      exportUri: "foo.com",
      statusMessage: "finished"
    };
    const state = ExportStore.reduceExport(initialState, {
      type: "export-status",
      exportId: 1,
      statusMessage: "woop de doo"
    });
    expect(state).toEqual(initialState);
  });

  it("resets on navigation", () => {
    const state = ExportStore.reduceExport(
      {
        exportId: 1,
        exporting: true
      },
      {
        type: "page-list"
      }
    );

    expect(state).toEqual({
      exporting: false,
      exportId: 1
    });
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

    expect(state).toEqual({
      exporting: false,
      exportId: 1
    });
  });
});
