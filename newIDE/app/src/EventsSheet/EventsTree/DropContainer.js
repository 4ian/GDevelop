// @flow
import * as React from 'react';
import { getIndentWidth, type SortableTreeNode } from '.';
import {
  moveNodeAbove,
  moveNodeBelow,
  moveNodeAsSubEvent,
  isJustBelow,
  isSibling,
} from './helpers';
import { type WindowSizeType } from '../../UI/Responsive/ResponsiveWindowMeasurer';
import './style.css';
import GDevelopThemeContext from '../../UI/Theme/GDevelopThemeContext';
import { type DropTargetComponent } from '../../UI/DragAndDrop/DropTarget';
const sharedStyles = {
  dropArea: { zIndex: 1, position: 'absolute' },
  dropIndicator: {
    position: 'absolute',
    zIndex: 2,
    border: '2px solid black',
    outline: '1px solid white',
  },
  autoScroll: {
    width: '100%',
    position: 'absolute',
    height: '10%',
    zIndex: 2,
  },
};

type DropTargetContainerStyle = {|
  left?: string,
  right?: string,
  top?: string,
  bottom?: string,
  width?: number,
  height?: number,
|};

type TargetPositionStyles = { [position: string]: DropTargetContainerStyle };

const getTargetPositionStyles = (
  indentWidth: number,
  draggedNodeHeight: number,
  isDraggedNodeSibling: boolean
): TargetPositionStyles => ({
  'bottom-left': { left: '0px', bottom: '0px', top: '50%', width: indentWidth },
  'bottom-right': {
    left: `${indentWidth}px`,
    right: '0px',
    bottom: '0px',
    top: '50%',
  },
  top: { left: '0px', right: '0px', top: '0px', bottom: '50%' },
  bottom: { left: '0px', right: '0px', top: '50%', bottom: '0px' },
  'below-left': {
    left: isDraggedNodeSibling ? '10px' : '0px',
    top: '100%',
    height: draggedNodeHeight,
    width: indentWidth,
  },
  'below-right': {
    left: isDraggedNodeSibling ? `${indentWidth}px` : `${indentWidth + 10}px`,
    right: '0px',
    top: '100%',
    height: draggedNodeHeight,
  },
});

const getIndicatorPositionStyles = (
  indentWidth: number
): TargetPositionStyles => ({
  bottom: { left: '0px', right: '0px', bottom: '-2px' },
  'bottom-right': { left: `${indentWidth}px`, right: '0px', bottom: '-2px' },
  top: { left: '0px', right: '0px', top: '-2px' },
});

function DropTargetContainer({
  DnDComponent,
  canDrop,
  onDrop,
  style,
}: {|
  DnDComponent: any,
  canDrop: () => boolean,
  onDrop: () => void,
  style: {
    dropIndicator: DropTargetContainerStyle,
    dropArea: DropTargetContainerStyle,
  },
|}) {
  const gdevelopTheme = React.useContext(GDevelopThemeContext);
  return (
    <DnDComponent canDrop={canDrop} drop={onDrop}>
      {({ isOver, connectDropTarget, canDrop }) => {
        return connectDropTarget(
          <div>
            {/* Drop area */}
            <div
              style={{
                ...sharedStyles.dropArea,
                ...style.dropArea,

                // Uncomment for debugging purposes.
                // backgroundColor: 'lightblue',
                // opacity: isOver ? 1 : 0,
              }}
            />
            {/* Drop indicator */}
            {canDrop && isOver && (
              <div
                style={{
                  ...sharedStyles.dropIndicator,
                  ...style.dropIndicator,
                  borderColor: gdevelopTheme.dropIndicator.canDrop,
                  outlineColor: gdevelopTheme.dropIndicator.border,
                }}
              />
            )}
          </div>
        );
      }}
    </DnDComponent>
  );
}

