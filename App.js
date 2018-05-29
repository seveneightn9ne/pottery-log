// @flow
import React from 'react';
import AppContainer from './AppContainer.js';
import {AsyncStorage} from 'react-native';
import {Font} from 'expo';
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
