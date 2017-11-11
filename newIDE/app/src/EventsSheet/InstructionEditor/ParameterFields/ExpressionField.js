import React, { Component } from 'react';
import TextField from 'material-ui/TextField';
const gd = global.gd;

const styles = {
  input: {
    fontFamily: '"Lucida Console", Monaco, monospace',
  },
};

export default class ExpressionField extends Component {
  state = { errorText: null };

  focus() {
    if (this._field) this._field.focus();
  }

  getError = () => {
    const { project, layout } = this.props;

    const callbacks = new gd.CallbacksForExpressionCorrectnessTesting(project, layout);
    const parser = new gd.ExpressionParser(this.props.value);
    const isValid = parser.parseMathExpression(project.getCurrentPlatform(), project, layout, callbacks);
    const error = parser.getFirstError();
    parser.delete();
    callbacks.delete();

    return isValid ? null : error;
  }

  doValidation = () => {
    this.setState({ errorText: this.getError() });
  };

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
        ref={field => (this._field = field)}
        fullWidth
        errorText={this.state.errorText}
        onBlur={this.doValidation}
      />
    );
  }
}
