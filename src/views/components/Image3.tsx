import React from 'react';
import {Image} from 'react-native';
import dispatcher from '../../AppDispatcher';
import { ImageState } from '../../action';

type Image3Props = {
  image: ImageState | null,
  style: any,
  key: string,
};

type Image3State = {
  image: ImageState | null,
  failed: boolean,
  tries: number,
};

export default class Image3 extends React.Component<Image3Props, Image3State> {
  state: Image3State;
  constructor(props: Image3Props) {
    super(props);
    this.state = {
      failed: false,
      tries: Image3.defaultTries(props),
      image: props.image,
    };
  }

  // 0 tries for local because iOS doesn't reload the image unless
  // the URI changed, so in order to load remote we need to try that
  // on the first failure.
  static defaultTries(props: Image3Props) {
    if (!props.image) {
      return 0;
    }
    if (props.image.fileUri) {
      return 3;
    } else if (props.image.localUri) {
      return 0;
    } else {
      return 3;
    }
  }

  uri() {
    if (!this.props.image) {
      return '';
    }
    return this.props.image.fileUri || this.props.image.localUri || this.props.image.remoteUri;
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
    if (!this.props.image) {
      return;
    }
    dispatcher.dispatch({
      type: 'image-loaded',
      name: this.props.image.name,
    });
    this.setState({failed: false})
  }

  onLoadEnd() {
    //console.log("onLoadEnd " + this.uri() + " with " + this.state.tries + " tries left");
  }

  onError(e: Error) {
    //console.log("Failed to load " + this.uri());
    if (!this.props.image) {
      return;
    }
    if (this.state.tries > 0) {
      //console.log("Decrementing tries for " + this.uri() + " to " + (this.state.tries-1));
      this.setState({tries: this.state.tries-1, failed: false});
      return;
    }
    if (this.props.image.fileUri) {
      // The fileUri failed 3 times. It's gone.
      this.setState({failed: true, tries: this.state.tries});
    } else if (this.props.image.localUri) {
      // The localUri failed 3 times. It's gone.
      dispatcher.dispatch({
        type: 'image-error-local',
        name: this.props.image.name,
      });
      this.setState({failed: true, tries: this.state.tries});
    } else if (this.props.image.remoteUri) {
      // Remote image failed, what can you do?
      dispatcher.dispatch({
        type: 'image-error-remote',
        name: this.props.image.name,
      });
      this.setState({failed: true, tries: this.state.tries});
    }
  }

  static key(imageState: ImageState | null): string {
    if (!imageState) {
      return '';
    }
    return '' + imageState.localUri + imageState.fileUri + imageState.remoteUri;
  }

  // Keep track of the image prop in the state to use in getDerivedStateFromProps
  componentDidMount() {
    this.setState({image: this.props.image});
  }
}
