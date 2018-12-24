import React, {Component} from 'react'
import { TextInput, TextInputProps } from 'react-native'

interface Props extends TextInputProps {
  onSubmit: () => void,
}
type State = {
  height: number
}
export class ExpandingTextInput extends Component<Props, State> {
  state: State;
  constructor(props: Props) {
    super(props);
    this.state = {height: 0};
  }
  render() {
    return (
      <TextInput
        {...this.props}
        multiline={true}
        underlineColorAndroid={'transparent'}
        onContentSizeChange={(event) => {
          this.setState({height: event.nativeEvent.contentSize.height});
        }}
        style={[this.props.style, {height: this.state.height}]}
        onEndEditing={this.props.onSubmit}
      />
    );
  }
}
