// @flow
import { Trans } from '@lingui/macro';

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
  layout?: ?gdLayout,
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
type State = {||};

export default class ExpressionParametersEditor extends React.Component<
  Props,
  State
> {
  static getNonCodeOnlyParametersCount(
    expressionMetadata: gdExpressionMetadata
  ) {
    return mapFor(0, expressionMetadata.getParametersCount(), i => {
      const parameterMetadata = expressionMetadata.getParameter(i);
      return !parameterMetadata.isCodeOnly();
    }).filter(isVisible => isVisible).length;
  }

  render() {
    const {
      expressionMetadata,
      parameterValues,
      project,
      layout,
      globalObjectsContainer,
      objectsContainer,
      parameterRenderingService,
    } = this.props;

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
              parameterMetadata={parameterMetadata}
              project={project}
              layout={layout}
              globalObjectsContainer={globalObjectsContainer}
              objectsContainer={objectsContainer}
              value={parameterValues[i]}
              instructionOrExpression={expression}
              key={i}
              onChange={value => this.props.onChangeParameter(i, value)}
              parameterRenderingService={parameterRenderingService}
            />
          );
        })}
        {ExpressionParametersEditor.getNonCodeOnlyParametersCount(
          expressionMetadata
        ) === 0 && (
          <EmptyMessage>
            <Trans>There is nothing to configure.</Trans>
          </EmptyMessage>
        )}
      </div>
    );
  }
}
