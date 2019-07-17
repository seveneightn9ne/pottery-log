import React from 'react';
import { Image, ImageErrorEventData, NativeSyntheticEvent } from 'react-native';
import { ImageState } from '../../reducers/types';
import { resetDirectory } from '../../utils/imageutils';

interface Image3Props {
  image: ImageState | null;
  style: any;
  key: string; // TODO why pass in key?
  onImageLoad: (name: string) => void;
  onImageLoadFailure: (
    nameOrUri: string,
    type: 'local' | 'file' | 'remote',
  ) => void;
  onResetImageLoad: (oldUri: string, newUri: string) => void;
}

interface Image3State {
  failed: boolean;
  tries: number;
  uri: string; // URI is changed when tries is changed, to force a reload
  baseUriIfReset?: string;
  originalUriIfReset?: string;
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
      />
    );
  }

  private baseUriFromProps = (props = this.props) => {
    if (!props.image) {
      return '';
    }
    const fullUri =
      props.image.fileUri ||
      props.image.localUri ||
      props.image.remoteUri ||
      '';
    return fullUri;
  }

  private baseUri = (props?: Image3Props) =>
    (this.state && this.state.baseUriIfReset) || this.baseUriFromProps(props)
  private uniqueUri = (baseUri: string) => baseUri + '?r' + Date.now();
  private uri = (props?: Image3Props) => this.uniqueUri(this.baseUri(props));

  private onLoad = () => {
    if (!this.props.image) {
      return;
    }
    if (!this.props.image.fileUri) {
      // Skip unnecessary actions because we only care about loads that will cause a download
      this.props.onImageLoad(this.props.image.name);
    }
    if (this.state.originalUriIfReset) {
      // Resetting the document directory fixed the image
      this.props.onResetImageLoad(
        this.state.originalUriIfReset,
        this.state.uri,
      );
    }
    const tries = Image3.defaultTries(this.props);
    this.setState({ failed: false, tries });

    // Debugging
    // FileSystem.getInfoAsync(this.state.uri).then((info) => {
    //  console.log("Loaded file info.", info);
    // });
  }

  private onError = (e: NativeSyntheticEvent<ImageErrorEventData>) => {
    if (!this.props.image) {
      return;
    }
    if (this.state.tries > 0) {
      this.setState({
        tries: this.state.tries - 1,
        failed: false,
        uri: this.uri(),
      });
      return;
    }
    if (this.props.image.fileUri) {
      if (!this.state.originalUriIfReset) {
        // Try resetting the document directory
        const baseUri = resetDirectory(this.props.image.fileUri);
        this.setState((state) => ({
          tries: Image3.defaultTries(this.props),
          failed: false,
          baseUriIfReset: baseUri,
          originalUriIfReset: state.uri,
          uri: this.uniqueUri(baseUri),
        }));
      } else {
        // failed despite reset. It's gone.
        this.props.onImageLoadFailure(this.props.image.fileUri, 'file');
        this.setState({ failed: true, tries: this.state.tries });
      }
    } else if (this.props.image.localUri) {
      // The localUri failed 3 times. It's gone.
      this.props.onImageLoadFailure(this.props.image.name, 'local');
      this.setState({ failed: true, tries: this.state.tries });
    } else if (this.props.image.remoteUri) {
      // Remote image failed, what can you do?
      this.props.onImageLoadFailure(this.props.image.name, 'remote');
      this.setState({ failed: true, tries: this.state.tries });
    }
  }
}
