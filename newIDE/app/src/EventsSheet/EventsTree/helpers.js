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

export const moveNodeAsSubevent = ({
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
    node.indexInList < targetNode.indexInList && node.depth === targetNode.depth
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
    node.indexInList < targetNode.indexInList && node.depth === targetNode.depth
      ? targetNode.indexInList - 1
      : targetNode.indexInList;
  moveEventToEventsList({
    targetEventsList: targetNode.eventsList,
    movingEvent: node.event,
    initialEventsList: node.eventsList,
    toIndex,
  });
};

// Optimises react-sortable-tree isDescendant that processes every children with a .some method.
export const isDescendant = (
  olderNode: SortableTreeNode,
  childrenNode: SortableTreeNode
) => {
  const parentPath = olderNode.nodePath;
  const childrenPath = childrenNode.nodePath;
  if (childrenNode.depth <= olderNode.depth) return false;
  return parentPath[olderNode.depth] === childrenPath[olderNode.depth];
};
