// @flow
import type { Node } from 'React';
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

  render(): Node {
    return (
      <GenericExpressionField
        expressionType="number"
        ref={field => (this._field = field)}
        {...this.props}
      />
    );
  }
}
