// @flow
import React, { Component } from 'react';
import GenericExpressionField from './GenericExpressionField';
import { type ParameterFieldProps } from './ParameterFieldCommons';

export default class ExpressionField extends Component<
  ParameterFieldProps,
  void
> {
  _field: ?GenericExpressionField;

  focus() {
    if (this._field) this._field.focus();
  }

  render() {
    return (
      <GenericExpressionField
        expressionType="number"
        ref={field => (this._field = field)}
        {...this.props}
      />
    );
  }
}
