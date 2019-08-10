import { newPot } from "../../models/Pot";
import * as imageutils from "../../utils/imageutils";
import {
  pickImageFromCamera,
  pickImageFromLibrary,
  deletePot
} from "../images";
import * as Permissions from "expo-permissions";
import * as ImagePicker from "expo-image-picker";
import { getInitialState as getInitialImageState } from "../../reducers/ImageStore";
import { getInitialState } from "../../reducers/PotsStore";

jest.useFakeTimers();

jest.mock("expo-permissions");
jest.mock("expo-image-picker", () => ({
  CAMERA: "camera",
  CAMERA_ROLL: "camera_roll",
  launchCameraAsync: jest.fn(),
  launchImageLibraryAsync: jest.fn()
}));
jest.mock("../../utils/imageutils", () => ({
  ...jest.requireActual("../../utils/imageutils"),
  saveToFilePure: jest.fn(),
  deleteUnusedImage: jest.fn()
}));

function rejectPermission() {
  Permissions.askAsync.mockReturnValue(Promise.resolve({ status: "rejected" }));
}

describe("pickImageFromCamera", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    ImagePicker.launchCameraAsync.mockReturnValue(
      Promise.resolve({ uri: "localUri/file.png" })
    );
    ImagePicker.launchImageLibraryAsync.mockReturnValue(
      Promise.resolve({ uri: "localUri/file.png" })
    );
    imageutils.saveToFilePure.mockReturnValue(
      Promise.resolve("fileUri/file.png")
    );
    Permissions.askAsync.mockReturnValue(
      Promise.resolve({ status: "granted" })
    );
  });

  it("happy path", async () => {
    const { dispatch, dispatchMock } = makeDispatch();
    const pot = newPot();

    await pickImageFromCamera(pot)(dispatch);
    jest.runAllTimers();

    expect(Permissions.askAsync).toHaveBeenCalledWith(Permissions.CAMERA);
    expect(Permissions.askAsync).toHaveBeenCalledWith(Permissions.CAMERA_ROLL);
    expect(ImagePicker.launchCameraAsync).toHaveBeenCalled();
    expect(dispatchMock).toHaveBeenNthCalledWith(1, {
      type: "image-add",
      localUri: "localUri/file.png",
      potId: pot.uuid
    });
    expect(dispatchMock).toHaveBeenNthCalledWith(2, {
      type: "pot-edit-field",
      field: "images3",
      value: ["file.png"],
      potId: pot.uuid
    });

    expect(imageutils.saveToFilePure).toHaveBeenCalled();
    expect(dispatchMock).toHaveBeenNthCalledWith(3, {
      type: "image-file-created",
      name: "file.png",
      fileUri: "fileUri/file.png"
    });
  });

  it("exits gracefully when permissions aren't granted", async () => {
    const { dispatch, dispatchMock } = makeDispatch();
    const pot = newPot();
    rejectPermission();

    await pickImageFromCamera(pot)(dispatch);
    jest.runAllTimers();

    expect(Permissions.askAsync).toHaveBeenCalledWith(Permissions.CAMERA);
    expect(Permissions.askAsync).toHaveBeenCalledWith(Permissions.CAMERA_ROLL);
    expect(ImagePicker.launchCameraAsync).not.toHaveBeenCalled();
    expect(imageutils.saveToFilePure).not.toHaveBeenCalled();
    expect(dispatchMock).not.toHaveBeenCalledWith(expect.any(Object));
  });

  it("exits gracefully when launcher is cancelled", async () => {
    const { dispatch, dispatchMock } = makeDispatch();
    const pot = newPot();
    ImagePicker.launchCameraAsync.mockReturnValue(Promise.reject());

    await pickImageFromCamera(pot)(dispatch);
    jest.runAllTimers();

    expect(Permissions.askAsync).toHaveBeenCalledWith(Permissions.CAMERA);
    expect(Permissions.askAsync).toHaveBeenCalledWith(Permissions.CAMERA_ROLL);
    expect(ImagePicker.launchCameraAsync).toHaveBeenCalled();
    expect(imageutils.saveToFilePure).not.toHaveBeenCalled();
    expect(dispatchMock).not.toHaveBeenCalledWith(expect.any(Object));
  });

  it("exits gracefully when launcher is cancelled 2", async () => {
    const { dispatch, dispatchMock } = makeDispatch();
    const pot = newPot();
    ImagePicker.launchCameraAsync.mockReturnValue(
      Promise.resolve({ cancelled: true })
    );

    await pickImageFromCamera(pot)(dispatch);
    jest.runAllTimers();

    expect(Permissions.askAsync).toHaveBeenCalledWith(Permissions.CAMERA);
    expect(Permissions.askAsync).toHaveBeenCalledWith(Permissions.CAMERA_ROLL);
    expect(ImagePicker.launchCameraAsync).toHaveBeenCalled();
    expect(imageutils.saveToFilePure).not.toHaveBeenCalled();
    expect(dispatchMock).not.toHaveBeenCalledWith(expect.any(Object));
  });

  it("dispatches failure when saveToFile fails", async () => {
    const { dispatch, dispatchMock } = makeDispatch();
    const pot = newPot();

    imageutils.saveToFilePure.mockReturnValue(
      Promise.reject("simulated error")
    );

    await pickImageFromCamera(pot)(dispatch);
    jest.runAllTimers();

    expect(Permissions.askAsync).toHaveBeenCalledWith(Permissions.CAMERA);
    expect(Permissions.askAsync).toHaveBeenCalledWith(Permissions.CAMERA_ROLL);
    expect(ImagePicker.launchCameraAsync).toHaveBeenCalled();
    expect(imageutils.saveToFilePure).toHaveBeenCalled();
    expect(dispatchMock).toHaveBeenCalledWith({
      type: "image-file-failed",
      uri: "localUri/file.png"
    });
  });
});

