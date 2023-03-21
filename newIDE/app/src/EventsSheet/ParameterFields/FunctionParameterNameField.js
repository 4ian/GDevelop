// @flow
import React from 'react';
import GenericExpressionField from './GenericExpressionField';
import {
  type ParameterFieldProps,
  type ParameterFieldInterface,
  type FieldFocusFunction,
} from './ParameterFieldCommons';
import { type ExpressionAutocompletion } from '../../ExpressionAutocompletion';
import { enumerateParametersUsableInExpressions } from './EnumerateFunctionParameters';

export default React.forwardRef<ParameterFieldProps, ParameterFieldInterface>(
  function FunctionParameterNameField(props: ParameterFieldProps, ref) {
    const field = React.useRef<?GenericExpressionField>(null);
    const focus: FieldFocusFunction = options => {
      if (field.current) field.current.focus(options);
    };
    React.useImperativeHandle(ref, () => ({
      focus,
    }));

    const eventsBasedEntity =
      props.scope.eventsBasedBehavior || props.scope.eventsBasedObject;
    const functionsContainer = eventsBasedEntity
      ? eventsBasedEntity.getEventsFunctions()
      : props.scope.eventsFunctionsExtension;
    const parameterNames: Array<ExpressionAutocompletion> =
      props.scope.eventsFunction && functionsContainer
        ? enumerateParametersUsableInExpressions(
            functionsContainer,
            props.scope.eventsFunction
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
        ref={field}
        {...props}
      />
    );
  }
);
