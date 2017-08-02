import React, { Component } from 'react';
import Popover from 'material-ui/Popover';
import ParameterRenderingService
  from './InstructionEditor/ParameterRenderingService';
const gd = global.gd;

const styles = {
  popover: {
    paddingBottom: 10,
    paddingLeft: 5,
    paddingRight: 5,
    maxWidth: 600,
    height: 80,
    overflowY: 'hidden',
  },
  contentContainer: {
    overflow: 'hidden',
  },
};

export default class InlineParameterEditor extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isValid: false,
      parameterMetadata: null,
    };
  }

  componentWillReceiveProps(newProps) {
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
      instruction: null,
    });
  }

  _loadComponentFromInstruction(props) {
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
    this.setState({
      ParameterComponent,
      parameterMetadata,
    }, () => {
      if (this._field && this._field.focus) this._field.focus();
    });
  }

  render() {
    if (!this.state.ParameterComponent || !this.props.open)
      return null;

    const { ParameterComponent } = this.state;

    return (
      <Popover
        open={this.props.open}
        anchorEl={this.props.anchorEl}
        style={styles.popover}
        anchorOrigin={{ horizontal: 'middle', vertical: 'bottom' }}
        targetOrigin={{ horizontal: 'middle', vertical: 'top' }}
        onRequestClose={this.props.onRequestClose}
      >
        <div style={styles.contentContainer}>
          <ParameterComponent
            parameterMetadata={this.state.parameterMetadata}
            project={this.props.project}
            layout={this.props.layout}
            value={this.props.instruction.getParameter(
              this.props.parameterIndex
            )}
            key={this.props.instruction.ptr}
            onChange={this.props.onChange}
            ref={field => this._field = field}
            isInline
          />
        </div>
      </Popover>
    );
  }
}
