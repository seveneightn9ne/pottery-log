import { StorageWriter } from "../../utils/sync";
import {
  subscribeToPersistPotStore,
  subscribeToPersistImageStore
} from "../persist";
import { newPot } from "../../models/Pot";

jest.mock("../../utils/sync", () => ({
  StorageWriter: {
    put: jest.fn()
  }
}));

function initialState() {
  return {
    pots: {
      hasLoaded: false,
      potIds: [],
      pots: {}
    },
    images: {
      loaded: false,
      images: {}
    }
  };
}

function stateWithPot() {
  state = initialState();
  const pot = newPot();
  state.pots.pots = {
    [pot.uuid]: pot
  };
  (state.pots.potIds = [pot.uuid]), (state.hasLoaded = true);
  state.pots.hasLoaded = true;
  return state;
}

function stateWithImage() {
  state = initialState();
  state.images.loaded = true;
  state.images.images = {
    "1.png": {
      localUri: "1.png",
      name: "1.png",
      pots: ["1"]
    }
  };
  return state;
}

function mockStoreAndSubscribe(oldState, newState, subscriber) {
  let hasSentOldState = false;
  let fn = null;
  const store = {
    getState: () => {
      const state = hasSentOldState ? newState : oldState;
      hasSentOldState = true;
      return state;
    },
    subscribe: f => (fn = f),
    run: () => {
      if (fn === null) {
        throw Error("Running before subscription");
      }
      fn();
    }
  };
  subscriber(store);
  expect(fn).not.toBeNull();
  fn();
  fn();
  jest.runAllTimers();
  return store;
}

describe("subscribeToPersistImageStore", () => {
  jest.useFakeTimers();
  afterEach(() => jest.clearAllMocks());

  it("doesn't persist initial state", () => {
    mockStoreAndSubscribe(
      initialState(),
      initialState(),
      subscribeToPersistImageStore
    );
    expect(StorageWriter.put).not.toHaveBeenCalled();
  });

  it("persists a new state", () => {
    const newState = stateWithImage();
    mockStoreAndSubscribe(
      initialState(),
      newState,
      subscribeToPersistImageStore
    );
    expect(StorageWriter.put).toHaveBeenCalledWith(
      "@ImageStore",
      JSON.stringify(newState.images)
    );
  });

  it("doesn't persist a reset state", () => {
    const prevState = stateWithImage();
    mockStoreAndSubscribe(
      prevState,
      initialState(),
      subscribeToPersistImageStore
    );
    expect(StorageWriter.put).not.toHaveBeenCalled();
  });

  it("persists a modified image store", () => {
    const prevState = stateWithImage();
    const newState = {
      ...prevState,
      images: {
        ...prevState.images
        // Don't actually need to modify anything to trigger persist
      }
    };
    mockStoreAndSubscribe(prevState, newState, subscribeToPersistImageStore);
    expect(StorageWriter.put).toHaveBeenCalledWith(
      "@ImageStore",
      JSON.stringify(newState.images)
    );
  });

  it("persists a loaded empty state", () => {
    const prevState = stateWithImage();
    const newState = initialState();
    newState.images.loaded = true;
    mockStoreAndSubscribe(prevState, newState, subscribeToPersistImageStore);
    expect(StorageWriter.put).toHaveBeenCalledWith(
      "@ImageStore",
      JSON.stringify(newState.images)
    );
  });

  it("does not persist unchanged state", () => {
    const prevState = stateWithImage();
    const newState = {
      ...prevState,
      images: prevState.images,
      pots: { ...prevState.pots }
    };
    mockStoreAndSubscribe(prevState, newState, subscribeToPersistImageStore);
    expect(StorageWriter.put).not.toHaveBeenCalled();
  });
});

describe("subscribeToPersistPots", () => {
  jest.useFakeTimers();
  afterEach(() => jest.clearAllMocks());

  it("doesn't persist initial state", () => {
    mockStoreAndSubscribe(
      initialState(),
      initialState(),
      subscribeToPersistPotStore
    );
    expect(StorageWriter.put).not.toHaveBeenCalled();
  });

  it("persists a new state", () => {
    const newState = stateWithPot();
    mockStoreAndSubscribe(initialState(), newState, subscribeToPersistPotStore);
    expect(StorageWriter.put).toHaveBeenNthCalledWith(
      1,
      "@Pots",
      JSON.stringify(newState.pots.potIds)
    );
    expect(StorageWriter.put).toHaveBeenNthCalledWith(
      2,
      "@Pot:" + newState.pots.potIds[0],
      JSON.stringify(newState.pots.pots[newState.pots.potIds[0]])
    );
  });

  it("doesn't persist a reset state", () => {
    const prevState = stateWithPot();
    mockStoreAndSubscribe(
      prevState,
      initialState(),
      subscribeToPersistPotStore
    );
    expect(StorageWriter.put).not.toHaveBeenCalled();
  });

  it("persists a modified pot", () => {
    const prevState = stateWithPot();
    const potId = prevState.pots.potIds[0];
    const newState = {
      ...prevState,
      pots: {
        ...prevState.pots,
        pots: {
          ...prevState.pots.pots,
          [potId]: { ...prevState.pots.pots[potId], title: "has changed" }
        }
      }
    };
    mockStoreAndSubscribe(prevState, newState, subscribeToPersistPotStore);
    expect(StorageWriter.put).toHaveBeenNthCalledWith(
      1,
      "@Pots",
      JSON.stringify(newState.pots.potIds)
    );
    expect(StorageWriter.put).toHaveBeenNthCalledWith(
      2,
      "@Pot:" + potId,
      JSON.stringify(newState.pots.pots[potId])
    );
  });

  it("persists a loaded empty state", () => {
    const prevState = stateWithPot();
    const newState = initialState();
    newState.pots.hasLoaded = true;
    mockStoreAndSubscribe(prevState, newState, subscribeToPersistPotStore);
    expect(StorageWriter.put).toHaveBeenNthCalledWith(
      1,
      "@Pots",
      JSON.stringify([])
    );
    expect(StorageWriter.put).toHaveBeenCalledTimes(1);
  });

  it("does not persist unchanged state", () => {
    const prevState = stateWithPot();
    const newState = { ...prevState, pots: prevState.pots };
    mockStoreAndSubscribe(prevState, newState, subscribeToPersistPotStore);
    expect(StorageWriter.put).not.toHaveBeenCalled();
  });
});
