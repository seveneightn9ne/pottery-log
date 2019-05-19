import { FileSystem } from 'expo';
import React from 'react';
import { Image, ImageErrorEventData, NativeSyntheticEvent } from 'react-native';
import { ImageState } from '../../action';
import dispatcher from '../../AppDispatcher';

interface Image3Props {
  image: ImageState | null;
  style: any;
  key: string;
}

interface Image3State {
  failed: boolean;
  tries: number;
  uri: string; // URI is changed when tries is changed, to force a reload
}

export default class Image3 extends React.Component<Image3Props, Image3State> {
  public static key(imageState: ImageState | null): string {
    if (!imageState) {
      return '';
    }
    return '' + imageState.localUri + imageState.fileUri + imageState.remoteUri;
  }

  // 0 tries for local because iOS doesn't reload the image unless
  // the URI changed, so in order to load remote we need to try that
  // on the first failure.
  private static defaultTries(props: Image3Props) {
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

  constructor(props: Image3Props) {
    super(props);
    this.state = {
      failed: false,
      tries: Image3.defaultTries(props),
      uri: this.uri(props),
    };
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

  public render() {
    // console.log("We are rendering " + this.uri() + "  with " + this.state.tries + " tries");
    return (
      <Image
        source={{ uri: this.state.uri }}
        style={this.props.style}
        onError={this.onError}
        onLoad={this.onLoad}
      />);
  }

  private uri = (props = this.props) => {
    if (!props.image) {
      return '';
    }
    const fullUri = props.image.fileUri || props.image.localUri || props.image.remoteUri || '';
    return fullUri + "?r" + Date.now();
  }

  private resetDirectory(uri: string): string {
    const parts = uri.split("/");
    return FileSystem.documentDirectory + parts[parts.length - 2] + '/' + parts[parts.length - 1];
  }

  private onLoad = () => {
    if (!this.props.image) {
      return;
    }
    dispatcher.dispatch({
      type: 'image-loaded',
      name: this.props.image.name,
    });
    const tries = Image3.defaultTries(this.props);
    this.setState({ failed: false, tries });

    // Debugging
    //FileSystem.getInfoAsync(this.state.uri).then((info) => {
    //  console.log("Loaded file info.", info);
    //});
  }

  private onError = (e: NativeSyntheticEvent<ImageErrorEventData>) => {
    if (!this.props.image) {
      return;
    }
    if (this.state.tries > 0) {
      this.setState({ tries: this.state.tries - 1, failed: false, uri: this.uri() });
      return;
    }
    if (this.props.image.fileUri) {
      // The fileUri failed 3 times. It's gone.

      // Debugging
      //console.log(this.props.image.name, 'loaded FAILURE');
      //FileSystem.getInfoAsync(this.state.uri).then((info) => {
      //  console.log("Loaded file info.", info);
      //});

      dispatcher.dispatch({
        type: 'image-error-file',
        uri: this.props.image.fileUri,
      });
      this.setState({ failed: true, tries: this.state.tries });
    } else if (this.props.image.localUri) {
      // The localUri failed 3 times. It's gone.
      dispatcher.dispatch({
        type: 'image-error-local',
        name: this.props.image.name,
      });
      this.setState({ failed: true, tries: this.state.tries });
    } else if (this.props.image.remoteUri) {
      // Remote image failed, what can you do?
      dispatcher.dispatch({
        type: 'image-error-remote',
        name: this.props.image.name,
      });
      this.setState({ failed: true, tries: this.state.tries });
    }
  }
}
