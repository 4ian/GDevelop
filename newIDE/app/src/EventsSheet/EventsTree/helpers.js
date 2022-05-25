import { type SortableTreeNode } from '.';

export type MoveFunctionArguments = {
  targetNode: SortableTreeNode,
  node: SortableTreeNode,
};

export const moveEventToEventsList = ({
  targetEventsList,
  movingEvent,
  initialEventsList,
  toIndex,
}: {
  targetEventsList: gdEventsList,
  movingEvent: ?gdBaseEvent,
  initialEventsList: gdEventsList,
  toIndex: number,
}) => {
  if (!movingEvent) return;
  initialEventsList.moveEventToAnotherEventsList(
    movingEvent,
    targetEventsList,
    toIndex
  );
};

export const moveNodeAsSubEvent = ({
  targetNode,
  node,
}: MoveFunctionArguments) => {
  if (!targetNode.event) return;
  moveEventToEventsList({
    targetEventsList: targetNode.event.getSubEvents(),
    movingEvent: node.event,
    initialEventsList: node.eventsList,
    toIndex: 0,
  });
};

export const moveNodeBelow = ({ targetNode, node }: MoveFunctionArguments) => {
  if (!targetNode.event) return;
  const toIndex =
    node.depth === targetNode.depth && node.indexInList < targetNode.indexInList
      ? targetNode.indexInList
      : targetNode.indexInList + 1;
  moveEventToEventsList({
    targetEventsList: targetNode.eventsList,
    movingEvent: node.event,
    initialEventsList: node.eventsList,
    toIndex,
  });
};

export const moveNodeAbove = ({ targetNode, node }: MoveFunctionArguments) => {
  const toIndex =
    node.depth === targetNode.depth && node.indexInList < targetNode.indexInList
      ? targetNode.indexInList - 1
      : targetNode.indexInList;
  moveEventToEventsList({
    targetEventsList: targetNode.eventsList,
    movingEvent: node.event,
    initialEventsList: node.eventsList,
    toIndex,
  });
};

export const isDescendant = (
  olderNode: SortableTreeNode,
  childNode: SortableTreeNode
) => {
  if (childNode.depth <= olderNode.depth) return false;
  const parentPath = olderNode.nodePath;
  const childPath = childNode.nodePath;
  return parentPath.every((pathValue, index) => pathValue === childPath[index]);
};

export const isSameDepthAndBelow = (
  aboveNode: SortableTreeNode,
  belowNode: SortableTreeNode
) => {
  if (aboveNode.depth !== belowNode.depth) return false;
  const belowNodePath = belowNode.nodePath;
  const aboveNodePath = aboveNode.nodePath;
  if (belowNodePath[belowNodePath.length - 1] === 0) return false;
  return (
    belowNodePath[belowNodePath.length - 1] - 1 ===
    aboveNodePath[aboveNodePath.length - 1]
  );
};
