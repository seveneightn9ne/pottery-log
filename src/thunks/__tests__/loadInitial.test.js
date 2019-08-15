import {
  loadInitial,
  _fixPotsAndImages,
  _saveImagesToFiles
} from "../loadInitial";
import { AsyncStorage } from "react-native";
import { newPot } from "../../models/Pot";
import { saveToFile } from "../images";

jest.mock("AsyncStorage");
jest.mock("expo-file-system", () => ({
  documentDirectory: "file://mock-document-directory/",
  makeDirectoryAsync: jest.fn().mockReturnValue(Promise.resolve()),
  copyAsync: jest.fn().mockReturnValue(Promise.resolve()),
  deleteAsync: jest.fn().mockReturnValue(Promise.resolve())
}));
jest.mock("expo-constants", () => ({
  appOwnership: "expo"
}));
jest.mock("../images", () => ({
  saveToFile: jest.fn().mockReturnValue(Promise.resolve())
}));

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

function somePots() {
  const p1 = newPot();
  const p2 = newPot();
  return {
    hasLoaded: true,
    potIds: [p1.uuid, p2.uuid],
    pots: {
      [p1.uuid]: p1,
      [p2.uuid]: p2
    }
  };
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

  it("ignores deleted pots", async () => {
    const dispatch = jest.fn();
    const pot1 = newPot();
    pot1.title = "the first pot is the best pot";
    const pot2 = newPot();
    mockAsyncStorage({
      "@Pots": JSON.stringify([pot1.uuid]),
      ["@Pot:" + pot1.uuid]: JSON.stringify(pot1),
      ["@Pot:" + pot2.uuid]: JSON.stringify(pot2)
    });
    await loadInitial()(dispatch);
    expect(dispatch).toHaveBeenCalledWith({
      type: "loaded-everything",
      pots: {
        potIds: [pot1.uuid],
        pots: {
          [pot1.uuid]: pot1
        },
        hasLoaded: true
      },
      images: emptyImageState,
      isImport: false
    });
  });

  it("loads pots with no images", async () => {
    const dispatch = jest.fn();
    const pot1 = newPot();
    pot1.title = "the first pot is the best pot";
    const pot2 = newPot();
    mockAsyncStorage({
      "@Pots": JSON.stringify([pot1.uuid, pot2.uuid]),
      ["@Pot:" + pot1.uuid]: JSON.stringify(pot1),
      ["@Pot:" + pot2.uuid]: JSON.stringify(pot2)
    });
    await loadInitial()(dispatch);
    expect(dispatch).toHaveBeenCalledWith({
      type: "loaded-everything",
      pots: {
        potIds: [pot1.uuid, pot2.uuid],
        pots: {
          [pot1.uuid]: pot1,
          [pot2.uuid]: pot2
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
      "@Pots": JSON.stringify([pot1.uuid, pot2.uuid]),
      ["@Pot:" + pot1.uuid]: JSON.stringify(pot1),
      ["@Pot:" + pot2.uuid]: JSON.stringify(pot2),
      "@ImageStore": JSON.stringify(imageStore)
    });
    await loadInitial()(dispatch);
    expect(dispatch).toHaveBeenCalledWith({
      type: "loaded-everything",
      pots: {
        potIds: [pot1.uuid, pot2.uuid],
        pots: {
          [pot1.uuid]: pot1,
          [pot2.uuid]: pot2
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
      "@Pots": JSON.stringify([pot1.uuid, pot2.uuid]),
      ["@Pot:" + pot1.uuid]: JSON.stringify(pot1),
      ["@Pot:" + pot2.uuid]: JSON.stringify(pot2)
    });
    delete pot1.images;
    pot1.images3 = ["img.jpg"];
    await loadInitial()(dispatch);
    expect(dispatch).toHaveBeenCalledWith({
      type: "loaded-everything",
      pots: {
        potIds: [pot1.uuid, pot2.uuid],
        pots: {
          [pot1.uuid]: pot1,
          [pot2.uuid]: pot2
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
    expect(saveToFile).toHaveBeenCalledWith("l/img.jpg", false);
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
      "@Pots": JSON.stringify([pot1.uuid, pot2.uuid]),
      ["@Pot:" + pot1.uuid]: JSON.stringify(pot1),
      ["@Pot:" + pot2.uuid]: JSON.stringify(pot2),
      "@ImageState": JSON.stringify(imageState)
    });
    delete pot1.images;
    pot1.images3 = ["img.jpg"];
    await loadInitial()(dispatch);
    expect(dispatch).toHaveBeenCalledWith({
      type: "loaded-everything",
      pots: {
        potIds: [pot1.uuid, pot2.uuid],
        pots: {
          [pot1.uuid]: pot1,
          [pot2.uuid]: pot2
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

  it("fixes pots and images", () => {
    const l = require("../loadInitial");
    const spy = jest.spyOn(l, "_fixPotsAndImages");
    //l._fixPotsAndImages = jest.fn();
    const dispatch = jest.fn();

    const pot1 = newPot();
    pot1.title = "the first pot is the best pot";
    const pot2 = newPot();
    mockAsyncStorage({
      "@Pots": JSON.stringify([pot1.uuid, pot2.uuid]),
      ["@Pot:" + pot1.uuid]: JSON.stringify(pot1),
      ["@Pot:" + pot2.uuid]: JSON.stringify(pot2)
    });

    loadInitial()(dispatch).then(() => {
      expect(spy).toHaveBeenCalledWith(
        {
          potIds: [pot1.uuid, pot2.uuid, "bogus"],
          pots: {
            [pot1.uuid]: pot1,
            [pot2.uuid]: pot2
          },
          hasLoaded: true
        },
        {
          loaded: true,
          images: {}
        }
      );
    });
  });

  it("saves remote/local images", () => {
    const l = require("../loadInitial");
    const spy = jest.spyOn(l, "_saveImagesToFiles");
    //l._saveImagesToFiles = jest.fn();
    const dispatch = jest.fn();
    loadInitial()(dispatch).then(() => {
      expect(spy).toHaveBeenCalledWith(dispatch, {
        loaded: true,
        images: {}
      });
    });
  });
});

describe("_fixPotsAndImages", () => {
  it("doesn't touch a good thing", () => {
    const inPots = somePots();
    const potWithImageId = inPots.potIds[0];
    inPots.pots[potWithImageId].images3 = ["a.jpg"];
    const inImages = {
      loaded: true,
      images: {
        "a.jpg": {
          name: "a.jpg",
          fileUri: "f/a.jpg",
          pots: [potWithImageId]
        }
      }
    };
    const { pots, images } = _fixPotsAndImages(inPots, inImages);
    expect(pots).toEqual(inPots);
    expect(images).toEqual(inImages);
  });

  it("deletes images with no URI", () => {
    const inPots = somePots();
    const potWithImageId = inPots.potIds[0];
    inPots.pots[potWithImageId].images3 = ["a.jpg"];
    const inImages = {
      loaded: true,
      images: {
        "a.jpg": {
          name: "a.jpg"
        }
      }
    };
    const { pots, images } = _fixPotsAndImages(inPots, inImages);
    expect(pots.pots[potWithImageId].images3.length).toEqual(0);
    expect(Object.keys(images.images).length).toEqual(0);
  });

  it("reconstructs pots lists in images", () => {
    const inPots = somePots();
    const potWithImageId = inPots.potIds[0];
    inPots.pots[potWithImageId].images3 = ["a.jpg"];
    const inImages = {
      loaded: true,
      images: {
        "a.jpg": {
          name: "a.jpg",
          fileUri: "f/a.jpg",
          pots: []
        }
      }
    };
    const { pots, images } = _fixPotsAndImages(inPots, inImages);
    expect(pots).toEqual(inPots);
    expect(images.images["a.jpg"].pots.length).toEqual(1);
    expect(images.images["a.jpg"].pots[0]).toEqual(potWithImageId);
  });

  it("deletes unused images", () => {
    const inPots = somePots();
    const inImages = {
      loaded: true,
      images: {
        "a.jpg": {
          name: "a.jpg",
          fileUri: "f/a.jpg",
          pots: [inPots.potIds[0]]
        }
      }
    };
    const { pots, images } = _fixPotsAndImages(inPots, inImages);
    expect(pots).toEqual(inPots);
    expect(images).toEqual({
      loaded: true,
      images: {}
    });
  });

  it("removes missing images from pots", () => {
    const inPots = somePots();
    const potWithImageId = inPots.potIds[0];
    inPots.pots[potWithImageId].images3 = ["a.jpg"];
    const inImages = {
      loaded: true,
      images: {}
    };
    const { pots, images } = _fixPotsAndImages(inPots, inImages);
    inPots.pots[potWithImageId].images3 = [];
    expect(pots).toEqual(inPots);
    expect(images).toEqual(inImages);
  });
});

describe("_saveImagesToFiles", () => {
  it("saves images to files", async () => {
    const inImages = {
      loaded: true,
      images: {
        "a.jpg": {
          name: "a.jpg",
          remoteUri: "r/a.jpg",
          pots: ["1"]
        },
        "b.jpg": {
          name: "b.jpg",
          localUri: "l/b.jpg",
          pots: ["1"]
        }
      }
    };
    await _saveImagesToFiles(() => {}, inImages);
    expect(saveToFile).toHaveBeenCalledWith("r/a.jpg", true);
    expect(saveToFile).toHaveBeenCalledWith("l/b.jpg", false);
  });
});
