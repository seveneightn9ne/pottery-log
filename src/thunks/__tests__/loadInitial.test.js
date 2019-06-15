import { loadInitial } from "../loadInitial";
import { AsyncStorage } from "react-native";

jest.mock("AsyncStorage");

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
