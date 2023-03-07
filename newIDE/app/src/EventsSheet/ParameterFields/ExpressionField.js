// @flow
import React, { Component } from 'react';
import GenericExpressionField from './GenericExpressionField';
import { type ParameterFieldProps } from './ParameterFieldCommons';

export default class ExpressionField extends Component<
  ParameterFieldProps,
  void
> {
  _field: ?GenericExpressionField;

  focus(selectAll: boolean = false) {
    if (this._field) this._field.focus(selectAll);
  }

  render() {
    return (
      <GenericExpressionField
        expressionType="number"
        ref={field => (this._field = field)}
        id={
          this.props.parameterIndex !== undefined
            ? `parameter-${this.props.parameterIndex}-expression-field`
            : undefined
        }
        {...this.props}
      />
    );
  }
}
