// @flow
import React, { Component } from 'react';
import GenericExpressionField from './GenericExpressionField';
import { enumerateLayouts } from '../../ProjectManager/EnumerateProjectItems';
import { type ParameterFieldProps } from './ParameterFieldCommons';
import { type ExpressionAutocompletion } from '../../ExpressionAutocompletion';
import { mapVector } from '../../Utils/MapFor';
import { type EventsScope } from '../../InstructionOrExpression/EventsScope.flow';
const gd: libGDevelop = global.gd;

export default class FunctionParameterNameField extends Component<
  ParameterFieldProps,
  void
> {
  _field: ?GenericExpressionField;

  focus() {
    if (this._field) this._field.focus();
  }

  render() {
    const parameterNames: Array<ExpressionAutocompletion> = this.props.scope.eventsFunction
      ? 
      mapVector(this.props.scope.eventsFunction.getParameters(),
        (parameterMetadata) => (parameterMetadata.isCodeOnly() ||
        gd.ParameterMetadata.isObject(parameterMetadata.getType()) ||
        gd.ParameterMetadata.isBehavior(parameterMetadata.getType())) ? null : { kind: 'Text', completion: `"${parameterMetadata.getName()}"` }).filter(Boolean)
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
