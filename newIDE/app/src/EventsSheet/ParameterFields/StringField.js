// @flow
import React, { Component } from 'react';
import GenericExpressionField, {
  type ExpressionFieldInterface,
} from './GenericExpressionField';
import { type ParameterFieldProps } from './ParameterFieldCommons';

export default class StringField extends Component<ParameterFieldProps, void> {
  _field: ?ExpressionFieldInterface;

  focus(selectAll: boolean = false) {
    if (this._field) this._field.focus(selectAll);
  }

  render() {
    return (
      <GenericExpressionField
        expressionType="string"
        ref={field => (this._field = field)}
        {...this.props}
      />
    );
  }
}
