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
    canDrop: boolean,
  }) => React.Node,
  canDrop: (item: DraggedItemType) => boolean,
  drop: () => void,
|};

type DropTargetProps = {|
  connectDropTarget: ConnectDropTarget,
  isOver: boolean,
  canDrop: boolean,
|};

export const makeDropTarget = <DraggedItemType>(
  reactDndType: string
): ((Props<DraggedItemType>) => React.Node) => {
  const instructionTarget = {
    canDrop(props: Props<DraggedItemType>, monitor: DropTargetMonitor) {
      const item = monitor.getItem();
      return item && props.canDrop(item);
    },
    drop(props: Props<DraggedItemType>, monitor: DropTargetMonitor) {
      if (monitor.didDrop()) {
        return; // Drop already handled by another target
      }
      props.drop();
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

  const InnerDropTarget = DropTarget(
    reactDndType,
    instructionTarget,
    targetCollect
  )(({ children, connectDropTarget, isOver, canDrop }) => {
    return children({
      connectDropTarget,
      isOver,
      canDrop,
    });
  });

  return (props: Props<DraggedItemType>) => <InnerDropTarget {...props} />;
};
