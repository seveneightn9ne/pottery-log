import React from "react";
import AppContainer from "./src/AppContainer";
import * as Font from "expo-font";
import * as Sentry from "sentry-expo";
import "array-reverse-polyfill";
import { Provider } from "react-redux";
import store from "./src/reducers/store";

Sentry.init({
  dsn: "https://bad3ce09a6404191b1a0b181bdb36263@sentry.io/1341402"
});

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = { fontLoaded: false };
  }

  async componentDidMount() {
    await Font.loadAsync({
      "material-icons": require("./assets/MaterialIcons-Regular.ttf")
    });
    this.setState({ fontLoaded: true });
  }

  render() {
    return (
      <Provider store={store}>
        <AppContainer fontLoaded={this.state.fontLoaded} />
      </Provider>
    );
  }
}
