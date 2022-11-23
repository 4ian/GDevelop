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
import { useLongTouch } from '../../Utils/UseLongTouch';

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
  onAddInstructionContextMenu: (
    HTMLButtonElement,
    InstructionsListContext
  ) => void,
  onParameterClick: ParameterContext => void,
  selection: any,
  addButtonLabel?: React.Node,
  addButtonId?: string,
  className?: string,
  style?: Object,
  disabled: boolean,
  renderObjectThumbnail: string => React.Node,

  screenType: ScreenType,
  windowWidth: WidthType,

  globalObjectsContainer: gdObjectsContainer,
  objectsContainer: gdObjectsContainer,
};

const DropTarget = makeDropTarget<{
  isCondition: boolean,
}>(reactDndInstructionType);

export default function InstructionsList({
  addButtonId,
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
  onAddInstructionContextMenu,
  onParameterClick,
  selection,
  style,
  disabled,
  renderObjectThumbnail,
  screenType,
  windowWidth,
  globalObjectsContainer,
  objectsContainer,
}: Props) {
  const [canPaste, setCanPaste] = React.useState(false);

  const addNewInstruction = React.useCallback(
    () => {
      if (onAddNewInstruction)
        onAddNewInstruction({
          instrsList,
          isCondition: areConditions,
        });
    },
    [onAddNewInstruction, instrsList, areConditions]
  );

  const pasteInstructions = React.useCallback(
    () => {
      onPasteInstructions({
        instrsList,
        isCondition: areConditions,
      });
    },
    [onPasteInstructions, instrsList, areConditions]
  );

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
        onAddSubInstructionContextMenu={onAddInstructionContextMenu}
        onSubParameterClick={onParameterClick}
        disabled={disabled}
        renderObjectThumbnail={renderObjectThumbnail}
        screenType={screenType}
        windowWidth={windowWidth}
        globalObjectsContainer={globalObjectsContainer}
        objectsContainer={objectsContainer}
      />
    );
  });

  // Note: might be worth fixing this warning:
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const instructionsListContext = {
    instrsList,
    isCondition: areConditions,
  };

  const addButton = React.useRef<?HTMLButtonElement>(null);
  const addButtonDefaultLabel = areConditions ? (
    <Trans>Add condition</Trans>
  ) : (
    <Trans>Add action</Trans>
  );

  const longTouchForContextMenuProps = useLongTouch(
    React.useCallback(
      event => {
        addButton.current &&
          onAddInstructionContextMenu(
            addButton.current,
            instructionsListContext
          );
      },
      [onAddInstructionContextMenu, instructionsListContext, addButton]
    )
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
                setCanPaste(
                  (areConditions && hasClipboardConditions()) ||
                    (!areConditions && hasClipboardActions())
                );
              }}
              onPointerLeave={() => {
                setCanPaste(false);
              }}
            >
              <button
                style={styles.addButton}
                className="add-link"
                onClick={addNewInstruction}
                onContextMenu={e => {
                  e.stopPropagation();
                  onAddInstructionContextMenu(
                    e.currentTarget,
                    instructionsListContext
                  );
                }}
                {...longTouchForContextMenuProps}
                ref={addButton}
                id={addButtonId || `${
                  areConditions ? 'add-condition-button' : 'add-action-button'
                }${instructions.length === 0 ? '-empty' : ''}`}
              >
                {addButtonLabel || addButtonDefaultLabel}
              </button>
              {canPaste && (
                <span>
                  <button
                    style={styles.addButton}
                    className="add-link"
                    onClick={pasteInstructions}
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
