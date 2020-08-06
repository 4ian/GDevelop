// @flow
import * as React from 'react';
import InlinePopover from './InlinePopover';
import ParameterRenderingService from './ParameterRenderingService';
import {
  type ResourceSource,
  type ChooseResourceFunction,
} from '../ResourcesList/ResourceSource.flow';
import { type ResourceExternalEditor } from '../ResourcesList/ResourceExternalEditor.flow';
import { type EventsScope } from '../InstructionOrExpression/EventsScope.flow';
const gd: libGDevelop = global.gd;

type Props = {|
  project: gdProject,
  scope: EventsScope,
  globalObjectsContainer: gdObjectsContainer,
  objectsContainer: gdObjectsContainer,

  open: boolean,
  onRequestClose: () => void,
  onChange: string => void,

  instruction: ?gdInstruction,
  isCondition: boolean,
  parameterIndex: number,

  anchorEl: ?any,

  resourceSources: Array<ResourceSource>,
  onChooseResource: ChooseResourceFunction,
  resourceExternalEditors: Array<ResourceExternalEditor>,
|};

type State = {|
  parameterMetadata: ?gdParameterMetadata,
  instructionMetadata: ?gdInstructionMetadata,
  ParameterComponent: ?any,
|};

export default class InlineParameterEditor extends React.Component<
  Props,
  State
> {
  state = {
    parameterMetadata: null,
    instructionMetadata: null,
    ParameterComponent: null,
  };

  _field: ?any;

  componentWillReceiveProps(newProps: Props) {
    if (
      (newProps.open && !this.props.open) ||
      newProps.instruction !== this.props.instruction
    ) {
      this._loadComponentFromInstruction(newProps);
    }
  }

  _unload() {
    this.setState({
      ParameterComponent: null,
      parameterMetadata: null,
      instructionMetadata: null,
    });
  }

  _loadComponentFromInstruction(props: Props) {
    const { project, isCondition, instruction, parameterIndex } = props;
    if (!instruction) return this._unload();

    const type = instruction.getType();
    const instructionMetadata = isCondition
      ? gd.MetadataProvider.getConditionMetadata(
          project.getCurrentPlatform(),
          type
        )
      : gd.MetadataProvider.getActionMetadata(
          project.getCurrentPlatform(),
          type
        );

    if (parameterIndex >= instructionMetadata.getParametersCount())
      return this._unload();

    const parameterMetadata = instructionMetadata.getParameter(parameterIndex);
    const ParameterComponent = ParameterRenderingService.getParameterComponent(
      parameterMetadata.getType()
    );
    this.setState(
      {
        ParameterComponent,
        parameterMetadata,
        instructionMetadata,
      },
      () => {
        // Give a bit of time for the popover to mount itself
        setTimeout(() => {
          if (this._field && this._field.focus) this._field.focus();
        }, 10);
      }
    );
  }

  render() {
    if (!this.state.ParameterComponent || !this.props.open) return null;
    const instruction = this.props.instruction;
    if (!instruction) return null;

    const { ParameterComponent } = this.state;

    return (
      <InlinePopover
        open={this.props.open}
        anchorEl={this.props.anchorEl}
        onRequestClose={this.props.onRequestClose}
      >
        <ParameterComponent
          instruction={instruction}
          instructionMetadata={this.state.instructionMetadata}
          parameterMetadata={this.state.parameterMetadata}
          parameterIndex={this.props.parameterIndex}
          value={instruction.getParameter(this.props.parameterIndex)}
          onChange={this.props.onChange}
          onRequestClose={this.props.onRequestClose}
          project={this.props.project}
          scope={this.props.scope}
          globalObjectsContainer={this.props.globalObjectsContainer}
          objectsContainer={this.props.objectsContainer}
          key={instruction.ptr}
          ref={field => (this._field = field)}
          parameterRenderingService={ParameterRenderingService}
          isInline
          resourceSources={this.props.resourceSources}
          onChooseResource={this.props.onChooseResource}
          resourceExternalEditors={this.props.resourceExternalEditors}
        />
      </InlinePopover>
    );
  }
}