type DropContainerProps = {|
  node: SortableTreeNode,
  draggedNode: SortableTreeNode,
  DnDComponent: DropTargetComponent<SortableTreeNode>,
  onDrop: (
    moveFunction: ({
      targetNode: SortableTreeNode,
      node: SortableTreeNode,
    }) => void,
    node: SortableTreeNode
  ) => void,
  activateTargets: boolean,

  // Computes drop areas and drop indicator indent.
  windowSize: WindowSizeType,
  // Used only for the node just above dragged node if it is an only child,
  // so that drop area covers the whole dragged node's row in height.
  draggedNodeHeight: number,
  getNodeAtPath: (path: Array<number>) => SortableTreeNode,
|};

type HorizontalDraggedNodeDropContainerProps = {|
  node: SortableTreeNode,
  draggedNode: SortableTreeNode,
  DnDComponent: DropTargetComponent<SortableTreeNode>,
  onDrop: (
    moveFunction: ({
      targetNode: SortableTreeNode,
      node: SortableTreeNode,
    }) => void,
    node: SortableTreeNode
  ) => void,
  activateTargets: boolean,

  getNodeAtPath: (path: Array<number>) => SortableTreeNode,
  draggedNodeHeight: number,
  indentWidth: number,
|};

function HorizontalDraggedNodeDropContainer({
  DnDComponent,
  onDrop,
  activateTargets,
  getNodeAtPath,
  node,
  draggedNode,
  indentWidth,
  draggedNodeHeight,
}: HorizontalDraggedNodeDropContainerProps) {
  const { depth } = node;
  return (
    <>
      {new Array(depth).fill(0).map((_, depthStep) => {
        // Skip so that it does not hinder dragging and so that we don't have to
        // worry about delaying the drop target activation.
        if (depthStep === draggedNode.depth) return null;
        return (
          <DropTargetContainer
            key={depthStep}
            DnDComponent={DnDComponent}
            onDrop={() =>
              onDrop(
                moveNodeBelow,
                getNodeAtPath(node.nodePath.slice(0, depthStep + 1))
              )
            }
            canDrop={() => true}
            style={{
              dropArea: {
                top: '100%',
                bottom: `-${draggedNodeHeight}px`,
                left: `-${indentWidth * (depth - depthStep)}px`,
                width: indentWidth,
              },
              dropIndicator: {
                left: `-${indentWidth * (depth - depthStep)}px`,
                right: '0px',
                // The bottom is set so that the indicator is centered between the events.
                bottom: '-2px',
              },
            }}
          />
        );
      })}
    </>
  );
}

/**
 * DropContainer is composed of sub-containers of drop targets that allows us to identify
 * where the mouse or touch is and drop the dragged node accordingly. At most, there will be 5
 * drop targets: 1 at the top of the row (drop above), 2 at the bottom (drop below or as subevent
 * while hovering target node), 2 below (drop below or as sub-event moving left/right).
 */
