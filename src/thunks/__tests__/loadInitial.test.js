import { loadInitial } from "../loadInitial";
import { AsyncStorage } from "react-native";
import { newPot } from "../../models/Pot";

jest.mock("AsyncStorage");

const emptyPotState = {
  potIds: [],
  pots: {},
  hasLoaded: true
};

const emptyImageState = {
  images: {},
  loaded: true
};

function mockAsyncStorage(kvs) {
  AsyncStorage.getItem.mockReturnValueOnce(
    Promise.resolve(kvs["@ImageStore"] || null)
  );
  AsyncStorage.getAllKeys.mockReturnValue(Promise.resolve(Object.keys(kvs)));
  const potKvs = Object.keys(kvs)
    .filter(k => k.startsWith("@Pot"))
    .map(k => [k, kvs[k]]);
  AsyncStorage.multiGet.mockReturnValue(Promise.resolve(potKvs));
  AsyncStorage.getItem.mockReturnValueOnce(
    Promise.resolve(kvs["@Import"] || null)
  );
}

describe("loadInitial", () => {
  afterEach(() => jest.clearAllMocks());

  it("accepts empty state", async () => {
    const dispatch = jest.fn();
    mockAsyncStorage({});
    await loadInitial()(dispatch);
    expect(dispatch).toHaveBeenCalledWith({
      type: "loaded-everything",
      pots: emptyPotState,
      images: emptyImageState,
      isImport: false
    });
    expect(dispatch).toHaveBeenCalledTimes(1);
  });

  it("ignores unexpected values", async () => {
    const dispatch = jest.fn();
    mockAsyncStorage({ "what is this": "who knows" });
    await loadInitial()(dispatch);
    expect(dispatch).toHaveBeenCalledWith({
      type: "loaded-everything",
      pots: emptyPotState,
      images: emptyImageState,
      isImport: false
    });
    expect(dispatch).toHaveBeenCalledTimes(1);
  });

  it("loads pots with no images", async () => {
    const dispatch = jest.fn();
    const pot1 = newPot();
    pot1.title = "the first pot is the best pot";
    const pot2 = newPot();
    mockAsyncStorage({
      "@Pots": JSON.stringify(["1", "2"]),
      "@Pot:1": JSON.stringify(pot1),
      "@Pot:2": JSON.stringify(pot2)
    });
    await loadInitial()(dispatch);
    expect(dispatch).toHaveBeenCalledWith({
      type: "loaded-everything",
      pots: {
        potIds: ["1", "2"],
        pots: {
          "1": pot1,
          "2": pot2
        },
        hasLoaded: true
      },
      images: emptyImageState,
      isImport: false
    });
  });

  it("loads pots with images", async () => {
    const dispatch = jest.fn();
    const pot1 = newPot();
    pot1.title = "the first pot is the best pot";
    pot1.images3 = ["img.jpg"];
    const pot2 = newPot();
    const imageStore = {
      images: {
        "img.jpg": {
          name: "img.jpg",
          fileUri: "f/img.jpg",
          pots: [pot1.uuid]
        }
      },
      loaded: true
    };
    mockAsyncStorage({
      "@Pots": JSON.stringify(["1", "2"]),
      "@Pot:1": JSON.stringify(pot1),
      "@Pot:2": JSON.stringify(pot2),
      "@ImageStore": JSON.stringify(imageStore)
    });
    await loadInitial()(dispatch);
    expect(dispatch).toHaveBeenCalledWith({
      type: "loaded-everything",
      pots: {
        potIds: ["1", "2"],
        pots: {
          "1": pot1,
          "2": pot2
        },
        hasLoaded: true
      },
      images: imageStore,
      isImport: false
    });
  });

  it("loads pot with old images", async () => {
    const dispatch = jest.fn();
    const pot1 = newPot();
    pot1.title = "the first pot is the best pot";
    delete pot1.images3;
    pot1.images = ["l/img.jpg"];
    const pot2 = newPot();
    mockAsyncStorage({
      "@Pots": JSON.stringify(["1", "2"]),
      "@Pot:1": JSON.stringify(pot1),
      "@Pot:2": JSON.stringify(pot2)
    });
    delete pot1.images;
    pot1.images3 = ["img.jpg"];
    await loadInitial()(dispatch);
    expect(dispatch).toHaveBeenCalledWith({
      type: "loaded-everything",
      pots: {
        potIds: ["1", "2"],
        pots: {
          "1": pot1,
          "2": pot2
        },
        hasLoaded: true
      },
      images: {
        images: {
          "img.jpg": {
            name: "img.jpg",
            localUri: "l/img.jpg",
            pots: [pot1.uuid]
          }
        },
        loaded: true
      },
      isImport: false
    });
  });

  it("loads pot with images2 that was already migrated", async () => {
    const dispatch = jest.fn();
    const pot1 = newPot();
    pot1.title = "the first pot is the best pot";
    delete pot1.images3;
    pot1.images = ["l/img.jpg"];
    const pot2 = newPot();
    const imageState = {
      images: {
        "img.jpg": {
          name: "img.jpg",
          localUri: "l/img.jpg",
          pots: [pot1.uuid]
        }
      },
      loaded: true
    };
    mockAsyncStorage({
      "@Pots": JSON.stringify(["1", "2"]),
      "@Pot:1": JSON.stringify(pot1),
      "@Pot:2": JSON.stringify(pot2),
      "@ImageState": JSON.stringify(imageState)
    });
    delete pot1.images;
    pot1.images3 = ["img.jpg"];
    await loadInitial()(dispatch);
    expect(dispatch).toHaveBeenCalledWith({
      type: "loaded-everything",
      pots: {
        potIds: ["1", "2"],
        pots: {
          "1": pot1,
          "2": pot2
        },
        hasLoaded: true
      },
      images: imageState,
      isImport: false
    });
  });

  it("resumes import", async () => {
    expect.assertions(1);
    const existingState = {
      importing: true,
      imagesImported: 0,
      totalImages: 1,
      imageMap: { "a.png": { uri: "r/a.png" } }
    };
    const dispatch = jest.fn();
    mockAsyncStorage({ "@Import": JSON.stringify(existingState) });

    await loadInitial()(dispatch);
    expect(dispatch).toHaveBeenCalledWith({
      type: "import-resume",
      data: existingState
    });
    // Wrong:
    //expect(exports.importImage).toHaveBeenCalledTimes(1);
    //expect(exports.importImage).toHaveBeenCalledWith('r/a.png');
  });
});
