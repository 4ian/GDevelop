// @flow
import * as React from 'react';
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

type Props<DraggedItemType> = {|
  children: ({
    connectDragSource: ConnectDragSource,
    connectDropTarget: ConnectDropTarget,
    isOver: boolean,
    canDrop: boolean,
  }) => ?React.Node,
  beginDrag: () => DraggedItemType,
  canDrag?: (item: DraggedItemType) => boolean,
  canDrop: (item: DraggedItemType) => boolean,
  drop: () => void,
|};

type DragSourceProps = {|
  connectDragSource: ConnectDragSource,
|};

type DropTargetProps = {|
  connectDropTarget: ConnectDropTarget,
  isOver: boolean,
  canDrop: boolean,
|};

type InnerDragSourceAndDropTargetProps<DraggedItemType> = {|
  ...Props<DraggedItemType>,
  ...DragSourceProps,
  ...DropTargetProps,
|};

export const makeDragSourceAndDropTarget = <DraggedItemType>(
  reactDndType: string
): ((Props<DraggedItemType>) => React.Node) => {
  const sourceSpec = {
    canDrag(props: Props<DraggedItemType>, monitor: DragSourceMonitor) {
      const item = monitor.getItem();
      const canDrag = props.canDrag || null;
      if (canDrag) return canDrag(item);
      return true;
    },
    beginDrag(props: InnerDragSourceAndDropTargetProps<DraggedItemType>) {
      return props.beginDrag();
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

  const targetSpec = {
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

  const InnerDragSourceAndDropTarget = DragSource(
    reactDndType,
    sourceSpec,
    sourceCollect
  )(
    DropTarget(
      reactDndType,
      targetSpec,
      targetCollect
    )(({ children, connectDragSource, connectDropTarget, isOver, canDrop }) => {
      return children({
        connectDragSource,
        connectDropTarget,
        isOver,
        canDrop,
      });
    })
  );

  return (props: Props<DraggedItemType>) => (
    <InnerDragSourceAndDropTarget {...props} />
  );
};
