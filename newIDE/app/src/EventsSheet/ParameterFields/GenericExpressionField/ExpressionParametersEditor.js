// @flow
import { Trans } from '@lingui/macro';
import { type EventsScope } from '../../../InstructionOrExpression/EventsScope.flow';
import * as React from 'react';
import { mapFor } from '../../../Utils/MapFor';
import EmptyMessage from '../../../UI/EmptyMessage';

export type ParameterValues = Array<string>;

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
  },
};

type Props = {|
  project?: gdProject,
  scope: EventsScope,
  globalObjectsContainer: gdObjectsContainer,
  objectsContainer: gdObjectsContainer,
  expressionMetadata: gdExpressionMetadata,
  parameterValues: ParameterValues,
  onChangeParameter: (index: number, value: string) => void,
  parameterRenderingService?: {
    components: any,
    getParameterComponent: (type: string) => any,
  },
|};

export const hasNonCodeOnlyParameters = (
  expressionMetadata: gdExpressionMetadata
) =>
  mapFor(0, expressionMetadata.getParametersCount(), i => {
    const parameterMetadata = expressionMetadata.getParameter(i);
    return !parameterMetadata.isCodeOnly();
  }).filter(isVisible => isVisible).length !== 0;

const ExpressionParametersEditor = ({
  expressionMetadata,
  parameterValues,
  project,
  scope,
  globalObjectsContainer,
  objectsContainer,
  parameterRenderingService,
  onChangeParameter,
}: Props) => {
  if (!parameterRenderingService) {
    console.error(
      'Missing parameterRenderingService for ExpressionParametersEditor'
    );
    return null;
  }

  // Create an object mimicking Instruction interface so that it can be used by
  // ParameterFields components.
  const parametersCount = expressionMetadata.getParametersCount();
  const expression = {
    getParametersCount: () => parametersCount,
    getParameter: index => {
      return parameterValues[index] || '';
    },
  };

  return (
    <div style={styles.container}>
      {mapFor(0, expressionMetadata.getParametersCount(), i => {
        const parameterMetadata = expressionMetadata.getParameter(i);
        const ParameterComponent = parameterRenderingService.getParameterComponent(
          parameterMetadata.getType()
        );

        if (parameterMetadata.isCodeOnly()) return null;
        return (
          <ParameterComponent
            expressionMetadata={expressionMetadata}
            expression={expression}
            parameterMetadata={parameterMetadata}
            parameterIndex={i}
            value={parameterValues[i]}
            onChange={value => onChangeParameter(i, value)}
            project={project}
            scope={scope}
            globalObjectsContainer={globalObjectsContainer}
            objectsContainer={objectsContainer}
            key={i}
            parameterRenderingService={parameterRenderingService}
          />
        );
      })}
      {!hasNonCodeOnlyParameters(expressionMetadata) && (
        <EmptyMessage>
          <Trans>There is nothing to configure.</Trans>
        </EmptyMessage>
      )}
    </div>
  );
};

export default ExpressionParametersEditor;
