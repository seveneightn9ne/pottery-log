import * as ImportStore from "../ImportStore";

describe("ImportStore", () => {

  it("initial state", () => {
    const initialState = ImportStore.getInitialState();
    expect(initialState).toEqual({ importing: false });
  });

  it("saves status", () => {
    const state = ImportStore.reduceImport(
      {
        importing: true,
        resumable: "something",
      },
      {
        type: "import-status",
        statusMessage: "foo",
        importing: true,
        imageMap: {foo: "bar"},
      }
    );
    expect(state).toHaveProperty("importing", true);
    expect(state).toHaveProperty("statusMessage", "foo");
    expect(state).toHaveProperty("imageMap", {foo: "bar"});
    expect(state).not.toHaveProperty("resumable")
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

  it("cancels resume", () => {
    const state = ImportStore.reduceImport(
      {
        importing: false,
        resumable: {some: ["resumable", "state"]},
      },
      {
        type: "import-resume-cancel"
      }
    );
    expect(state).toHaveProperty("importing", false);
    expect(state).not.toHaveProperty("resumable");
  });
});
