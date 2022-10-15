// @flow
import React from 'react';
import { type ParameterFieldProps } from './ParameterFieldCommons';
import GenericExpressionField from './GenericExpressionField';
import { type ExpressionAutocompletion } from '../../ExpressionAutocompletion';
import { getLastObjectParameterValue } from './ParameterMetadataTools';

const gd: libGDevelop = global.gd;

type Props = {|
  ...ParameterFieldProps,
|};

export const IdentifierField = (props: Props) => {
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

  const autocompletionIdentifierNames: ExpressionAutocompletion[] = React.useMemo(
    () => {
      if (!parameterIndex) {
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

  React.useEffect(() => {
    if (field.current) {
      field.current.focus();
    }
  }, []);

  return (
    <GenericExpressionField
      expressionType="string"
      onGetAdditionalAutocompletions={expression =>
        autocompletionIdentifierNames.filter(
          ({ completion }) => completion.indexOf(expression) === 0
        )
      }
      ref={field}
      {...props}
    />
  );
};
