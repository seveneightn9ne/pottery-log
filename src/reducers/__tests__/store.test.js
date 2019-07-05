import store from "../store";
import { StorageWriter } from "../../utils/sync";
import { loadInitial } from "../../thunks/loadInitial";

jest.mock("../../utils/sync", () => ({
  StorageWriter: {
    put: jest.fn()
  }
}));

describe("store", () => {
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
});
