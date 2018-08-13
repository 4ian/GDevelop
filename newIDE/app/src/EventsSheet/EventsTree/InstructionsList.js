// @flow
import * as React from 'react';
import Instruction from './Instruction';
import { mapFor } from '../../Utils/MapFor';
import {
  isInstructionSelected,
  type InstructionsListContext,
  type InstructionContext,
  type ParameterContext,
} from '../SelectionHandler';
import { actionsContainer, conditionsContainer } from './ClassNames';

const styles = {
  addButton: {
    cursor: 'pointer',
  },
};

type Props = {
  instrsList: gdInstructionsList,
  areConditions: boolean,
  onAddNewInstruction: InstructionsListContext => void,
  onInstructionClick: InstructionContext => void,
  onInstructionDoubleClick: InstructionContext => void,
  onInstructionContextMenu: (x: number, y: number, InstructionContext) => void,
  onInstructionsListContextMenu: (
    x: number,
    y: number,
    InstructionsListContext
  ) => void,
  onParameterClick: ParameterContext => void,
  selection: any,
  addButtonLabel?: string,
  extraClassName?: string,
  style?: Object,
  disabled: boolean,
};

export default class InstructionsList extends React.Component<Props, *> {
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
      disabled,
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
          onDoubleClick={() => onInstructionDoubleClick(instructionContext)}
          onContextMenu={(x, y) =>
            onInstructionContextMenu(x, y, instructionContext)}
          onParameterClick={(domEvent, parameterIndex) =>
            onParameterClick({
              isCondition: instructionContext.isCondition,
              instrsList: instructionContext.instrsList,
              instruction: instructionContext.instruction,
              indexInList: instructionContext.indexInList,
              parameterIndex,
              domEvent,
            })}
          selection={selection}
          onAddNewSubInstruction={onAddNewInstruction}
          onSubInstructionClick={onInstructionClick}
          onSubInstructionDoubleClick={onInstructionDoubleClick}
          onSubInstructionContextMenu={onInstructionContextMenu}
          onSubInstructionsListContextMenu={onInstructionsListContextMenu}
          onSubParameterClick={onParameterClick}
          disabled={disabled}
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
