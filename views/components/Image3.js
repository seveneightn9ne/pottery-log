import React from 'react';
import {Image} from 'react-native';
import dispatcher from '../../AppDispatcher.js';

type Image3Props = {
  image: ImageState,
  style: any,
};

type Image3State = {
  failed: boolean,
  tries: number,
};

export default class Image3 extends React.Component {
  constructor(props) {
    super(props);
    this.state = {failed: false, tries: 3};
  }

  uri() {
    return this.props.image.localUri || this.props.image.remoteUri;
  }

  render() {
    return <Image
      source={{uri: this.uri()}}
      style={this.props.style}
      onError={this.onError}
      onLoadStart={this.onLoadStart}
      onLoad={this.onLoad}
    />;
  }

  onLoadStart() {
    // console.log("start load " + this.uri());
  }

  onLoad() {
    // console.log("loaded " + this.uri());
  }

  onError(e) {
    if (this.state.tries > 0) {
      this.setState({tries: this.state.tries-1});
      return;
    }
    if (this.props.image.localUri) {
      // The localUri failed 3 times. It's gone.
      dispatcher.dispatch({
        type: 'image-error-local',
        name: this.props.image.name,
      });
      this.setState({failed: true});
    }
    if (this.props.image.remoteUri) {
      // Remote image failed, what can you do?
      dispatcher.dispatch({
        type: 'image-error-remote',
        name: this.props.image.name,
      });
      this.setState({failed: true});
    }
  }

  componentWillReceiveProps(nextProps) {
    // Reset state when props change.
    if (nextProps.image.localUri != this.props.image.localUri
        || nextProps.image.remoteUri != this.props.image.remoteUri) {
      this.setState({
        failed: false,
        tries: 3,
      });
    }
  }
}
