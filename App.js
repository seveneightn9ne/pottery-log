// @flow
import React from 'react';
import AppContainer from './src/AppContainer.js';
import {AsyncStorage} from 'react-native';
import {Font} from 'expo';
import Sentry from 'sentry-expo';
// import { SentrySeverity, SentryLog } from 'react-native-sentry';
Sentry.config('https://bad3ce09a6404191b1a0b181bdb36263@sentry.io/1341402').install();

export default class App extends React.Component<any, {fontLoaded: boolean}> {
  constructor(props) {
    super(props);
    this.state = {fontLoaded: false};
  }

  async componentDidMount(): Promise<void> {
    await Font.loadAsync({
      'material-icons': require('./assets/MaterialIcons-Regular.ttf'),
    });
    this.setState({fontLoaded: true});
  }
  render() {
    return <AppContainer fontLoaded={this.state.fontLoaded} />
  }
}
