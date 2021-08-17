// @flow
import { Trans } from '@lingui/macro';

import * as React from 'react';
import { mapFor } from '../../Utils/MapFor';
import classNames from 'classnames';
import {
  selectedArea,
  selectableArea,
  subInstructionsContainer,
  instructionParameter,
  disabledText,
  icon,
} from './ClassNames';
import {
  type InstructionsListContext,
  type InstructionContext,
} from '../SelectionHandler';
import InstructionsList from './InstructionsList';
import DropIndicator from './DropIndicator';
import ParameterRenderingService from '../ParameterRenderingService';
import InvalidParameterValue from './InvalidParameterValue';
import MissingParameterValue from './MissingParameterValue';
import { makeDragSourceAndDropTarget } from '../../UI/DragAndDrop/DragSourceAndDropTarget';
import {
  type ScreenType,
  useScreenType,
} from '../../UI/Reponsive/ScreenTypeMeasurer';
import { type WidthType } from '../../UI/Reponsive/ResponsiveWindowMeasurer';
import PreferencesContext from '../../MainFrame/Preferences/PreferencesContext';
import { useLongTouch } from '../../Utils/UseLongTouch';
import {
  shouldActivate,
  shouldValidate,
} from '../../UI/KeyboardShortcuts/InteractionKeys';
const gd: libGDevelop = global.gd;

const styles = {
  container: {
    whiteSpace: 'normal',
    wordWrap: 'break-word',
    cursor: 'pointer',
    marginBottom: 1,
  },
};

export const reactDndInstructionType = 'GD_DRAGGED_INSTRUCTION';

const capitalize = (str: string) => {
  if (!str) return '';

  return str[0].toUpperCase() + str.substr(1);
};

const DragSourceAndDropTarget = makeDragSourceAndDropTarget<{
  isCondition: boolean,
}>(reactDndInstructionType);

type Props = {|
  instruction: gdInstruction,
  isCondition: boolean,
  onClick: Function,
  selected: boolean,
  disabled: boolean,
  onDoubleClick: () => void,
  onContextMenu: (x: number, y: number) => void,
  onMoveToInstruction: () => void,

  // For potential sub-instructions list:
  selection: Object,
  onAddNewSubInstruction: InstructionsListContext => void,
  onPasteSubInstructions: InstructionsListContext => void,
  onMoveToSubInstruction: (destinationContext: InstructionContext) => void,
  onMoveToSubInstructionsList: (
    destinationContext: InstructionsListContext
  ) => void,
  onSubInstructionClick: InstructionContext => void,
  onSubInstructionDoubleClick: InstructionContext => void,
  onAddSubInstructionContextMenu: (
    button: HTMLButtonElement,
    instructionsListContext: InstructionsListContext
  ) => void,
  onSubParameterClick: Function,
  onSubInstructionContextMenu: (
    x: number,
    y: number,
    instructionContext: InstructionContext
  ) => void,
  onParameterClick: (event: any, parameterIndex: number) => void,
  renderObjectThumbnail: string => React.Node,

  screenType: ScreenType,
  windowWidth: WidthType,
|};

