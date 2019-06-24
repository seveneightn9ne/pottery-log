import { mapDispatchToProps } from "../AppContainer";
import _ from "lodash";

describe("AppContainer", () => {
  it("can map dispatch to props", () => {
    const dispatch = jest.fn();
    const props = mapDispatchToProps(dispatch);
    props.loadInitial();
    expect(dispatch).toHaveBeenCalled();
  });
});
