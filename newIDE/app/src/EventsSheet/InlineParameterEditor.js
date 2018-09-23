// @flow
import * as React from 'react';
import InlinePopover from './InlinePopover';
import ParameterRenderingService from './InstructionEditor/ParameterRenderingService';
import {
  type ResourceSource,
  type ChooseResourceFunction,
} from '../ResourcesList/ResourceSource.flow';
import { type ResourceExternalEditor } from '../ResourcesList/ResourceExternalEditor.flow';
const gd = global.gd;

type Props = {|
  project: gdProject,
  layout: ?gdLayout,
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
  isValid: boolean,
  parameterMetadata: ?gdParameterMetadata,
  ParameterComponent: ?any,
|};

export default class InlineParameterEditor extends React.Component<
  Props,
  State
> {
  state = {
    isValid: false,
    parameterMetadata: null,
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
      },
      () => {
        if (this._field && this._field.focus) this._field.focus();
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
          parameterMetadata={this.state.parameterMetadata}
          project={this.props.project}
          layout={this.props.layout}
          globalObjectsContainer={this.props.globalObjectsContainer}
          objectsContainer={this.props.objectsContainer}
          value={instruction.getParameter(this.props.parameterIndex)}
          instructionOrExpression={instruction}
          key={instruction.ptr}
          onChange={this.props.onChange}
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
