import React from "react";
import App from "../App";
import { shallow, mount } from "enzyme";

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
