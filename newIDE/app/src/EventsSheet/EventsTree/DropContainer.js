// @flow
import * as React from 'react';
import { getIndentWidth, type SortableTreeNode } from '.';
import { moveNodeAbove, moveNodeBelow, moveNodeAsSubevent } from './helpers';
import { type WidthType } from '../../UI/Reponsive/ResponsiveWindowMeasurer';
import './style.css';
import GDevelopThemeContext from '../../UI/Theme/ThemeContext';

type ContainerPosition = 'top' | 'bottom-left' | 'bottom-right' | 'bottom';
type IndicatorPosition = 'top' | 'bottom-right' | 'bottom';

const styles = {
  dropArea: { zIndex: 1, position: 'absolute' },
  dropIndicator: {
    position: 'absolute',
    zIndex: 2,
    border: '4px solid black',
    outline: '1px solid white',
  },
};

const getTargetPositionStyle = (position: ContainerPosition) => {
  switch (position) {
    case 'bottom-left':
      return { left: '0px', bottom: '0px', top: '50%', right: '95%' };
    case 'bottom-right':
      return { left: '5%', right: '0px', bottom: '0px', top: '50%' };
    case 'top':
      return { left: '0px', right: '0px', top: '0px', bottom: '50%' };
    case 'bottom':
      return { left: '0px', right: '0px', top: '50%', bottom: '0px' };
    default:
      return {};
  }
};

const getIndicatorPositionStyle = (
  position: IndicatorPosition,
  indentWidth: number
) => {
  switch (position) {
    case 'bottom':
      return { left: '0px', right: '0px', bottom: '-4px' };
    case 'bottom-right':
      return { left: indentWidth, right: '0px', bottom: '-4px' };
    case 'top':
      return { left: '0px', right: '0px', top: '-4px' };
    default:
      return {};
  }
};

function DropTargetContainer({
  containerPosition,
  indicatorPosition,
  DnDComponent,
  canDrop,
  onDrop,
  indentWidth,
}: {|
  containerPosition: ContainerPosition,
  indicatorPosition: IndicatorPosition,
  DnDComponent: any,
  canDrop: () => boolean,
  onDrop: () => void,
  indentWidth: number,
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
                ...getTargetPositionStyle(containerPosition),
              }}
            />
            {/* Drop indicator */}
            {canDrop && isOver && (
              <div
                style={{
                  ...styles.dropIndicator,
                  ...getIndicatorPositionStyle(indicatorPosition, indentWidth),
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

export default function DropContainer({
  node,
  draggedNode,
  DnDComponent,
  onDrop,
  activateTargets,
  windowWidth,
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
|}) {
  // We want to allow dropping below if the event has no children OR if the only
  // child of the event is the dragged one.
  const canDropBelow =
    node.event &&
    (node.children.length === 0 ||
      (node.children.length === 1 &&
        draggedNode &&
        node.children[0].key === draggedNode.key));
  const canHaveSubevents = node.event && node.event.canHaveSubEvents();
  const commonProps = {
    DnDComponent: DnDComponent,
    canDrop: () => true,
    indentWidth: getIndentWidth(windowWidth),
  };
  return (
    <div
      style={{
        visibility: activateTargets ? 'visible' : 'hidden',
      }}
    >
      <DropTargetContainer
        containerPosition="top"
        indicatorPosition="top"
        onDrop={() => onDrop(moveNodeAbove, node)}
        {...commonProps}
      />
      {canHaveSubevents && canDropBelow && (
        <>
          <DropTargetContainer
            containerPosition="bottom-right"
            indicatorPosition="bottom-right"
            onDrop={() => onDrop(moveNodeAsSubevent, node)}
            {...commonProps}
          />
          <DropTargetContainer
            containerPosition="bottom-left"
            indicatorPosition="bottom"
            onDrop={() => onDrop(moveNodeBelow, node)}
            {...commonProps}
          />
        </>
      )}
      {!canHaveSubevents && canDropBelow && (
        <DropTargetContainer
          containerPosition="bottom"
          indicatorPosition="bottom"
          onDrop={() => onDrop(moveNodeBelow, node)}
          {...commonProps}
        />
      )}
      {canHaveSubevents && !canDropBelow && (
        <DropTargetContainer
          containerPosition="bottom"
          indicatorPosition="bottom-right"
          onDrop={() => onDrop(moveNodeAsSubevent, node)}
          {...commonProps}
        />
      )}
    </div>
  );
}
