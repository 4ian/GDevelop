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
import { makeDragSourceAndDropTarget } from '../../UI/DragAndDrop/DragSourceAndDropTarget';
import { type ScreenType } from '../../UI/Reponsive/ScreenTypeMeasurer';
import { type WidthType } from '../../UI/Reponsive/ResponsiveWindowMeasurer';
const gd = global.gd;
const instrFormatter = gd.InstructionSentenceFormatter.get();
instrFormatter.loadTypesFormattingFromConfig();

const styles = {
  container: {
    whiteSpace: 'normal',
    wordWrap: 'break-word',
    cursor: 'pointer',
    marginBottom: 1,
  },
};

export const reactDndInstructionType = 'GD_DRAGGED_INSTRUCTION';

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
  onSubInstructionsListContextMenu: (
    x: number,
    y: number,
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

export default class Instruction extends React.Component<Props> {
  /**
   * Render the different parts of the text of the instruction.
   * Parameter can have formatting, be hovered and clicked. The rest
   * has not particular styling.
   */
  _renderInstructionText = (metadata: gdInstructionMetadata) => {
    const { instruction, disabled, renderObjectThumbnail } = this.props;
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

          if (!isParameter)
            return <span key={i}>{formattedTexts.getString(i)}</span>;

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
                this.props.onParameterClick(domEvent, parameterIndex);

                // On touchscreen, don't propagate the click to the instruction div,
                // as it's listening for taps to simulate double "clicks".
                if (this.props.screenType === 'touch') {
                  domEvent.stopPropagation();
                }
              }}
              onKeyPress={event => {
                if (event.key === 'Enter' || event.key === ' ') {
                  this.props.onParameterClick(event, parameterIndex);
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
              })}
            </span>
          );
        })}
      </span>
    );
  };

  render() {
    const {
      instruction,
      isCondition,
      onClick,
      onMoveToInstruction,
    } = this.props;

    //TODO: Metadata could be cached for performance boost.
    const metadata = isCondition
      ? gd.MetadataProvider.getConditionMetadata(
          gd.JsPlatform.get(),
          instruction.getType()
        )
      : gd.MetadataProvider.getActionMetadata(
          gd.JsPlatform.get(),
          instruction.getType()
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
        canDrop={draggedItem => draggedItem.isCondition === isCondition}
        drop={() => {
          onMoveToInstruction();
        }}
      >
        {({ connectDragSource, connectDropTarget, isOver, canDrop }) => {
          // The instruction itself can be dragged and is a target for
          // another instruction to be dropped. It's IMPORTANT NOT to have
          // the subinstructions list inside the connectDropTarget/connectDragSource
          // as otherwise this can confuse react-dnd ("Expected to find a valid target")
          // (surely due to components re-mounting/rerendering ?).
          const instructionElement = connectDropTarget(
            connectDragSource(
              <div
                style={styles.container}
                className={classNames({
                  [selectableArea]: true,
                  [selectedArea]: this.props.selected,
                })}
                onClick={e => {
                  e.stopPropagation();

                  if (this.props.screenType === 'touch' && this.props.selected) {
                    // On touch screens, tapping again a selected instruction should edit it.
                    this.props.onDoubleClick();
                  } else {
                    this.props.onClick();
                  }
                }}
                onDoubleClick={e => {
                  e.stopPropagation();
                  this.props.onDoubleClick();
                }}
                onContextMenu={e => {
                  e.stopPropagation();
                  this.props.onContextMenu(e.clientX, e.clientY);
                }}
                onKeyPress={event => {
                  if (event.key === 'Enter') {
                    this.props.onDoubleClick();
                    event.stopPropagation();
                    event.preventDefault();
                  } else if (event.key === ' ') {
                    this.props.onClick();
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
                {this._renderInstructionText(metadata)}
              </div>
            )
          );

          return (
            <React.Fragment>
              {isOver && <DropIndicator canDrop={canDrop} />}
              {instructionElement}
              {metadata.canHaveSubInstructions() && (
                <InstructionsList
                  style={
                    {} /* TODO: Use a new object to force update - somehow updates are not always propagated otherwise */
                  }
                  className={subInstructionsContainer}
                  instrsList={instruction.getSubInstructions()}
                  areConditions={this.props.isCondition}
                  selection={this.props.selection}
                  onAddNewInstruction={this.props.onAddNewSubInstruction}
                  onPasteInstructions={this.props.onPasteSubInstructions}
                  onMoveToInstruction={this.props.onMoveToSubInstruction}
                  onMoveToInstructionsList={
                    this.props.onMoveToSubInstructionsList
                  }
                  onInstructionClick={this.props.onSubInstructionClick}
                  onInstructionDoubleClick={
                    this.props.onSubInstructionDoubleClick
                  }
                  onInstructionContextMenu={
                    this.props.onSubInstructionContextMenu
                  }
                  onInstructionsListContextMenu={
                    this.props.onSubInstructionsListContextMenu
                  }
                  onParameterClick={this.props.onSubParameterClick}
                  addButtonLabel={<Trans>Add a sub-condition</Trans>}
                  disabled={this.props.disabled}
                  renderObjectThumbnail={this.props.renderObjectThumbnail}
                  screenType={this.props.screenType}
                  windowWidth={this.props.windowWidth}
                />
              )}
            </React.Fragment>
          );
        }}
      </DragSourceAndDropTarget>
    );
  }
}
