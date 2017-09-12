import React, { Component } from 'react';
import VariableField from './VariableField';

export default class GlobalVariableField extends Component {
  focus() {
    if (this._field) this._field.focus();
  }

  render() {
    return (
      <VariableField
        variablesContainer={this.props.project.getVariables()}
        value={this.props.value}
        onChange={this.props.onChange}
        isInline={this.props.isInline}
        ref={field => this._field = field}
      />
    );
  }
}
