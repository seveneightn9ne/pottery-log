import { newPot } from "../../models/Pot";
import * as imageutils from "../../utils/imageutils";
import { pickImageFromCamera, pickImageFromLibrary } from "../images";
import * as Permissions from "expo-permissions";
import * as ImagePicker from "expo-image-picker";

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
  saveToFilePure: jest.fn()
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
