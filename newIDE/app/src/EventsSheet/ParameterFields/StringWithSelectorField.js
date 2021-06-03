// @flow
import React, { Component } from 'react';
import GenericExpressionField from './GenericExpressionField';
import { type ParameterFieldProps } from './ParameterFieldCommons';
import { getParameterChoices } from './ParameterMetadataTools';
import { type ExpressionAutocompletion } from '../../ExpressionAutocompletion';

export default class StringWithSelectorField extends Component<
  ParameterFieldProps,
  {||}
> {
  _field: ?GenericExpressionField;

  focus() {
    if (this._field) this._field.focus();
  }

  render() {
    return (
      <GenericExpressionField
        expressionType="string"
        onGetAdditionalAutocompletions={expression =>
          getParameterChoices(this.props.parameterMetadata).filter(
            ({ completion }) => completion.indexOf(expression) === 0
          )
        }
        ref={field => (this._field = field)}
        {...this.props}
      />
    );
  }
}
