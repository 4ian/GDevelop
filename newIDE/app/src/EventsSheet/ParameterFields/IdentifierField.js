// @flow
import React from 'react';
import {
  type ParameterFieldProps,
  type ParameterFieldInterface,
  type FieldFocusFunction,
} from './ParameterFieldCommons';
import GenericExpressionField from './GenericExpressionField';
import { type ExpressionAutocompletion } from '../../ExpressionAutocompletion';
import { getLastObjectParameterValue } from './ParameterMetadataTools';
import TimelineNameField, {
  timelineNameIdentifierExtraInfo,
} from './TimelineNameField';
import TimelineBindingNameField, {
  timelineBindingNameIdentifierExtraInfo,
} from './TimelineBindingNameField';

const gd: libGDevelop = global.gd;

const IdentifierExpressionField = React.forwardRef<
  ParameterFieldProps,
  ParameterFieldInterface
>(function IdentifierExpressionField(props, ref) {
  const {
    project,
    scope,
    instructionMetadata,
    instruction,
    expressionMetadata,
    expression,
    parameterIndex,
  } = props;
  const { layout } = scope;

  const objectName =
    getLastObjectParameterValue({
      instructionMetadata,
      instruction,
      expressionMetadata,
      expression,
      parameterIndex,
    }) || '';

  const autocompletionIdentifierNames: Array<ExpressionAutocompletion> = React.useMemo(
    () => {
      if (parameterIndex === undefined) {
        return [];
      }
      const parameterMetadata = instructionMetadata
        ? instructionMetadata.getParameter(parameterIndex)
        : expressionMetadata
        ? expressionMetadata.getParameter(parameterIndex)
        : null;
      const identifierName = parameterMetadata
        ? parameterMetadata.getExtraInfo()
        : '';

      const allIdentifierExpressions =
        project && layout
          ? gd.EventsIdentifiersFinder.findAllIdentifierExpressions(
              project.getCurrentPlatform(),
              project,
              layout,
              identifierName,
              objectName
            )
              .toNewVectorString()
              .toJSArray()
          : [];

      return allIdentifierExpressions.map(expression => ({
        kind: 'FullExpression',
        completion: expression,
      }));
    },
    [
      project,
      layout,
      expressionMetadata,
      instructionMetadata,
      parameterIndex,
      // Users can change the objectName with other fields.
      objectName,
    ]
  );

  const field = React.useRef<?GenericExpressionField>(null);

  const focus: FieldFocusFunction = options => {
    if (field.current) field.current.focus(options);
  };
  React.useImperativeHandle(ref, () => ({
    focus,
  }));

  React.useEffect(() => {
    focus();
  }, []);

  return (
    <GenericExpressionField
      expressionType="string"
      onGetAdditionalAutocompletions={expression =>
        autocompletionIdentifierNames.filter(
          ({ completion }) => completion.indexOf(expression) === 0
        )
      }
      id={
        props.parameterIndex !== undefined
          ? `parameter-${props.parameterIndex}-identifier`
          : undefined
      }
      ref={field}
      {...props}
    />
  );
});

export default (React.forwardRef<ParameterFieldProps, ParameterFieldInterface>(
  function IdentifierField(props, ref) {
    const parameterMetadata =
      props.parameterMetadata ||
      (props.parameterIndex !== undefined
        ? props.instructionMetadata
          ? props.instructionMetadata.getParameter(props.parameterIndex)
          : props.expressionMetadata
          ? props.expressionMetadata.getParameter(props.parameterIndex)
          : null
        : null);

    if (
      parameterMetadata &&
      parameterMetadata.getExtraInfo() === timelineNameIdentifierExtraInfo
    ) {
      return <TimelineNameField {...props} ref={ref} />;
    }
    if (
      parameterMetadata &&
      parameterMetadata.getExtraInfo() ===
        timelineBindingNameIdentifierExtraInfo
    ) {
      return <TimelineBindingNameField {...props} ref={ref} />;
    }

    return <IdentifierExpressionField {...props} ref={ref} />;
  }
): React.ComponentType<{
  ...ParameterFieldProps,
  +ref?: React.RefSetter<ParameterFieldInterface>,
}>);
