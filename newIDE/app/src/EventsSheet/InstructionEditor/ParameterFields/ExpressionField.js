import React, { Component } from 'react';
import GenericExpressionField from './GenericExpressionField';

export default class ExpressionField extends Component {
  focus() {
    if (this._field) this._field.focus();
  }

  render() {
    return <GenericExpressionField expressionType="number" {...this.props} />;
  }
}
