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
} from './ClassNames';
import {
  type InstructionsListContext,
  type InstructionContext,
} from '../SelectionHandler';
import InstructionsList from './InstructionsList';
import {
  DragSource,
  type DragSourceMonitor,
  type DragSourceConnector,
  type ConnectDragSource,
  DropTarget,
  type DropTargetMonitor,
  type DropTargetConnector,
  type ConnectDropTarget,
} from 'react-dnd';
import DropIndicator from './DropIndicator';
import ParameterRenderingService from '../ParameterRenderingService';
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
  icon: {
    verticalAlign: 'middle',
    paddingLeft: 2,
    paddingRight: 2,
  },
};

type DragSourceProps = {|
  connectDragSource: ConnectDragSource,
|};

type DropTargetProps = {|
  connectDropTarget: ConnectDropTarget,
  isOver: boolean,
  canDrop: boolean,
|};

type Props = {|
  instruction: gdInstruction,
  isCondition: boolean,
  onClick: Function,
  selected: boolean,
  disabled: boolean,
  onDoubleClick: () => void,
  onContextMenu: (x: number, y: number) => void,
  onMoveToInstruction: () => void,

  ...DragSourceProps,
  ...DropTargetProps,

  // For potential sub-instructions list:
  selection: Object,
  onAddNewSubInstruction: Function,
  onMoveToSubInstruction: (destinationContext: InstructionContext) => void,
  onMoveToSubInstructionsList: (
    destinationContext: InstructionsListContext
  ) => void,
  onSubInstructionClick: Function,
  onSubInstructionDoubleClick: Function,
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
|};

class Instruction extends React.Component<Props, *> {
  /**
   * Render the different parts of the text of the instruction.
   * Parameter can have formatting, be hovered and clicked. The rest
   * has not particular styling.
   */
  _renderInstructionText = (metadata: gdInstructionMetadata) => {
    const { instruction, disabled } = this.props;
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

          const parameterType = metadata.getParameter(parameterIndex).getType();
          return (
            <span
              key={i}
              className={classNames({
                [selectableArea]: true,
                [instructionParameter]: true,
                [parameterType]: true,
              })}
              onClick={domEvent =>
                this.props.onParameterClick(domEvent, parameterIndex)
              }
            >
              {ParameterRenderingService.renderParameterString(
                parameterType,
                formattedTexts.getString(i)
              )}
            </span>
          );
        })}
      </span>
    );
  };

  render() {
    const { instruction, isCondition } = this.props;
    const {
      connectDragSource,
      connectDropTarget,
      isOver,
      canDrop,
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

    const instructionDiv = connectDropTarget(
      // $FlowFixMe
      connectDragSource(
        <div
          style={styles.container}
          className={classNames({
            [selectableArea]: true,
            [selectedArea]: this.props.selected,
          })}
          onClick={e => {
            e.stopPropagation();
            this.props.onClick();
          }}
          onDoubleClick={e => {
            e.stopPropagation();
            this.props.onDoubleClick();
          }}
          onContextMenu={e => {
            e.stopPropagation();
            this.props.onContextMenu(e.clientX, e.clientY);
          }}
        >
          {instruction.isInverted() && (
            <img
              src="res/contraire.png"
              alt="Condition is negated"
              style={styles.icon}
              width="20"
              height="16"
            />
          )}
          <img
            src={metadata.getSmallIconFilename()}
            style={styles.icon}
            alt=""
            width="20"
            height="16"
          />
          {this._renderInstructionText(metadata)}
          {metadata.canHaveSubInstructions() && (
            <InstructionsList
              extraClassName={subInstructionsContainer}
              instrsList={instruction.getSubInstructions()}
              areConditions={this.props.isCondition}
              selection={this.props.selection}
              onAddNewInstruction={this.props.onAddNewSubInstruction}
              onMoveToInstruction={this.props.onMoveToSubInstruction}
              onMoveToInstructionsList={this.props.onMoveToSubInstructionsList}
              onInstructionClick={this.props.onSubInstructionClick}
              onInstructionDoubleClick={this.props.onSubInstructionDoubleClick}
              onInstructionContextMenu={this.props.onSubInstructionContextMenu}
              onInstructionsListContextMenu={
                this.props.onSubInstructionsListContextMenu
              }
              onParameterClick={this.props.onSubParameterClick}
              addButtonLabel={<Trans>Add a sub-condition</Trans>}
              disabled={this.props.disabled}
            />
          )}
        </div>
      )
    );

    return isOver ? (
      <React.Fragment>
        <DropIndicator canDrop={canDrop} />
        {instructionDiv}
      </React.Fragment>
    ) : (
      instructionDiv || null
    );
  }
}

// Drag'n'drop support:

export const reactDndInstructionType = 'GD_DRAGGED_INSTRUCTION';

type InstructionSourceProps = {
  onClick: () => void,
  isCondition: boolean,
};

const instructionSource = {
  beginDrag(props: InstructionSourceProps) {
    props.onClick(); // Select the dragged instruction
    return {
      // No need to save here what is being dragged,
      // as its the entire selection that is considered to be dragged.
      isCondition: props.isCondition,
    };
  },
};

function sourceCollect(
  connect: DragSourceConnector,
  monitor: DragSourceMonitor
): DragSourceProps {
  return {
    connectDragSource: connect.dragSource(),
  };
}

const instructionTarget = {
  canDrop(props: Props, monitor: DropTargetMonitor) {
    return (
      monitor.getItem() && monitor.getItem().isCondition === props.isCondition
    );
  },
  drop(props: Props, monitor: DropTargetMonitor) {
    if (monitor.didDrop()) {
      return; // Drop already handled by a subinstruction
    }
    props.onMoveToInstruction();
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
export default DragSource(
  reactDndInstructionType,
  instructionSource,
  sourceCollect
)(
  DropTarget(reactDndInstructionType, instructionTarget, targetCollect)(
    Instruction
  )
);
