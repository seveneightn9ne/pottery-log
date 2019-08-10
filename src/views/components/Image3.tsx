import { FileSystem } from 'expo';
import React from 'react';
import { Image, ImageErrorEventData, NativeSyntheticEvent } from 'react-native';
import { connect } from 'react-redux';
import { ImageState } from '../../reducers/types';
import { waitAndSaveToFile } from '../../thunks/images';
import { PLThunkDispatch } from '../../thunks/types';
import { resetDirectory } from '../../utils/imageutils';
import { debug } from '../../utils/uploader';

interface OwnProps {
  image: ImageState | null;
  style: any;
  key?: string;
}

interface Image3State {
  failed: boolean;
  tries: number;
  uri: string; // URI is changed when tries is changed, to force a reload
  baseUriIfReset?: string;
  originalUriIfReset?: string;
}

const mapDispatchToProps = (dispatch: PLThunkDispatch) => ({
  onImageLoad: (name: string) => dispatch(waitAndSaveToFile(name)),
  onLocalLoadFailure: (name: string) => {
    console.log('Removing failed local URI for image ' + name);
    dispatch({ type: 'image-error-local', name });
  },
  onResetImageLoad: (oldUri: string, newUri: string) => {
    debug('image-reset-loaded', { oldUri, newUri });
    dispatch({
      type: 'image-reset-loaded',
      oldUri,
      newUri,
    });
  },
});
type PropsFromDispatch = ReturnType<typeof mapDispatchToProps>;

type Props = OwnProps & PropsFromDispatch;

class Image3 extends React.Component<Props, Image3State> {
  public static key(imageState: ImageState | null): string {
    if (!imageState) {
      return '';
    }
    return '' + imageState.localUri + imageState.fileUri + imageState.remoteUri;
  }

  // 0 tries for local because iOS doesn't reload the image unless
  // the URI changed, so in order to load remote we need to try that
  // on the first failure.
  private static defaultTries(props: Props) {
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

  constructor(props: Props) {
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

  private baseUri = (props?: Props) =>
    (this.state && this.state.baseUriIfReset) || this.baseUriFromProps(props)
  private uniqueUri = (baseUri: string) => baseUri + '?r' + Date.now();
  private uri = (props?: Props) => this.uniqueUri(this.baseUri(props));

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
        this.onFileLoadFailure(this.props.image.fileUri);
        this.setState({ failed: true, tries: this.state.tries });
      }
    } else if (this.props.image.localUri) {
      // The localUri failed 3 times. It's gone.
      this.props.onLocalLoadFailure(this.props.image.name);
      this.setState({ failed: true, tries: this.state.tries });
    } else if (this.props.image.remoteUri) {
      // Remote image failed, what can you do?
      this.setState({ failed: true, tries: this.state.tries });
    }
  }
  private onFileLoadFailure(uri: string) {
    // Permanent Failure
    const documentDirectory = FileSystem.documentDirectory;
    debug('image-error-file', {
      uri,
      documentDirectory,
      despiteReset: true,
    });
  }
}

export default connect<{}, PropsFromDispatch, OwnProps>(
  null,
  mapDispatchToProps,
)(Image3);
