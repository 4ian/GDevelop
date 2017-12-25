import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Instruction from './Instruction';
import { mapFor } from '../../Utils/MapFor';
import { isInstructionSelected } from '../SelectionHandler';
import { actionsContainer, conditionsContainer } from './ClassNames';

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
    const {
      addButtonLabel,
      areConditions,
      extraClassName,
      instrsList,
      onAddNewInstruction,
      onInstructionClick,
      onInstructionContextMenu,
      onInstructionDoubleClick,
      onInstructionsListContextMenu,
      onParameterClick,
      selection,
      style,
    } = this.props;

    const instructions = mapFor(0, instrsList.size(), i => {
      const instruction = instrsList.get(i);
      const instructionContext = {
        isCondition: areConditions,
        instrsList: instrsList,
        instruction,
        indexInList: i,
      };

      return (
        <Instruction
          instruction={instruction}
          isCondition={areConditions}
          instrsList={instrsList}
          index={i}
          key={instruction.ptr}
          selected={isInstructionSelected(selection, instruction)}
          onClick={() => onInstructionClick(instructionContext)}
          onDoubleClick={() =>
            onInstructionDoubleClick(instructionContext)}
          onContextMenu={(x, y) =>
            onInstructionContextMenu(x, y, instructionContext)}
          onParameterClick={(domEvent, parameterIndex) =>
            onParameterClick({
              ...instructionContext,
              parameterIndex,
              domEvent,
            })}
          selection={selection}
          onAddNewSubInstruction={onAddNewInstruction}
          onSubInstructionClick={onInstructionClick}
          onSubInstructionDoubleClick={onInstructionDoubleClick}
          onSubInstructionContextMenu={onInstructionContextMenu}
          onSubInstructionsListContextMenu={
            onInstructionsListContextMenu
          }
          onSubParameterClick={onParameterClick}
        />
      );
    });

    const instructionsListContext = {
      isCondition: areConditions,
      instrsList: instrsList,
    };
    const addButtonDefaultLabel = areConditions
      ? 'Add condition'
      : 'Add action';
    return (
      <div
        className={`${areConditions
          ? conditionsContainer
          : actionsContainer} ${extraClassName || ''}`}
        style={style}
      >
        {instructions}
        <a
          style={styles.addButton}
          className="add-link"
          onClick={this.onAddNewInstruction}
          onContextMenu={e => {
            e.stopPropagation();
            onInstructionsListContextMenu(
              e.clientX,
              e.clientY,
              instructionsListContext
            );
          }}
        >
          {addButtonLabel || addButtonDefaultLabel}
        </a>
      </div>
    );
  }
}
