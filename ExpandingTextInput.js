import React, {Component} from 'react'
import {TextInput} from 'react-native'

export class ExpandingTextInput extends Component {
  state: any;
  constructor(props) {
    super(props);
    this.state = {height: 0};
  }
  render() {
    return (
      <TextInput
        {...this.props}
        multiline={true}
        onContentSizeChange={(event) => {
          this.setState({height: event.nativeEvent.contentSize.height});
        }}
        style={[this.props.style, {height: this.state.height}]}
      />
    );
  }
}
