import React, { Component } from 'react';
import InstructionTypeSelector from './InstructionTypeSelector.js'

export default class InstructionEditor extends Component {
  render() {
    const { instruction } = this.props;

    //TODO: stepper
    return (
      <div>
        {instruction.getType()}
        <InstructionTypeSelector
          isCondition={this.props.isCondition}
          onChoose={(type) => {
            instruction.setType(type);
            this.forceUpdate();
          }}
        />
      </div>
    )
  }
}
