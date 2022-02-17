// @flow
import React, { Component } from 'react';
import GenericExpressionField from './GenericExpressionField';
import { type ParameterFieldProps } from './ParameterFieldCommons';
import { type ExpressionAutocompletion } from '../../ExpressionAutocompletion';
import { enumerateParametersUsableInExpressions } from './EnumerateFunctionParameters';

export default class FunctionParameterNameField extends Component<
  ParameterFieldProps,
  void
> {
  _field: ?GenericExpressionField;

  focus(selectAll: boolean = false) {
    if (this._field) this._field.focus(selectAll);
  }

  render() {
    const parameterNames: Array<ExpressionAutocompletion> = this.props.scope
      .eventsFunction
      ? enumerateParametersUsableInExpressions(
          this.props.scope.eventsFunction
        ).map(parameterMetadata => ({
          kind: 'Text',
          completion: `"${parameterMetadata.getName()}"`,
        }))
      : [];

    return (
      <GenericExpressionField
        expressionType="string"
        onGetAdditionalAutocompletions={expression =>
          parameterNames.filter(
            ({ completion }) => completion.indexOf(expression) === 0
          )
        }
        ref={field => (this._field = field)}
        {...this.props}
      />
    );
  }
}
