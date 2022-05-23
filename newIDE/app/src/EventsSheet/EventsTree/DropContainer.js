// @flow
import * as React from 'react';
import { getIndentWidth, type SortableTreeNode } from '.';
import {
  moveNodeAbove,
  moveNodeBelow,
  moveNodeAsSubevent,
  isSameDepthAndBelow,
} from './helpers';
import { type WidthType } from '../../UI/Reponsive/ResponsiveWindowMeasurer';
import './style.css';
import GDevelopThemeContext from '../../UI/Theme/ThemeContext';

const styles = {
  dropArea: { zIndex: 1, position: 'absolute' },
  dropIndicator: {
    position: 'absolute',
    zIndex: 2,
    border: '4px solid black',
    outline: '1px solid white',
  },
};

const getTargetPositionStyles = (
  indentWidth: number,
  draggedNodeHeight: number,
  isDraggedNodeChild: boolean
) => ({
  'bottom-left': { left: '0px', bottom: '0px', top: '50%', width: indentWidth },
  'bottom-right': {
    left: `${indentWidth}px`,
    right: '0px',
    bottom: '0px',
    top: '50%',
  },
  top: { left: '0px', right: '0px', top: '0px', bottom: '50%' },
  bottom: { left: '0px', right: '0px', top: '50%', bottom: '0px' },
  'bottom-bottom-left': {
    left: isDraggedNodeChild ? '0px' : '10px',
    top: '100%',
    height: draggedNodeHeight,
    width: indentWidth,
  },
  'bottom-bottom-right': {
    left: isDraggedNodeChild ? `${indentWidth + 10}px` : `${indentWidth}px`,
    right: '0px',
    top: '100%',
    height: draggedNodeHeight,
  },
});

const getIndicatorPositionStyles = (indentWidth: number) => ({
  bottom: { left: '0px', right: '0px', bottom: '-4px' },
  'bottom-right': { left: `${indentWidth}px`, right: '0px', bottom: '-4px' },
  top: { left: '0px', right: '0px', top: '-4px' },
});

type DropTargetContainerStyle = {|
  left?: string,
  right?: string,
  top?: string,
  bottom?: string,
  width?: number,
  height?: number,
|};

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
                ...styles.dropArea,
                ...style.dropArea,
                backgroundColor: isOver ? 'black' : 'transparent',
              }}
            />
            {/* Drop indicator */}
            {canDrop && isOver && (
              <div
                style={{
                  ...styles.dropIndicator,
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

export function DropContainer({
  node,
  draggedNode,
  DnDComponent,
  onDrop,
  activateTargets,
  windowWidth,
  draggedNodeHeight,
}: {|
  node: SortableTreeNode,
  draggedNode: ?SortableTreeNode,
  DnDComponent: any,
  onDrop: (
    moveFunction: ({
      targetNode: SortableTreeNode,
      node: SortableTreeNode,
    }) => void,
    node: SortableTreeNode
  ) => void,
  activateTargets: boolean,
  windowWidth: WidthType,
  draggedNodeHeight: number,
|}) {
  const isDraggedNodeNodesOnlyChild =
    node.children.length === 1 &&
    !!draggedNode &&
    node.children[0].key === draggedNode.key;
  const isDraggedNodeSameDepthAndBelow =
    !!draggedNode && isSameDepthAndBelow(node, draggedNode);
  // We want to allow dropping below if the event has no children OR if the only
  // child of the event is the dragged one.
  const canDropBelow =
    node.event && (node.children.length === 0 || isDraggedNodeNodesOnlyChild);
  const canHaveSubevents = node.event && node.event.canHaveSubEvents();
  const indentWidth = getIndentWidth(windowWidth);

  const commonProps = {
    DnDComponent: DnDComponent,
    canDrop: () => true,
  };
  const dropAreaStyles = getTargetPositionStyles(
    indentWidth,
    draggedNodeHeight,
    isDraggedNodeNodesOnlyChild
  );
  const indicatorStyles = getIndicatorPositionStyles(indentWidth);
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
      {canHaveSubevents && canDropBelow && (
        <>
          <DropTargetContainer
            style={{
              dropIndicator: indicatorStyles['bottom-right'],
              dropArea: dropAreaStyles['bottom-right'],
            }}
            onDrop={() => onDrop(moveNodeAsSubevent, node)}
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
          {/* Allow dragging left/right to move below or as subevent */}
          {(isDraggedNodeNodesOnlyChild || isDraggedNodeSameDepthAndBelow) && (
            <>
              <DropTargetContainer
                style={{
                  dropIndicator: indicatorStyles['bottom'],
                  dropArea: dropAreaStyles['bottom-bottom-left'],
                }}
                onDrop={() => onDrop(moveNodeBelow, node)}
                {...commonProps}
              />
              <DropTargetContainer
                style={{
                  dropIndicator: indicatorStyles['bottom-right'],
                  dropArea: dropAreaStyles['bottom-bottom-right'],
                }}
                onDrop={() => onDrop(moveNodeAsSubevent, node)}
                {...commonProps}
              />
            </>
          )}
        </>
      )}
      {!canHaveSubevents && canDropBelow && (
        <DropTargetContainer
          style={{
            dropIndicator: indicatorStyles['bottom'],
            dropArea: dropAreaStyles['bottom'],
          }}
          onDrop={() => onDrop(moveNodeBelow, node)}
          {...commonProps}
        />
      )}
      {canHaveSubevents && !canDropBelow && (
        <DropTargetContainer
          style={{
            dropIndicator: indicatorStyles['bottom-right'],
            dropArea: dropAreaStyles['bottom'],
          }}
          onDrop={() => onDrop(moveNodeAsSubevent, node)}
          {...commonProps}
        />
      )}
    </div>
  );
}

export function Autoscroll({
  direction,
  DnDComponent,
  activateTargets,
  onHover,
}: {|
  direction: 'top' | 'bottom',
  DnDComponent: any,
  activateTargets: boolean,
  onHover: () => void,
|}) {
  const delayActivationTimer = React.useRef<?TimeoutID>(null);
  const [show, setShow] = React.useState(false);

  // This drop target overlaps with sibling drag source and cancels drag immediatly.
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
              width: '100%',
              position: 'absolute',
              ...(direction === 'top' ? { top: 0 } : { bottom: 0 }),
              height: '10%',
              opacity: isOverLazy ? 1 : 0,
              backgroundColor: isOverLazy ? 'blue' : 'black',
              zIndex: 2,
            }}
          />
        );
        return show ? connectDropTarget(dropTarget) : null;
      }}
    </DnDComponent>
  );
}
