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

const gd: libGDevelop = global.gd;

export default React.forwardRef<ParameterFieldProps, ParameterFieldInterface>(
  function FunctionParameterNameField(props: ParameterFieldProps, ref) {
    const field = React.useRef<?GenericExpressionField>(null);
    const focus: FieldFocusFunction = options => {
      if (field.current) field.current.focus(options);
    };
    React.useImperativeHandle(ref, () => ({
      focus,
    }));

    const { parameterMetadata } = props;
    const allowedParameterTypes =
      parameterMetadata && parameterMetadata.getExtraInfo()
        ? parameterMetadata.getExtraInfo().split(',')
        : [];

    const eventsBasedEntity =
      props.scope.eventsBasedBehavior || props.scope.eventsBasedObject;
    const functionsContainer = eventsBasedEntity
      ? eventsBasedEntity.getEventsFunctions()
      : props.scope.eventsFunctionsExtension;
    const parameterNames: Array<ExpressionAutocompletion> =
      props.scope.eventsFunction && functionsContainer
        ? enumerateParametersUsableInExpressions(
            functionsContainer,
            props.scope.eventsFunction,
            allowedParameterTypes
          ).map(parameterMetadata => ({
            kind: 'Text',
            completion: `"${parameterMetadata.getName()}"`,
          }))
        : [];

    const errorText = props.value;

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
