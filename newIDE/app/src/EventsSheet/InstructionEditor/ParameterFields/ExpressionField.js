import React, { Component } from 'react';
import TextField from 'material-ui/TextField';

const styles = {
  input: {
    fontFamily: '"Lucida Console", Monaco, monospace',
  },
};

export default class ExpressionField extends Component {
  focus() {
    if (this._field) this._field.focus();
  }

  render() {
    const { parameterMetadata } = this.props;
    const description = parameterMetadata
      ? parameterMetadata.getDescription()
      : undefined;

    return (
      <TextField
        value={this.props.value}
        floatingLabelText={description}
        inputStyle={styles.input}
        onChange={(e, text) => this.props.onChange(text)}
        ref={field => this._field = field}
        fullWidth
      />
    );
  }
}