describe("pickImageFromImageLibrary", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    ImagePicker.launchCameraAsync.mockReturnValue(
      Promise.resolve({ uri: "localUri/file.png" })
    );
    ImagePicker.launchImageLibraryAsync.mockReturnValue(
      Promise.resolve({ uri: "localUri/file.png" })
    );
    imageutils.saveToFilePure.mockReturnValue(
      Promise.resolve("fileUri/file.png")
    );
    Permissions.askAsync.mockReturnValue(
      Promise.resolve({ status: "granted" })
    );
  });

  it("happy path", async () => {
    const { dispatch, dispatchMock } = makeDispatch();
    const pot = newPot();

    await pickImageFromLibrary(pot)(dispatch);
    jest.runAllTimers();

    expect(Permissions.askAsync).toHaveBeenCalledWith(Permissions.CAMERA_ROLL);
    expect(ImagePicker.launchImageLibraryAsync).toHaveBeenCalled();
    expect(dispatchMock).toHaveBeenNthCalledWith(1, {
      type: "image-add",
      localUri: "localUri/file.png",
      potId: pot.uuid
    });
    expect(dispatchMock).toHaveBeenNthCalledWith(2, {
      type: "pot-edit-field",
      field: "images3",
      value: ["file.png"],
      potId: pot.uuid
    });

    expect(imageutils.saveToFilePure).toHaveBeenCalled();
    expect(dispatchMock).toHaveBeenNthCalledWith(3, {
      type: "image-file-created",
      name: "file.png",
      fileUri: "fileUri/file.png"
    });
  });

  it("exits gracefully when permissions aren't granted", async () => {
    const { dispatch, dispatchMock } = makeDispatch();
    const pot = newPot();
    rejectPermission();

    await pickImageFromLibrary(pot)(dispatch);
    jest.runAllTimers();

    expect(Permissions.askAsync).toHaveBeenCalledWith(Permissions.CAMERA_ROLL);
    expect(ImagePicker.launchImageLibraryAsync).not.toHaveBeenCalled();
    expect(imageutils.saveToFilePure).not.toHaveBeenCalled();
    expect(dispatchMock).not.toHaveBeenCalledWith(expect.any(Object));
  });
});

describe("deletePot", () => {
  beforeEach(() => jest.clearAllMocks());

  const initialStateOnePotManyImages = (pot, imagesList) => {
    const images = getInitialImageState();
    const pots = getInitialState();
    pots.pots[pot.uuid] = pot;
    pots.potIds = [pot.uuid];

    imagesList.forEach(image => {
      if (pot.images3.indexOf(image.name) === -1) {
        pot.images3.push(image.name);
      }
      image.potIds = [pot.uuid];
      images.images[image.name] = image;
    });
    return { images, pots };
  };
  const initialStateTwoPotsOneImage = (pot1, pot2, image) => {
    const images = getInitialImageState();
    const pots = getInitialState();
    pots.pots[pot1.uuid] = pot1;
    pots.pots[pot2.uuid] = pot2;
    pots.potIds = [pot1.uuid, pot2.uuid];

    pot1.images3 = [image.name];
    pot2.images3 = [image.name];

    image.potIds = [...pots.potIds];
    images.images[image.name] = image;

    return { pots, images };
  };
  const makeGetState = (initialState, nextState) => {
    let calls = 0;
    return () => {
      calls++;
      if (calls === 1) {
        return initialState;
      } else if (calls === 2) {
        if (nextState) {
          return nextState;
        }
        const images = getInitialImageState();
        const pots = getInitialState();
        return { pots, images };
      }
    };
  };
  it("deletes the images", async () => {
    const pot = newPot();
    const image1 = {
      name: "image1",
      fileUri: "file://dir/f/image1"
    };
    const image2 = {
      name: "image2",
      remoteUri: "https://potterylog/image1"
    };
    const { dispatch, dispatchMock } = makeDispatch(
      makeGetState(initialStateOnePotManyImages(pot, [image1, image2]))
    );

    await dispatch(deletePot(pot));

    expect(dispatchMock).toHaveBeenCalledWith({
      type: "pot-delete",
      potId: pot.uuid,
      imageNames: [image1.name, image2.name]
    });
    expect(imageutils.deleteUnusedImage).toHaveBeenCalledWith(image1);
    expect(imageutils.deleteUnusedImage).toHaveBeenCalledWith(image2);
  });

  it("doesn't delete still-used image", async () => {
    const pot1 = newPot();
    const pot2 = newPot();
    const image = {
      name: "image2",
      fileUri: "file://d/d/image2"
    };

    const { dispatch, dispatchMock } = makeDispatch(
      makeGetState(
        initialStateTwoPotsOneImage(pot1, pot2, image),
        initialStateOnePotManyImages(pot2, [image])
      )
    );

    await dispatch(deletePot(pot1));

    expect(dispatchMock).toHaveBeenCalledWith({
      type: "pot-delete",
      potId: pot1.uuid,
      imageNames: [image.name]
    });

    expect(imageutils.deleteUnusedImage).not.toHaveBeenCalled();
  });
});
