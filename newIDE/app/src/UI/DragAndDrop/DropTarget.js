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
  canDrop: (item: DraggedItemType, monitor?: DropTargetMonitor) => boolean,
  hover?: (monitor: DropTargetMonitor) => void,
  drop: (monitor: DropTargetMonitor) => void,
|};

export type DropTargetComponent<DraggedItemType> = (
  Props<DraggedItemType>
) => React.Node;

type AcceptedDragType = string | Array<string>;

type DropTargetProps = {|
  connectDropTarget: ConnectDropTarget,
  isOver: boolean,
  isOverLazy: boolean,
  canDrop: boolean,
|};

export const makeDropTarget = <DraggedItemType>(
  reactDndType: AcceptedDragType
): DropTargetComponent<DraggedItemType> => {
  const targetSpec = {
    canDrop(props: Props<DraggedItemType>, monitor: DropTargetMonitor) {
      const item = monitor.getItem();
      return item && props.canDrop(item, monitor);
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

  // $FlowFixMe[underconstrained-implicit-instantiation]
  // $FlowFixMe[incompatible-variance]
  const InnerDropTarget = DropTarget(
    // $FlowFixMe[incompatible-call] - react-dnd supports an array of item types.
    reactDndType,
    // $FlowFixMe[incompatible-variance]
    targetSpec,
    targetCollect
  )(
    // $FlowFixMe[missing-local-annot]
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
