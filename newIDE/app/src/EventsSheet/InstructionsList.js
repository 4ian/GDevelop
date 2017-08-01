import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Instruction from './Instruction.js';
import { mapFor } from '../Utils/MapFor';

const styles = {
  addButton: {
    opacity: 0.3,
    cursor: 'pointer',
  },
};

export default class InstructionsList extends Component {
  static propTypes = {
    instrsList: PropTypes.object.isRequired,
    areConditions: PropTypes.bool.isRequired,
    onAddNewInstruction: PropTypes.func,
  };

  handleAddInstruction = () => {
    if (this.props.onAddNewInstruction) this.props.onAddNewInstruction();
  };

  shouldComponentUpdate(nextProps) {
    if (this.props.instrsList.ptr !== nextProps.instrsList.ptr) return true;

    if (this.lastChangesHash !== nextProps.instrsList.lastChangesHash)
      return true;

    return false;
  }

  render() {
    this.lastChangesHash = this.props.instrsList.lastChangesHash;

    const instructions = mapFor(0, this.props.instrsList.size(), i => {
      const instruction = this.props.instrsList.get(i);
      return (
        <Instruction
          instruction={instruction}
          isCondition={this.props.areConditions}
          instrsList={this.props.instrsList}
          index={i}
          key={instruction.ptr}
        />
      );
    });

    return (
      <div style={this.props.style}>
        {instructions}
        <a style={styles.addButton} onClick={this.handleAddInstruction}>
          {this.props.areConditions ? 'Add condition' : 'Add action'}
        </a>
      </div>
    );
  }
}
