import React from 'react';
import { Text, View, StatusBar } from 'react-native';
import { ImageStoreState, PotsStoreState, UIState } from '../reducers/types';
import style, {statusBarColor} from '../style';
import EditPage from './EditPage';
import ImagePage from './ImagePage';
import ListPage from './ListPage';
import SettingsPage from './SettingsPage';
import { getDerivedDarkMode } from '../selectors/settings';

export interface AppViewStateProps {
  pots: PotsStoreState;
  images: ImageStoreState;
  ui: UIState;
  fontLoaded: boolean;
  darkModeSetting: boolean | undefined;
}
export interface AppViewDispatchProps {
  addBackButtonHandler: () => () => void;
  removeBackButtonHandler: (handler: undefined | (() => void)) => undefined;
  loadInitial: () => void;
}

class AppView extends React.Component<
  AppViewDispatchProps & AppViewStateProps
> {
  private backHandler: (() => void) | undefined;
  public componentDidMount() {
    this.backHandler = this.props.addBackButtonHandler();
    this.props.loadInitial();
  }

  public componentWillUnmount() {
    this.backHandler = this.props.removeBackButtonHandler(this.backHandler);
  }

  public render() {
    const mode = getDerivedDarkMode(this.props.darkModeSetting);
    return (
      <React.Fragment>
        <StatusBar
          barStyle={'light-content'}
          translucent={true}
          backgroundColor={statusBarColor(mode)}
        />
        {this.renderPage()}
      </React.Fragment>
    );
  }

  private renderPage() {
    const props = this.props;
    switch (props.ui.page) {
      case 'list':
        return <ListPage fontLoaded={props.fontLoaded} />;
      case 'edit-pot':
        return (
          <EditPage
            pot={props.pots.pots[props.ui.editPotId]}
            fontLoaded={props.fontLoaded}
          />
        );
      case 'settings':
        return <SettingsPage fontLoaded={props.fontLoaded} />;
      case 'image':
        return (
          <ImagePage
            image={props.images.images[props.ui.imageId]}
            fontLoaded={props.fontLoaded}
          />
        );
      default:
        return (
          <View style={style.s.container}>
            <Text style={style.s.h1}>Unknown Page</Text>
          </View>
        );
    }
  }
}

export default AppView;
