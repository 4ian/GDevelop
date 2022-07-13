// @flow
import * as React from 'react';
import {
  DropTarget,
  type DropTargetMonitor,
  type DropTargetConnector,
  type ConnectDropTarget,
} from 'react-dnd';

type Props<DraggedItemType> = {|
  children: ({
    connectDropTarget: ConnectDropTarget,
    isOver: boolean,
    isOverLazy: boolean,
    canDrop: boolean,
  }) => ?React.Node,
  canDrop: (item: DraggedItemType) => boolean,
  hover?: (monitor: DropTargetMonitor) => void,
  drop: (monitor: DropTargetMonitor) => void,
|};

export type DropTargetComponent<DraggedItemType> = (
  Props<DraggedItemType>
) => React.Node;

type DropTargetProps = {|
  connectDropTarget: ConnectDropTarget,
  isOver: boolean,
  isOverLazy: boolean,
  canDrop: boolean,
|};

export const makeDropTarget = <DraggedItemType>(
  reactDndType: string
): DropTargetComponent<DraggedItemType> => {
  const targetSpec = {
    canDrop(props: Props<DraggedItemType>, monitor: DropTargetMonitor) {
      const item = monitor.getItem();
      return item && props.canDrop(item);
    },
    hover(props: Props<DraggedItemType>, monitor: DropTargetMonitor) {
      if (props.hover) props.hover(monitor);
    },
    drop(props: Props<DraggedItemType>, monitor: DropTargetMonitor) {
      if (monitor.didDrop()) {
        return; // Drop already handled by another target
      }
      props.drop(monitor);
    },
  };

  function targetCollect(
    connect: DropTargetConnector,
    monitor: DropTargetMonitor
  ): DropTargetProps {
    return {
      connectDropTarget: connect.dropTarget(),
      isOver: monitor.isOver({ shallow: true }),
      isOverLazy: monitor.isOver({ shallow: false }),
      canDrop: monitor.canDrop(),
    };
  }

  const InnerDropTarget = DropTarget(reactDndType, targetSpec, targetCollect)(
    ({ children, connectDropTarget, isOver, isOverLazy, canDrop }) => {
      return children({
        connectDropTarget,
        isOver,
        isOverLazy,
        canDrop,
      });
    }
  );

  return (props: Props<DraggedItemType>) => <InnerDropTarget {...props} />;
};
