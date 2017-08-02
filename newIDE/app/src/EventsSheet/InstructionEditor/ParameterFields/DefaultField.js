import React, { Component } from 'react';
import TextField from 'material-ui/TextField';

export default class DefaultField extends Component {
  focus() {
    if (this._field) this._field.focus();
  }

  render() {
    return (
      <TextField
        value={this.props.value}
        floatingLabelText={this.props.parameterMetadata.getDescription()}
        onChange={(e, text) => this.props.onChange(text)}
        ref={field => this._field = field}
        fullWidth
      />
    );
  }
}
