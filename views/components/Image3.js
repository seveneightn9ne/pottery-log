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
  state: any;
  constructor(props) {
    super(props);
    this.state = {
      failed: false, 
      tries: this.defaultTries(props),
      image: props.image,
    };
  }

  // 0 tries for local because iOS doesn't reload the image unless
  // the URI changed, so in order to load remote we need to try that
  // on the first failure.
  defaultTries(props) {
    if (props.image.localUri) {
      return 0;
    } else {
      return 3;
    }
  }

  uri() {
    return this.props.image.localUri || this.props.image.remoteUri;
  }

  // This is for debugging
  /*
  color() {
    if (this.state.tries == 3) {
      return "#00FF00";
    }
    if (this.state.tries == 2) {
      return "#FFFF00";
    }
    if (this.state.tries == 1) {
      return "#FF8800";
    }
    if (this.state.tries == 0) {
      return "#FF0000";
    }
    else {
      return "#0000FF";
    }
  }*/

  render() {
    //console.log("We are rendering " + this.uri() + "  with " + this.state.tries + " tries");
    return <Image
      source={{uri: this.uri()}}
      style={this.props.style}
      onError={this.onError.bind(this)}
      onLoadStart={this.onLoadStart.bind(this)}
      onLoad={this.onLoad.bind(this)}
    />;
  }

  onLoadStart() {
    //console.log("start load " + this.uri() + " with " + this.state.tries + " tries left");
  }

  onLoad() {
    //console.log("loaded " + this.uri() + " with " + this.state.tries + " tries left");
  }

  onLoadEnd() {
    //console.log("onLoadEnd " + this.uri() + " with " + this.state.tries + " tries left");
  }

  onError(e) {
    if (this.state.tries > 0) {
      //console.log("Decrementing tries for " + this.uri() + " to " + (this.state.tries-1));
      this.setState({tries: this.state.tries-1, failed: false});
      return;
    }
    if (this.props.image.localUri) {
      // The localUri failed 3 times. It's gone.
      dispatcher.dispatch({
        type: 'image-error-local',
        name: this.props.image.name,
      });
      this.setState({failed: true,  tries: this.state.tries});
    }
    if (this.props.image.remoteUri) {
      // Remote image failed, what can you do?
      dispatcher.dispatch({
        type: 'image-error-remote',
        name: this.props.image.name,
      });
      this.setState({failed: true, tries: this.state.tries});
    }
  }

  static getDerivedStateFromProps(nextProps, state) {
    // Reset state when props change.
    if (nextProps.image.localUri != state.image.localUri
      || nextProps.image.remoteUri != state.image.remoteUri) {
    //console.log("Props changed for image " + this.uri());
      return {
        ...state,
        failed: false,
        tries: this.defaultTries(nextProps)
      };
    }
    return null;
  }

  // Keep track of the image prop in the state to use in getDerivedStateFromProps
  componentDidMount() {
    this.setState({image: this.props.image});
  }
}
