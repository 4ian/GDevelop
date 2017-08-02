import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Instruction from './Instruction.js';
import { mapFor } from '../Utils/MapFor';
import { isInstructionSelected } from './SelectionHandler';

const styles = {
  addButton: {
    cursor: 'pointer',
  },
};

export default class InstructionsList extends Component {
  static propTypes = {
    instrsList: PropTypes.object.isRequired,
    areConditions: PropTypes.bool.isRequired,
    onAddNewInstruction: PropTypes.func.isRequired,
    onInstructionClick: PropTypes.func.isRequired,
    onInstructionDoubleClick: PropTypes.func.isRequired,
    onParameterClick: PropTypes.func.isRequired,
    selection: PropTypes.object.isRequired,
  };

  onAddNewInstruction = () => {
    if (this.props.onAddNewInstruction) this.props.onAddNewInstruction({
      instrsList: this.props.instrsList,
      isCondition: this.props.areConditions,
    });
  };

  render() {
    const instructions = mapFor(0, this.props.instrsList.size(), i => {
      const instruction = this.props.instrsList.get(i);
      return (
        <Instruction
          instruction={instruction}
          isCondition={this.props.areConditions}
          instrsList={this.props.instrsList}
          index={i}
          key={instruction.ptr}
          selected={isInstructionSelected(this.props.selection, instruction)}
          onClick={() => this.props.onInstructionClick({
            isCondition: this.props.areConditions,
            instrsList: this.props.instrsList,
            instruction,
            indexInList: i,
          })}
          onDoubleClick={() => this.props.onInstructionDoubleClick({
            isCondition: this.props.areConditions,
            instrsList: this.props.instrsList,
            instruction,
            indexInList: i,
          })}
          onParameterClick={(domEvent, parameterIndex) => this.props.onParameterClick({
            isCondition: this.props.areConditions,
            instrsList: this.props.instrsList,
            instruction,
            indexInList: i,
            parameterIndex,
            domEvent,
          })}
        />
      );
    });

    return (
      <div style={this.props.style}>
        {instructions}
        <a style={styles.addButton} className="add-link" onClick={this.onAddNewInstruction}>
          {this.props.areConditions ? 'Add condition' : 'Add action'}
        </a>
      </div>
    );
  }
}