export function DropContainer({
  node,
  draggedNode,
  DnDComponent,
  onDrop,
  activateTargets,
  windowSize,
  draggedNodeHeight,
  getNodeAtPath,
}: DropContainerProps) {
  const isDraggedNodeSibling = isSibling(node, draggedNode);
  const isDraggedNodeJustBelow = isJustBelow(node, draggedNode);
  // We want to allow dropping below if the event has no children OR if the only
  // child of the event is the dragged one.
  const canHaveSubEvents = !!node.event && node.event.canHaveSubEvents();

  const indentWidth = getIndentWidth(windowSize);
  const dropAreaStyles = getTargetPositionStyles(
    indentWidth,
    draggedNodeHeight,
    isDraggedNodeSibling
  );
  const indicatorStyles = getIndicatorPositionStyles(indentWidth);
  const commonProps = {
    DnDComponent: DnDComponent,
    canDrop: () => true,
  };
  return (
    <div
      style={{
        visibility: activateTargets ? 'visible' : 'hidden',
      }}
    >
      <DropTargetContainer
        style={{
          dropIndicator: indicatorStyles['top'],
          dropArea: dropAreaStyles['top'],
        }}
        onDrop={() => onDrop(moveNodeAbove, node)}
        {...commonProps}
      />
      {canHaveSubEvents ? (
        <>
          <DropTargetContainer
            style={{
              dropIndicator: indicatorStyles['bottom-right'],
              dropArea: dropAreaStyles['bottom-right'],
            }}
            onDrop={() => onDrop(moveNodeAsSubEvent, node)}
            {...commonProps}
          />
          <DropTargetContainer
            style={{
              dropIndicator: indicatorStyles['bottom'],
              dropArea: dropAreaStyles['bottom-left'],
            }}
            onDrop={() => onDrop(moveNodeBelow, node)}
            {...commonProps}
          />
          {/* Allow dragging left/right just below the current node. */}
          {isDraggedNodeJustBelow && (
            <>
              <DropTargetContainer
                style={{
                  dropIndicator: indicatorStyles['bottom'],
                  dropArea: dropAreaStyles['below-left'],
                }}
                onDrop={() => onDrop(moveNodeBelow, node)}
                {...commonProps}
              />
              <DropTargetContainer
                style={{
                  dropIndicator: indicatorStyles['bottom-right'],
                  dropArea: dropAreaStyles['below-right'],
                }}
                onDrop={() => onDrop(moveNodeAsSubEvent, node)}
                {...commonProps}
              />
            </>
          )}
        </>
      ) : (
        <DropTargetContainer
          style={{
            dropIndicator: indicatorStyles['bottom'],
            dropArea: dropAreaStyles['bottom'],
          }}
          onDrop={() => onDrop(moveNodeBelow, node)}
          {...commonProps}
        />
      )}
      {/* This DropContainer allows dragging horizontally, on any depth between
      0 and the depth of the node just above the dragged one (which has information on
      its parents). */}
      {isDraggedNodeJustBelow && (
        <HorizontalDraggedNodeDropContainer
          node={node}
          draggedNode={draggedNode}
          DnDComponent={DnDComponent}
          activateTargets={activateTargets}
          onDrop={onDrop}
          indentWidth={indentWidth}
          draggedNodeHeight={draggedNodeHeight}
          getNodeAtPath={getNodeAtPath}
        />
      )}
    </div>
  );
}

export function AutoScroll({
  direction,
  DnDComponent,
  activateTargets,
  onHover,
}: {|
  direction: 'top' | 'bottom',
  DnDComponent: DropTargetComponent<SortableTreeNode>,
  activateTargets: boolean,
  onHover: () => void,
|}) {
  const delayActivationTimer = React.useRef<?TimeoutID>(null);
  const [show, setShow] = React.useState(false);

  // This drop target overlaps with sibling drag source and cancels drag immediately.
  // See: https://github.com/react-dnd/react-dnd/issues/766#issuecomment-388943403
  // Delaying the render of the drop target seems to solve the issue.
  React.useEffect(
    () => {
      if (activateTargets) {
        delayActivationTimer.current = setTimeout(() => {
          setShow(true);
        }, 100);
      } else {
        setShow(false);
        clearTimeout(delayActivationTimer.current);
        delayActivationTimer.current = null;
      }
      return () => {
        delayActivationTimer.current &&
          clearTimeout(delayActivationTimer.current);
      };
    },
    [activateTargets]
  );

  return (
    <DnDComponent
      canDrop={() => true}
      drop={() => {
        return;
      }}
    >
      {({ isOverLazy, connectDropTarget }) => {
        if (isOverLazy) {
          onHover();
        }
        const dropTarget = (
          <div
            style={{
              ...sharedStyles.autoScroll,
              ...(direction === 'top' ? { top: 0 } : { bottom: 0 }),

              // Uncomment for debugging purposes.
              // backgroundColor: 'black',
              // opacity: isOverLazy ? 1 : 0,
            }}
          />
        );
        return show ? connectDropTarget(dropTarget) : null;
      }}
    </DnDComponent>
  );
}
