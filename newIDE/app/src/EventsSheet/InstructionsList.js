import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Instruction from './Instruction.js';
import { mapFor } from '../Utils/MapFor';
import { isInstructionSelected } from './SelectionHandler';

const styles = {
  conditionsContainer: {
    paddingLeft: 5,
    paddingRight: 5,
    background: '#f1f2f2',
    borderRight: '1px solid #d3d3d3',
  },
  actionsContainer: {
    paddingLeft: 5,
    paddingRight: 5,
  },
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
    onInstructionContextMenu: PropTypes.func.isRequired,
    onInstructionsListContextMenu: PropTypes.func.isRequired,
    onParameterClick: PropTypes.func.isRequired,
    selection: PropTypes.object.isRequired,
    addButtonLabel: PropTypes.string,
  };

  onAddNewInstruction = () => {
    if (this.props.onAddNewInstruction)
      this.props.onAddNewInstruction({
        instrsList: this.props.instrsList,
        isCondition: this.props.areConditions,
      });
  };

  render() {
    const instructionsListContext = {
      isCondition: this.props.areConditions,
      instrsList: this.props.instrsList,
    };

    const instructions = mapFor(0, this.props.instrsList.size(), i => {
      const instruction = this.props.instrsList.get(i);
      const instructionContext = {
        isCondition: this.props.areConditions,
        instrsList: this.props.instrsList,
        instruction,
        indexInList: i,
      };

      return (
        <Instruction
          instruction={instruction}
          isCondition={this.props.areConditions}
          instrsList={this.props.instrsList}
          index={i}
          key={instruction.ptr}
          selected={isInstructionSelected(this.props.selection, instruction)}
          onClick={() => this.props.onInstructionClick(instructionContext)}
          onDoubleClick={() =>
            this.props.onInstructionDoubleClick(instructionContext)}
          onContextMenu={(x, y) =>
            this.props.onInstructionContextMenu(x, y, instructionContext)}
          onParameterClick={(domEvent, parameterIndex) =>
            this.props.onParameterClick({
              ...instructionContext,
              parameterIndex,
              domEvent,
            })}
          selection={this.props.selection}
          onAddNewSubInstruction={this.props.onAddNewInstruction}
          onSubInstructionClick={this.props.onInstructionClick}
          onSubInstructionDoubleClick={this.props.onInstructionDoubleClick}
          onSubInstructionContextMenu={this.props.onInstructionContextMenu}
          onSubInstructionsListContextMenu={
            this.props.onInstructionsListContextMenu
          }
          onSubParameterClick={this.props.onParameterClick}
        />
      );
    });

    const containerStyle = this.props.areConditions
      ? styles.conditionsContainer
      : styles.actionsContainer;

    const addButtonLabel = this.props.areConditions
      ? 'Add condition'
      : 'Add action';
    return (
      <div style={{ ...containerStyle, ...this.props.style }}>
        {instructions}
        <a
          style={styles.addButton}
          className="add-link"
          onClick={this.onAddNewInstruction}
          onContextMenu={e => {
            e.stopPropagation();
            this.props.onInstructionsListContextMenu(
              e.clientX,
              e.clientY,
              instructionsListContext
            );
          }}
        >
          {this.props.addButtonLabel || addButtonLabel}
        </a>
      </div>
    );
  }
}
