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
    const eventsBasedEntity =
      this.props.scope.eventsBasedBehavior ||
      this.props.scope.eventsBasedObject;
    const functionsContainer = eventsBasedEntity
      ? eventsBasedEntity.getEventsFunctions()
      : this.props.scope.eventsFunctionsExtension;
    const parameterNames: Array<ExpressionAutocompletion> =
      this.props.scope.eventsFunction && functionsContainer
        ? enumerateParametersUsableInExpressions(
            functionsContainer,
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
