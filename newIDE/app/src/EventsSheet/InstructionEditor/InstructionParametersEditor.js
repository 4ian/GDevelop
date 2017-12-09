import React, { Component } from 'react';
import Divider from 'material-ui/Divider';
import Toggle from 'material-ui/Toggle';
import { mapFor } from '../../Utils/MapFor';
import EmptyMessage from '../../UI/EmptyMessage';
import ParameterRenderingService from './ParameterRenderingService';
const gd = global.gd;

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
  },
  emptyContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  parametersContainer: {
    flex: 1,
    overflowY: 'auto',
  },
  instructionHeader: {
    display: 'flex',
    alignItems: 'center',
  },
  icon: {
    width: 24,
    height: 24,
    marginRight: 8,
  },
  invertToggle: {
    marginTop: 8,
  },
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
            : 'Choose an action on the left'}
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
      <div style={styles.container}>
        <div style={styles.instructionHeader}>
          <img
            src={instructionMetadata.getIconFilename()}
            alt=""
            style={styles.icon}
          />
          <p>{instructionMetadata.getDescription()}</p>
        </div>
        <Divider />
        <div key={type} style={styles.parametersContainer}>
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
                instructionOrExpression={instruction}
                key={i}
                onChange={value => {
                  instruction.setParameter(i, value);
                  this.forceUpdate();
                }}
                parameterRenderingService={ParameterRenderingService}
              />
            );
          })}
          {this._getNonCodeOnlyParametersCount(instructionMetadata) === 0 && (
            <EmptyMessage>There is nothing to configure.</EmptyMessage>
          )}
          {this.props.isCondition && (
            <Toggle
              label="Invert condition"
              labelPosition="right"
              toggled={instruction.isInverted()}
              style={styles.invertToggle}
              onToggle={(e, enabled) => {
                instruction.setInverted(enabled);
                this.forceUpdate();
              }}
            />
          )}
        </div>
      </div>
    );
  }
}
