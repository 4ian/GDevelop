import React, { Component } from 'react';
import Divider from 'material-ui/Divider';
import { mapFor } from '../../Utils/MapFor';
import EmptyMessage from '../../UI/EmptyMessage';
import ParameterRenderingService from './ParameterRenderingService';
const gd = global.gd;

const styles = {
  emptyContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  instructionHeader: {
    display: 'flex',
    alignItems: 'center',
  },
  explanationText: {
    flex: 1,
  },
  icon: {
    width: 24,
    height: 24,
    marginRight: 8,
  }
};

export default class InstructionParametersEditor extends Component {
  _getNonCodeOnlyParametersCount(instructionMetadata) {
    return mapFor(0, instructionMetadata.getParametersCount(), i => {
      const parameterMetadata = instructionMetadata.getParameter(i);
      return !parameterMetadata.isCodeOnly();
    }).filter(isVisible => isVisible).length;
  }

  _renderEmpty() {
    return (
      <div style={{ ...styles.emptyContainer, ...this.props.style }}>
        <EmptyMessage>
          {this.props.isCondition
            ? 'Choose a condition on the left'
            : 'Choose a condition on the right'}
        </EmptyMessage>
      </div>
    );
  }

  render() {
    const { instruction, isCondition, project, layout } = this.props;
    const type = instruction.getType();
    if (!type) return this._renderEmpty();

    const instructionMetadata = isCondition
      ? gd.MetadataProvider.getConditionMetadata(
          project.getCurrentPlatform(),
          type
        )
      : gd.MetadataProvider.getActionMetadata(
          project.getCurrentPlatform(),
          type
        );

    //TODO?
    instruction.setParametersCount(instructionMetadata.getParametersCount());

    return (
      <div style={this.props.style}>
        <div style={styles.instructionHeader}>
          <img src={instructionMetadata.getIconFilename()} alt="" style={styles.icon} />
          <p styles={styles.explanationText}>
            {instructionMetadata.getDescription()}
          </p>
        </div>
        <Divider />
        <div>
          {mapFor(0, instructionMetadata.getParametersCount(), i => {
            const parameterMetadata = instructionMetadata.getParameter(i);
            const ParameterComponent = ParameterRenderingService.getParameterComponent(
              parameterMetadata.getType()
            );

            if (parameterMetadata.isCodeOnly()) return null;
            return (
              <ParameterComponent
                parameterMetadata={parameterMetadata}
                project={project}
                layout={layout}
                value={instruction.getParameter(i)}
                key={i}
                onChange={value => {
                  instruction.setParameter(i, value);
                  this.forceUpdate();
                }}
              />
            );
          })}
          {this._getNonCodeOnlyParametersCount(instructionMetadata) === 0 &&
            <EmptyMessage>
              There is nothing to configure.
            </EmptyMessage>}
        </div>
      </div>
    );
  }
}
