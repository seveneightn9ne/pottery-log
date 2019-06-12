import { AsyncStorage } from "react-native";
import { loadInitialImport } from "../loadInitial";

jest.mock("AsyncStorage");

describe("loadInitialImport", () => {
  afterEach(() => jest.clearAllMocks());

  it("resumes", () => {
    jest.useFakeTimers();
    expect.assertions(1);
    const existingState = {
      importing: true,
      imagesImported: 0,
      totalImages: 1,
      imageMap: { "a.png": { uri: "r/a.png" } }
    };
    AsyncStorage.getItem.mockReturnValue(
      Promise.resolve(JSON.stringify(existingState))
    );
    const dispatch = jest.fn();
    return loadInitialImport()(dispatch).then(() => {
      expect(dispatch).toHaveBeenCalledWith({
        type: "import-resume",
        data: existingState
      });
      // Wrong:
      //expect(exports.importImage).toHaveBeenCalledTimes(1);
      //expect(exports.importImage).toHaveBeenCalledWith('r/a.png');
    });
  });
});
