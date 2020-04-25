import React from "react";
import App from "../App";
import { shallow, mount } from "enzyme";

jest.mock("expo-file-system");
jest.mock("expo-constants");
jest.mock("expo-font");
jest.mock("react-native-appearance", () => ({
  AppearanceProvider: () => 'AppearanceProvider', // Makes the snapshot use a simple <AppearanceProvider>
  Appearance: {
    getColorScheme: () => 'no-preference',
    addChangeListener: () => {},
  }
}));
jest.mock("sentry-expo");

describe("App", () => {
  it("matches the snapshot after font loaded", async () => {
    const wrapper = await shallow(<App />);
    await wrapper.instance().componentDidMount();
    expect(wrapper).toMatchSnapshot();
    expect(wrapper.state("fontLoaded")).toEqual(true);
  });

  it("can render", () => {
    mount(<App />);
  });
});
