import React, { Component } from 'react';
import { mapFor } from '../../../../Utils/MapFor';
import EmptyMessage from '../../../../UI/EmptyMessage';

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
  },
};

export default class ExpressionParametersEditor extends Component {
  static getNonCodeOnlyParametersCount(expressionMetadata) {
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
      parameterRenderingService,
    } = this.props;

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
        ) === 0 && <EmptyMessage>There is nothing to configure.</EmptyMessage>}
      </div>
    );
  }
}
