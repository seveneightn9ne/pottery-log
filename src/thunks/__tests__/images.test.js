import { newPot } from "../../models/Pot";
import * as imageutils from "../../utils/imageutils";
import { pickImageFromCamera } from "../images";
import * as Permissions from "expo-permissions";
import * as ImagePicker from "expo-image-picker";

jest.useFakeTimers();

jest.mock("expo-permissions", () => ({
  askAsync: jest.fn().mockReturnValue(Promise.resolve({ status: "granted" }))
}));
jest.mock("expo-image-picker", () => ({
  launchCameraAsync: jest
    .fn()
    .mockReturnValue(Promise.resolve({ uri: "localUri/file.png" }))
}));
jest.mock("../../utils/imageutils", () => ({
  ...jest.requireActual("../../utils/imageutils"),
  saveToFilePure: jest.fn().mockReturnValue(Promise.resolve("fileUri/file.png"))
}));

function rejectPermission() {
  Permissions.askAsync.mockReturnValue(Promise.resolve({ status: "rejected" }));
}

describe("pickImageFromCamera", () => {
  afterEach(() => jest.clearAllMocks());

  it("does everything", async () => {
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
});
