import { mapDispatchToProps } from "../AppContainer";
import _ from "lodash";

jest.mock("react-native-appearance");

describe("AppContainer", () => {
  it("can map dispatch to props", () => {
    const dispatch = jest.fn();
    const props = mapDispatchToProps(dispatch);
    props.loadInitial();
    expect(dispatch).toHaveBeenCalled();
  });
});
