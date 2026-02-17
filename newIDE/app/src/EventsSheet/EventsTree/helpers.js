// @flow
import { type SortableTreeNode } from './SortableEventsTree';

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
  movingEvent: gdBaseEvent,
  initialEventsList: gdEventsList,
  toIndex: number,
}) => {
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
  const event = node.event;
  if (!targetNode.event || !event) return;
  moveEventToEventsList({
    targetEventsList: targetNode.event.getSubEvents(),
    movingEvent: event,
    initialEventsList: node.eventsList,
    toIndex: 0,
  });
};

export const moveNodeBelow = ({ targetNode, node }: MoveFunctionArguments) => {
  if (!targetNode.event || !node.event) return;
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
  if (!targetNode.event || !node.event) return;
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
): boolean => {
  if (childNode.depth <= olderNode.depth) return false;
  const parentPath = olderNode.nodePath;
  const childPath = childNode.nodePath;
  return parentPath.every((pathValue, index) => pathValue === childPath[index]);
};

export const isSibling = (
  nodeA: SortableTreeNode,
  nodeB: SortableTreeNode
): boolean => {
  if (nodeA.depth !== nodeB.depth) return false;
  const nodeAPath = nodeA.nodePath;
  const nodeBPath = nodeB.nodePath;
  return nodeAPath
    .slice(0, -1)
    .every((pathValue, index) => pathValue === nodeBPath[index]);
};

export const isJustBelow = (
  aboveNode: SortableTreeNode,
  belowNode: SortableTreeNode
): boolean => {
  const belowNodePath = belowNode.nodePath;
  const aboveNodePath = aboveNode.nodePath;
  if (belowNodePath[belowNodePath.length - 1] === 0) return false;
  return (
    belowNodePath[belowNodePath.length - 1] - 1 ===
    aboveNodePath[aboveNodePath.length - 1]
  );
};

export const getNodeAtPath = (
  path: Array<number>,
  treeData: Array<SortableTreeNode>
): any | SortableTreeNode => {
  if (path.length === 1) return treeData[path[0]];
  return getNodeAtPath(
    path.slice(0, -1),
    treeData[path[path.length - 1]].children
  );
};

/**
 * Returns the index of the previous non-disabled, executable event
 * in the list, or -1 if none is found.
 */
export const getPreviousExecutableEventIndex = (
  eventsList: gdEventsList,
  eventIndex: number
): number => {
  const startIndex = Math.min(eventIndex - 1, eventsList.getEventsCount() - 1);
  for (let j = startIndex; j >= 0; j--) {
    const previousEvent = eventsList.getEventAt(j);
    if (!previousEvent.isDisabled() && previousEvent.isExecutable()) {
      return j;
    }
  }
  return -1;
};

export const isElseEventValid = (
  eventsList: gdEventsList,
  elseEventIndex: number
): boolean => {
  const previousIndex = getPreviousExecutableEventIndex(
    eventsList,
    elseEventIndex
  );
  if (previousIndex === -1) return false;
  const previousEventType = eventsList.getEventAt(previousIndex).getType();
  return (
    previousEventType === 'BuiltinCommonInstructions::Standard' ||
    previousEventType === 'BuiltinCommonInstructions::Else'
  );
};
