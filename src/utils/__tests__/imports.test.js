import { AsyncStorage } from 'react-native';
import * as import_utils from "../imports";
import * as imageutils from "../imageutils";

jest.mock("../imageutils", () => ({
    nameFromUri: jest.requireActual('../imageutils').nameFromUri,
    saveToFilePure: jest.fn().mockResolvedValue(),
}));

jest.useFakeTimers();

describe('importImageRetrying', () => {
  afterEach(() => jest.clearAllMocks());

  it('happy path', async () => {
    const getState = jest.fn().mockReturnValue({});

    await import_utils.importImageRetrying("r/a.jpg", getState);
    jest.runAllTimers();

    expect(getState).not.toHaveBeenCalled();
    expect(imageutils.saveToFilePure).toHaveBeenCalledTimes(1);
  });

  it('doesn\'t retry a failed image not in map', async () => {
    imageutils.saveToFilePure.mockRejectedValueOnce();
    const getState = jest.fn().mockReturnValue({
        imports: {
            importing: true,
            imageMap: {
                "not-your-image": {uri: ""}
            }
        }
    });

    await import_utils.importImageRetrying("r/a.jpg", getState);
    jest.runAllTimers();

    expect(getState).toHaveBeenCalledTimes(1);
    expect(imageutils.saveToFilePure).toHaveBeenCalledTimes(1);
  });

  it('retries a timeout', async () => {
    // Never resolves
    imageutils.saveToFilePure.mockImplementationOnce(() => new Promise(() => {}));

    // First call: prompts retry
    const getState = jest.fn().mockReturnValueOnce({
        imports: {
            importing: true,
            imageMap: {"a.jpg": {uri: "r/a.jpg"}}
        }
    });
    // 2nd call: image has been saved
    getState.mockReturnValueOnce({
        imports: {
            importing: true,
            imageMap: {}
        }
    });

    const p = import_utils.importImageRetrying("r/a.jpg", getState);
    jest.runAllTimers();
    await p;

    expect(getState).toHaveBeenCalledTimes(2);
    expect(imageutils.saveToFilePure).toHaveBeenCalledTimes(2);
  });

  it('retries a network error', async () => {
    imageutils.saveToFilePure.mockRejectedValueOnce();
    // 1st call: causes retry
    const getState = jest.fn().mockReturnValueOnce({
        imports: {
            importing: true,
            imageMap: {
                "a.jpg": {uri: "r/a.jpg", started: true}
            }
        }
    });
    // 2nd call: image has been saved
    getState.mockReturnValueOnce({
        imports: {
            importing: true,
            imageMap: {}
        }
    });

    await import_utils.importImageRetrying("r/a.jpg", getState);
    jest.runAllTimers();

    expect(getState).toHaveBeenCalledTimes(1);
    expect(imageutils.saveToFilePure).toHaveBeenCalledTimes(2);
  });
});


describe('importMetadataNow', () => {
    afterEach(() => jest.clearAllMocks());

    it('happy path', async () => {
        await AsyncStorage.multiSet([
          ["@Pots", "..."],
          ["@Pot:1", "..."],
          ["@ImageStore", "..."],
          ["@DoNotExport", "..."]
        ]);
        await import_utils.importMetadataNow('{"@Pot:5": "\\"value\\""}');

        expect(AsyncStorage.removeItem).toHaveBeenCalledWith("@Pots");
        expect(AsyncStorage.removeItem).toHaveBeenCalledWith("@Pot:1");
        expect(AsyncStorage.removeItem).toHaveBeenCalledWith("@ImageStore");
        expect(AsyncStorage.removeItem).not.toHaveBeenCalledWith("@DoNotExport");

        expect(AsyncStorage.multiSet).toHaveBeenCalledWith([["@Pot:5", '"value"']]);
    });

    it('not parsable', async () => {
        await expect(
            import_utils.importMetadataNow("this is not JSON")
        ).rejects.toThrow();
    })
});
