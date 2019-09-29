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
  }) => React.Node,
  beginDrag: () => DraggedItemType,
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
  reactDndInstructionType: string
): (Props<DraggedItemType> => React.Node) => {


  const instructionSource = {
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
      // props.onMoveToInstruction();
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
    reactDndInstructionType,
    instructionSource,
    sourceCollect
  )(
    DropTarget(reactDndInstructionType, instructionTarget, targetCollect)(
      ({ children, connectDragSource, connectDropTarget, isOver, canDrop }) => {
        return children({
          connectDragSource,
          connectDropTarget,
          isOver,
          canDrop,
        });
      }
    )
  );

  return (props: Props<DraggedItemType>) => <InnerDragSourceAndDropTarget {...props} />;
};
