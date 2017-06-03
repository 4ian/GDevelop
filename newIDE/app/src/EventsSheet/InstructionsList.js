import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Instruction from './Instruction.js';

export default class InstructionsList extends Component {
  static propTypes = {
    instrsList: PropTypes.object.isRequired,
    areConditions: PropTypes.bool.isRequired,
    callbacks: PropTypes.object.isRequired,
  }

  handleAddInstruction = () => {
    const { callbacks } = this.props;
    callbacks.onAddNewInstruction(this.props);
  }

  shouldComponentUpdate(nextProps) {
    if (this.props.instrsList.ptr !== nextProps.instrsList.ptr) return true;

    if (this.lastChangesHash !== nextProps.instrsList.lastChangesHash)
      return true;

    return false;
  }

  render() {
    this.lastChangesHash = this.props.instrsList.lastChangesHash;

    var children = [];
    children.push(
      React.createElement(
        'button',
        {
          key: 'addInstrButton',
          className: 'btn btn-xs btn-default add-instruction-button',
          onClick: this.handleAddInstruction,
        },
        '+'
      )
    );
    for (var i = 0; i < this.props.instrsList.size(); ++i) {
      var instruction = this.props.instrsList.get(i);
      children.push(
        React.createElement(Instruction, {
          instruction: instruction,
          isCondition: this.props.areConditions,
          instrsList: this.props.instrsList,
          index: i,
          key: instruction.ptr,
          callbacks: this.props.callbacks,
        })
      );
    }
    if (this.props.instrsList.size() === 0) {
      children.push(
        React.createElement(
          'span',
          {
            key: 'noInstructions',
            className: 'instruction',
            onClick: this.handleAddInstruction,
          },
          this.props.areConditions ? 'No conditions' : 'No actions'
        )
      );
    }

    return React.createElement(
      'div',
      {
        className: 'instructions-list ' + this.props.className,
      },
      children
    );
  }
}
