// @flow
import * as React from 'react';
import Instruction, { reactDndInstructionType } from './Instruction';
import { mapFor } from '../../Utils/MapFor';
import {
  isInstructionSelected,
  type InstructionsListContext,
  type InstructionContext,
  type ParameterContext,
} from '../SelectionHandler';
import { actionsContainer, conditionsContainer } from './ClassNames';
import {
  DropTarget,
  type DropTargetMonitor,
  type DropTargetConnector,
  type ConnectDropTarget,
} from 'react-dnd';
import DropIndicator from './DropIndicator';
import { Trans } from '@lingui/macro';

const styles = {
  addButton: {
    cursor: 'pointer',
  },
};

type DropTargetProps = {|
  connectDropTarget: ConnectDropTarget,
  isOver: boolean,
  canDrop: boolean,
|};

type Props = {
  instrsList: gdInstructionsList,
  areConditions: boolean,
  onAddNewInstruction: InstructionsListContext => void,
  onMoveToInstruction: (destinationContext: InstructionContext) => void,
  onMoveToInstructionsList: (
    destinationContext: InstructionsListContext
  ) => void,
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
  addButtonLabel?: React.Node,
  extraClassName?: string,
  style?: Object,
  disabled: boolean,
  ...DropTargetProps,
};

class InstructionsList extends React.Component<Props, *> {
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
      onMoveToInstruction,
      onMoveToInstructionsList,
      onInstructionClick,
      onInstructionContextMenu,
      onInstructionDoubleClick,
      onInstructionsListContextMenu,
      onParameterClick,
      selection,
      style,
      disabled,
    } = this.props;

    const { connectDropTarget, isOver, canDrop } = this.props;

    const instructions = mapFor(0, instrsList.size(), i => {
      const instruction = instrsList.get(i);
      const instructionContext = {
        isCondition: areConditions,
        instrsList: instrsList,
        instruction,
        indexInList: i,
      };

      return (
        // $FlowFixMe - Flow don't see that DropTarget hoc is being used in instructions?
        <Instruction
          instruction={instruction}
          isCondition={areConditions}
          key={instruction.ptr}
          selected={isInstructionSelected(selection, instruction)}
          onMoveToInstruction={() => onMoveToInstruction(instructionContext)}
          onClick={() => onInstructionClick(instructionContext)}
          onDoubleClick={() => onInstructionDoubleClick(instructionContext)}
          onContextMenu={(x, y) =>
            onInstructionContextMenu(x, y, instructionContext)
          }
          onParameterClick={(domEvent, parameterIndex) =>
            onParameterClick({
              isCondition: instructionContext.isCondition,
              instrsList: instructionContext.instrsList,
              instruction: instructionContext.instruction,
              indexInList: instructionContext.indexInList,
              parameterIndex,
              domEvent,
            })
          }
          selection={selection}
          onAddNewSubInstruction={onAddNewInstruction}
          onMoveToSubInstruction={onMoveToInstruction}
          onMoveToSubInstructionsList={onMoveToInstructionsList}
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
    const addButtonDefaultLabel = areConditions ? (
      <Trans>Add condition</Trans>
    ) : (
      <Trans>Add action</Trans>
    );
    const instructionsList = connectDropTarget(
      <div
        className={`${
          areConditions ? conditionsContainer : actionsContainer
        } ${extraClassName || ''}`}
        style={style}
      >
        {instructions}
        {isOver && <DropIndicator canDrop={canDrop} />}
        <button
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
        </button>
      </div>
    );

    return instructionsList || null;
  }
}

// Drag'n'drop support:

const instructionsListTarget = {
  canDrop(props: Props, monitor: DropTargetMonitor) {
    return (
      monitor.getItem() && monitor.getItem().isCondition === props.areConditions
    );
  },
  drop(props: Props, monitor: DropTargetMonitor) {
    if (monitor.didDrop()) {
      return; // Drop already handled by an instruction
    }
    props.onMoveToInstructionsList({
      isCondition: props.areConditions,
      instrsList: props.instrsList,
    });
  },
};

function targetCollect(
  connect: DropTargetConnector,
  monitor: DropTargetMonitor
): DropTargetProps {
  return {
    connectDropTarget: connect.dropTarget(),
    isOver: monitor.isOver({ shallow: true }),
    canDrop: monitor.canDrop(),
  };
}

// $FlowFixMe - Typing of DragSource/DropTarget is a pain to get correctly
export default DropTarget(
  reactDndInstructionType,
  instructionsListTarget,
  targetCollect
)(InstructionsList);
