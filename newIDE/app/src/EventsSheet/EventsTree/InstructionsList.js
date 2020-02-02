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
import DropIndicator from './DropIndicator';
import { Trans } from '@lingui/macro';
import { hasClipboardConditions, hasClipboardActions } from '../ClipboardKind';
import { makeDropTarget } from '../../UI/DragAndDrop/DropTarget';
import { type ScreenType } from '../../UI/Reponsive/ScreenTypeMeasurer';
import { type WidthType } from '../../UI/Reponsive/ResponsiveWindowMeasurer';

const styles = {
  addButton: {
    cursor: 'pointer',
  },
};

type Props = {
  instrsList: gdInstructionsList,
  areConditions: boolean,
  onAddNewInstruction: InstructionsListContext => void,
  onPasteInstructions: InstructionsListContext => void,
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
  className?: string,
  style?: Object,
  disabled: boolean,
  renderObjectThumbnail: string => React.Node,

  screenType: ScreenType,
  windowWidth: WidthType,
};

type State = {|
  canPaste: boolean,
|};

const DropTarget = makeDropTarget<{
  isCondition: boolean,
}>(reactDndInstructionType);

export default class InstructionsList extends React.Component<Props, State> {
  state = { canPaste: false };

  onAddNewInstruction = () => {
    if (this.props.onAddNewInstruction)
      this.props.onAddNewInstruction({
        instrsList: this.props.instrsList,
        isCondition: this.props.areConditions,
      });
  };

  onQuickAddNewInstruction = (e: any) => {
    if (e.button !== 2) return;
    e.stopPropagation();
    e.preventDefault();

    if (this.props.onAddNewInstruction)
      this.props.onAddNewInstruction({
        instrsList: this.props.instrsList,
        isCondition: this.props.areConditions,
        quick: e.currentTarget,
      });
  };

  _onPasteInstructions = () => {
    this.props.onPasteInstructions({
      instrsList: this.props.instrsList,
      isCondition: this.props.areConditions,
    });
  };

  render() {
    const { canPaste } = this.state;
    const {
      addButtonLabel,
      areConditions,
      className,
      instrsList,
      onAddNewInstruction,
      onPasteInstructions,
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
          onPasteSubInstructions={onPasteInstructions}
          onMoveToSubInstruction={onMoveToInstruction}
          onMoveToSubInstructionsList={onMoveToInstructionsList}
          onSubInstructionClick={onInstructionClick}
          onSubInstructionDoubleClick={onInstructionDoubleClick}
          onSubInstructionContextMenu={onInstructionContextMenu}
          onSubInstructionsListContextMenu={onInstructionsListContextMenu}
          onSubParameterClick={onParameterClick}
          disabled={disabled}
          renderObjectThumbnail={this.props.renderObjectThumbnail}
          screenType={this.props.screenType}
          windowWidth={this.props.windowWidth}
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

    return (
      <DropTarget
        canDrop={draggedItem => draggedItem.isCondition === areConditions}
        drop={() => {
          onMoveToInstructionsList({
            isCondition: areConditions,
            instrsList: instrsList,
          });
        }}
      >
        {({ connectDropTarget, isOver, canDrop }) =>
          connectDropTarget(
            <div className={className} style={style}>
              {instructions}
              {isOver && <DropIndicator canDrop={canDrop} />}
              <span
                onPointerEnter={() => {
                  const canPaste =
                    (areConditions && hasClipboardConditions()) ||
                    (!areConditions && hasClipboardActions());
                  this.setState({ canPaste });
                }}
                onPointerLeave={() => this.setState({ canPaste: false })}
              >
                <button
                  style={styles.addButton}
                  className="add-link"
                  onClick={this.onAddNewInstruction}
                  onMouseDownCapture={this.onQuickAddNewInstruction}
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
                {canPaste && (
                  <span>
                    {' '}
                    <button
                      style={styles.addButton}
                      className="add-link"
                      onClick={this._onPasteInstructions}
                    >
                      {areConditions ? (
                        <Trans>(or paste conditions)</Trans>
                      ) : (
                        <Trans>(or paste actions)</Trans>
                      )}
                    </button>
                  </span>
                )}
              </span>
            </div>
          )
        }
      </DropTarget>
    );
  }
}
