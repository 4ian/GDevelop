// @flow
import * as React from 'react';
import Divider from 'material-ui/Divider';
import Toggle from 'material-ui/Toggle';
import { mapFor } from '../../Utils/MapFor';
import EmptyMessage from '../../UI/EmptyMessage';
import ParameterRenderingService from './ParameterRenderingService';
import HelpButton from '../../UI/HelpButton';
import {
  type ResourceSource,
  type ChooseResourceFunction,
} from '../../ResourcesList/ResourceSource.flow';
import { type ResourceExternalEditor } from '../../ResourcesList/ResourceExternalEditor.flow';
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

type Props = {|
  project: gdProject,
  layout: ?gdLayout,
  globalObjectsContainer: gdObjectsContainer,
  objectsContainer: gdObjectsContainer,
  instruction: gdInstruction,
  isCondition: boolean,
  focusOnMount?: boolean,
  resourceSources: Array<ResourceSource>,
  onChooseResource: ChooseResourceFunction,
  resourceExternalEditors: Array<ResourceExternalEditor>,
  style?: Object,
|};
type State = {||};

export default class InstructionParametersEditor extends React.Component<
  Props,
  State
> {
  _firstVisibleField: ?any = {};

  componentDidMount() {
    if (this.props.focusOnMount) {
      setTimeout(() => {
        this.focus();
      }, 300); // Let the time to the dialog that is potentially containing the InstructionParametersEditor to finish its transition.
    }
  }

  focus() {
    // Verify that there is a field to focus.
    if (
      this._getNonCodeOnlyParametersCount(this._getInstructionMetadata()) !== 0
    ) {
      if (this._firstVisibleField && this._firstVisibleField.focus) {
        this._firstVisibleField.focus();
      }
    }
  }

  _getNonCodeOnlyParametersCount(instructionMetadata: ?gdInstructionMetadata) {
    if (!instructionMetadata) return 0;

    return mapFor(0, instructionMetadata.getParametersCount(), i => {
      if (!instructionMetadata) return false;

      const parameterMetadata = instructionMetadata.getParameter(i);
      return !parameterMetadata.isCodeOnly();
    }).filter(isVisible => isVisible).length;
  }

  _getInstructionMetadata = (): ?gdInstructionMetadata => {
    const { instruction, isCondition, project } = this.props;
    const type = instruction.getType();
    if (!type) return null;

    return isCondition
      ? gd.MetadataProvider.getConditionMetadata(
          project.getCurrentPlatform(),
          type
        )
      : gd.MetadataProvider.getActionMetadata(
          project.getCurrentPlatform(),
          type
        );
  };

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
    const {
      instruction,
      project,
      layout,
      globalObjectsContainer,
      objectsContainer,
    } = this.props;

    const type = instruction.getType();
    const instructionMetadata = this._getInstructionMetadata();
    if (!instructionMetadata) return this._renderEmpty();

    const helpPage = instructionMetadata.getHelpPath();

    //TODO?
    instruction.setParametersCount(instructionMetadata.getParametersCount());

    let parameterFieldIndex = 0;
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
            const parameterMetadataType = parameterMetadata.getType();
            const ParameterComponent = ParameterRenderingService.getParameterComponent(
              parameterMetadataType
            );

            if (parameterMetadata.isCodeOnly()) return null;
            if (!ParameterComponent) {
              console.warn(
                'Missing parameter component for',
                parameterMetadataType
              );
              return null;
            }

            // Track the field count on screen, to affect the ref to the
            // first visible field.
            const isFirstVisibleParameterField = parameterFieldIndex === 0;
            parameterFieldIndex++;

            return (
              <ParameterComponent
                parameterMetadata={parameterMetadata}
                project={project}
                layout={layout}
                globalObjectsContainer={globalObjectsContainer}
                objectsContainer={objectsContainer}
                value={instruction.getParameter(i)}
                instructionOrExpression={instruction}
                key={i}
                onChange={value => {
                  instruction.setParameter(i, value);
                  this.forceUpdate();
                }}
                parameterRenderingService={ParameterRenderingService}
                resourceSources={this.props.resourceSources}
                onChooseResource={this.props.onChooseResource}
                resourceExternalEditors={this.props.resourceExternalEditors}
                ref={field => {
                  if (isFirstVisibleParameterField) {
                    this._firstVisibleField = field;
                  }
                }}
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
        <div>
          {helpPage && (
            <HelpButton
              helpPagePath={instructionMetadata.getHelpPath()}
              label={
                this.props.isCondition
                  ? 'Help for this condition'
                  : 'Help for this action'
              }
            />
          )}
        </div>
      </div>
    );
  }
}
