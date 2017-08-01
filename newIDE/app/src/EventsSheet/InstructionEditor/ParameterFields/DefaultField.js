import React, { Component } from 'react';
import TextField from 'material-ui/TextField';

export default class DefaultField extends Component {
  render() {
    return (
      <TextField
        value={this.props.value}
        floatingLabelText={this.props.parameterMetadata.getDescription()}
        onChange={(e, text) => this.props.onChange(text)}
        fullWidth
      />
    );
  }
}
