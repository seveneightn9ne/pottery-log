import store from "../store";
import { StorageWriter } from "../../utils/sync";
import { loadInitial } from "../../thunks/loadInitial";

jest.mock("../../utils/sync", () => ({
  StorageWriter: {
    put: jest.fn()
  }
}));

jest.mock("expo", () => ({
  FileSystem: {
    makeDirectoryAsync: jest.fn(() => Promise.resolve())
  },
  Constants: {}
}));

describe("store", () => {
  afterEach(() => {
    jest.clearAllMocks();
    store.dispatch({
      type: "initial-pots-images"
    });
  });

  it("persists pots", async () => {
    jest.useFakeTimers();
    await store.dispatch(loadInitial());
    expect(StorageWriter.put).not.toHaveBeenCalled();
    store.dispatch({
      type: "new"
    });
    jest.runAllTimers();
    expect(StorageWriter.put).toHaveBeenCalledWith("@Pots", expect.anything());
  });

  it("persists images", async () => {
    jest.useFakeTimers();
    await store.dispatch(loadInitial());
    expect(StorageWriter.put).not.toHaveBeenCalled();
    await store.dispatch({
      type: "image-add",
      potId: "1",
      localUri: "image.jpg"
    });
    jest.runAllTimers();
    expect(StorageWriter.put).toHaveBeenCalledWith(
      "@ImageStore",
      expect.anything()
    );
  });
});
