import dispatcher from "../../reducers/store";
import * as FileSystem from "expo-file-system";
import { saveToFile, nameFromUri, resetDirectory } from "../imageutils";

jest.mock("../uploader");
jest.mock("../../reducers/store");
jest.mock("expo-file-system", () => ({
  documentDirectory: "test://document/directory",
  makeDirectoryAsync: jest.fn().mockReturnValue(Promise.resolve()),
  getInfoAsync: jest.fn().mockReturnValue(Promise.resolve({ exists: true })),
  downloadAsync: jest.fn().mockReturnValue(Promise.resolve()),
  copyAsync: jest.fn().mockReturnValue(Promise.resolve())
}));

function expectError(uri) {
  expect(dispatcher.dispatch).toBeCalledWith({
    type: "image-file-failed",
    uri
  });
}

function expectSuccess() {
  expect(FileSystem.downloadAsync).toBeCalled();
  expect(dispatcher.dispatch).toBeCalledWith({
    type: "image-file-created",
    name: "image.png",
    fileUri: expect.any(String)
  });
}

describe("saveToFile", () => {
  afterEach(() => jest.clearAllMocks());
  jest.useFakeTimers();

  it("saves remote image", async () => {
    const uri = "https://fake-url/image.png";
    await saveToFile(uri, true);
    jest.runAllTimers();
    expect(FileSystem.downloadAsync).toBeCalledWith(uri, expect.any(String));
    expect(dispatcher.dispatch).toBeCalledWith({
      type: "image-file-created",
      name: "image.png",
      fileUri: FileSystem.downloadAsync.mock.calls[0][1]
    });
  });

  it("saves local image", async () => {
    const uri = "file://fake-url/image.png";
    await saveToFile(uri, false);
    jest.runAllTimers();
    expect(FileSystem.copyAsync).toBeCalledWith({
      from: uri,
      to: expect.any(String)
    });
    expect(dispatcher.dispatch).toBeCalledWith({
      type: "image-file-created",
      name: "image.png",
      fileUri: FileSystem.copyAsync.mock.calls[0][0].to
    });
  });

  it("dispatches error when no uri", async () => {
    await saveToFile("", false);
    jest.runAllTimers();
    expectError("");
  });

  it("fails when makeDirectory fails", async () => {
    FileSystem.makeDirectoryAsync.mockReturnValue(Promise.reject("error"));
    FileSystem.getInfoAsync.mockReturnValue(Promise.resolve({ exists: false }));
    const uri = "http://fake-uri/image.png";
    await saveToFile(uri, true);
    jest.runAllTimers();
    expectError(uri);
  });

  // This test passes in isolation and failse when run with the suite.
  it.skip("succeed when makeDirectory pretends to fail", async () => {
    FileSystem.makeDirectoryAsync.mockReturnValue(Promise.reject("error"));
    const uri = "http://fake-uri/image.png";
    await saveToFile(uri, true);
    jest.runAllTimers();
    expectSuccess();
  });

  it("fails when download fails", async () => {
    FileSystem.downloadAsync.mockReturnValue(Promise.reject("error"));
    const uri = "http://fake-uri/image.png";
    await saveToFile(uri, true);
    jest.runAllTimers();
    expectError(uri);
  });

  it("fails when copy fails", async () => {
    FileSystem.copyAsync.mockReturnValue(Promise.reject("error"));
    const uri = "http://fake-uri/image.png";
    await saveToFile(uri, false);
    jest.runAllTimers();
    expectError(uri);
  });
});

describe("nameFromUri", () => {
  it("removes the directory and param", () => {
    const uri = "file:///doc/dir/thing/12345/myFile.png?getRidOfThis";
    const name = nameFromUri(uri);
    expect(name).toBe("myFile.png");
  });
});

describe("resetDirectory", () => {
  const mockedDocDir = "test://document/directory";
  it("resets the doc dir", () => {
    const newUri = resetDirectory("file:///this/is/bad/file.png");
    expect(newUri).toBe(mockedDocDir + "/file.png");
  });
  it("preserves the random dir", () => {
    const newUri = resetDirectory("file:///this/is/bad/23456/file.png");
    expect(newUri).toBe(mockedDocDir + "/23456/file.png");
  });
});