const Instruction = (props: Props) => {
  const {
    instruction,
    isCondition,
    onClick,
    onMoveToInstruction,
    onContextMenu,
  } = props;

  const instrFormatter = React.useMemo(
    () => gd.InstructionSentenceFormatter.get(),
    []
  );
  const preferences = React.useContext(PreferencesContext);
  const useAssignmentOperators =
    preferences.values.eventsSheetUseAssignmentOperators;

  /**
   * Render the different parts of the text of the instruction.
   * Parameter can have formatting, be hovered and clicked. The rest
   * has not particular styling.
   */
  const renderInstructionText = (metadata: gdInstructionMetadata) => {
    const { instruction, disabled, renderObjectThumbnail } = props;
    const formattedTexts = instrFormatter.getAsFormattedText(
      instruction,
      metadata
    );
    const parametersCount = metadata.getParametersCount();

    return (
      <span
        className={classNames({
          [disabledText]: disabled,
        })}
      >
        {mapFor(0, formattedTexts.size(), i => {
          const formatting = formattedTexts.getTextFormatting(i);
          const parameterIndex = formatting.getUserData();
          const isParameter =
            parameterIndex >= 0 && parameterIndex < parametersCount;

          if (!isParameter) {
            return (
              <span key={i}>
                {i === 0
                  ? capitalize(formattedTexts.getString(i))
                  : formattedTexts.getString(i)}
              </span>
            );
          }

          const parameterMetadata = metadata.getParameter(parameterIndex);
          const parameterType = parameterMetadata.getType();
          return (
            <span
              key={i}
              className={classNames({
                [selectableArea]: true,
                [instructionParameter]: true,
                [parameterType]: true,
              })}
              onClick={domEvent => {
                props.onParameterClick(domEvent, parameterIndex);

                // On touchscreen, don't propagate the click to the instruction div,
                // as it's listening for taps to simulate double "clicks".
                if (props.screenType === 'touch') {
                  domEvent.stopPropagation();
                }
              }}
              onKeyPress={event => {
                if (shouldActivate(event)) {
                  props.onParameterClick(event, parameterIndex);
                  event.stopPropagation();
                  event.preventDefault();
                }
              }}
              tabIndex={0}
            >
              {ParameterRenderingService.renderInlineParameter({
                value: formattedTexts.getString(i),
                parameterMetadata,
                renderObjectThumbnail,
                InvalidParameterValue,
                MissingParameterValue,
                useAssignmentOperators,
              })}
            </span>
          );
        })}
      </span>
    );
  };

  // Disable drag on touchscreens, because it would interfere with the
  // scroll, and would create too much mistake/frustration.
  const screenType = useScreenType();
  const dragAllowed = screenType !== 'touch';

  // Allow a long press to show the context menu
  const longTouchForContextMenuProps = useLongTouch(
    React.useCallback(
      event => {
        onContextMenu(event.clientX, event.clientY);
      },
      [onContextMenu]
    )
  );

  return (
    <DragSourceAndDropTarget
      beginDrag={() => {
        onClick(); // Select the dragged instruction

        // No need to save here what is being dragged,
        // as its the entire selection that is considered to be dragged.
        return {
          isCondition,
        };
      }}
      canDrag={() => dragAllowed}
      canDrop={draggedItem => draggedItem.isCondition === isCondition}
      drop={() => {
        onMoveToInstruction();
      }}
    >
      {({ connectDragSource, connectDropTarget, isOver, canDrop }) => {
        // /!\ It's important to get the metadata now so that we're sure they
        // are valid.
        // If the metadata is retrieved outside of the closure, it's possible
        // that the metadata is changed in the meantime (especially on behavior
        // properties it seems).
        const metadata = isCondition
          ? gd.MetadataProvider.getConditionMetadata(
              gd.JsPlatform.get(),
              instruction.getType()
            )
          : gd.MetadataProvider.getActionMetadata(
              gd.JsPlatform.get(),
              instruction.getType()
            );

        // The instruction itself can be dragged and is a target for
        // another instruction to be dropped. It's IMPORTANT NOT to have
        // the subinstructions list inside the connectDropTarget/connectDragSource
        // as otherwise this can confuse react-dnd ("Expected to find a valid target")
        // (surely due to components re-mounting/rerendering ?).
        const instructionDragSourceElement = connectDragSource(
          <div
            style={styles.container}
            className={classNames({
              [selectableArea]: true,
              [selectedArea]: props.selected,
            })}
            onClick={e => {
              e.stopPropagation();

              if (props.screenType === 'touch' && props.selected) {
                // On touch screens, tapping again a selected instruction should edit it.
                props.onDoubleClick();
              } else {
                props.onClick();
              }
            }}
            onDoubleClick={e => {
              e.stopPropagation();
              props.onDoubleClick();
            }}
            onContextMenu={e => {
              e.stopPropagation();
              onContextMenu(e.clientX, e.clientY);
            }}
            {...longTouchForContextMenuProps}
            onKeyPress={event => {
              if (shouldValidate(event)) {
                props.onDoubleClick();
                event.stopPropagation();
                event.preventDefault();
              } else if (shouldActivate(event)) {
                props.onClick();
                event.stopPropagation();
                event.preventDefault();
              }
            }}
            tabIndex={0}
          >
            {instruction.isInverted() && (
              <img
                className={classNames({
                  [icon]: true,
                })}
                src="res/contraire.png"
                alt="Condition is negated"
              />
            )}
            <img
              className={classNames({
                [icon]: true,
              })}
              src={metadata.getSmallIconFilename()}
              alt=""
            />
            {renderInstructionText(metadata)}
          </div>
        );

        const instructionDragSourceDropTargetElement = instructionDragSourceElement
          ? connectDropTarget(instructionDragSourceElement)
          : null;

        return (
          <React.Fragment>
            {isOver && <DropIndicator canDrop={canDrop} />}
            {instructionDragSourceDropTargetElement}
            {metadata.canHaveSubInstructions() && (
              <InstructionsList
                style={
                  {} /* TODO: Use a new object to force update - somehow updates are not always propagated otherwise */
                }
                className={subInstructionsContainer}
                instrsList={instruction.getSubInstructions()}
                areConditions={props.isCondition}
                selection={props.selection}
                onAddNewInstruction={props.onAddNewSubInstruction}
                onPasteInstructions={props.onPasteSubInstructions}
                onMoveToInstruction={props.onMoveToSubInstruction}
                onMoveToInstructionsList={props.onMoveToSubInstructionsList}
                onInstructionClick={props.onSubInstructionClick}
                onInstructionDoubleClick={props.onSubInstructionDoubleClick}
                onInstructionContextMenu={props.onSubInstructionContextMenu}
                onAddInstructionContextMenu={
                  props.onAddSubInstructionContextMenu
                }
                onParameterClick={props.onSubParameterClick}
                addButtonLabel={<Trans>Add a sub-condition</Trans>}
                disabled={props.disabled}
                renderObjectThumbnail={props.renderObjectThumbnail}
                screenType={props.screenType}
                windowWidth={props.windowWidth}
              />
            )}
          </React.Fragment>
        );
      }}
    </DragSourceAndDropTarget>
  );
};

export default Instruction;
