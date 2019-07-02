import React, { Component } from 'react';
import {
  NativeSyntheticEvent,
  TextInput,
  TextInputContentSizeChangeEventData,
  TextInputProps,
} from 'react-native';

interface Props extends TextInputProps {
  onSubmit: () => void;
}
interface State {
  height: number;
}
export class ExpandingTextInput extends Component<Props, State> {
  public state: State;
  constructor(props: Props) {
    super(props);
    this.state = { height: 0 };
  }
  public render() {
    return (
      <TextInput
        {...this.props}
        multiline={true}
        underlineColorAndroid={'transparent'}
        onContentSizeChange={this.onChangeSize}
        style={[this.props.style, { height: this.state.height }]}
        onEndEditing={this.props.onSubmit}
      />
    );
  }
  private onChangeSize = (
    event: NativeSyntheticEvent<TextInputContentSizeChangeEventData>,
  ) => {
    this.setState({ height: event.nativeEvent.contentSize.height });
  }
}
