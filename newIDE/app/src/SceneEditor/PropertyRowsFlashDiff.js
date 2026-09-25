// @flow

/**
 * The top-level keys whose value differs between the two objects.
 */
export const getChangedTopLevelKeys = (
  before: ?{ [key: string]: mixed },
  after: ?{ [key: string]: mixed },
  excludeKeys: Array<string> = []
): Array<string> => {
  const beforeObject: { [key: string]: mixed } = before || {};
  const afterObject: { [key: string]: mixed } = after || {};
  const keys = new Set([
    ...Object.keys(beforeObject),
    ...Object.keys(afterObject),
  ]);
  excludeKeys.forEach(key => keys.delete(key));
  const changedKeys: Array<string> = [];
  keys.forEach(key => {
    if (
      JSON.stringify(beforeObject[key]) !== JSON.stringify(afterObject[key])
    ) {
      changedKeys.push(key);
    }
  });
  return changedKeys;
};

export const findSerializedItemByName = (
  items: ?Array<Object>,
  name: string
): ?Object => (items || []).find(item => item.name === name);

const variableTreeSeparator = '$.$';

/**
 * The node ids (matching `data-variable-node-id`, see `VariablesList.js`
 * and `VariableToTreeNodeHandling.js`) of variables whose value changed
 * between the two (already serialized) variable lists - a variable that
 * was added or removed isn't included (like an added/removed instance,
 * it's already visible by appearing/disappearing).
 */
export const getChangedVariableNodeIds = (
  before: ?Array<Object>,
  after: ?Array<Object>,
  parentNodeId: ?string
): Array<string> => {
  const beforeByName = new Map(
    (before || []).map(variable => [variable.name, variable])
  );
  const changedNodeIds: Array<string> = [];
  (after || []).forEach(afterVariable => {
    const beforeVariable = beforeByName.get(afterVariable.name);
    const nodeId = parentNodeId
      ? `${parentNodeId}${variableTreeSeparator}${afterVariable.name}`
      : afterVariable.name;
    // An added variable is a change to show too.
    if (!beforeVariable) {
      changedNodeIds.push(nodeId);
      return;
    }
    changedNodeIds.push(
      ...getChangedVariableOrChildrenNodeIds(
        beforeVariable,
        afterVariable,
        nodeId
      )
    );
  });
  return changedNodeIds;
};

const getChangedArrayVariableNodeIds = (
  before: ?Array<Object>,
  after: ?Array<Object>,
  parentNodeId: string
): Array<string> => {
  const beforeChildren = before || [];
  const afterChildren = after || [];
  const changedNodeIds: Array<string> = [];
  afterChildren.forEach((afterVariable, index) => {
    const beforeVariable = beforeChildren[index];
    const nodeId = `${parentNodeId}${variableTreeSeparator}${index}`;
    // An added item is a change to show too. Items are matched by index:
    // a removed item makes the ones after it look changed, which is fine.
    if (!beforeVariable) {
      changedNodeIds.push(nodeId);
      return;
    }
    changedNodeIds.push(
      ...getChangedVariableOrChildrenNodeIds(
        beforeVariable,
        afterVariable,
        nodeId
      )
    );
  });
  return changedNodeIds;
};

/**
 * Whether the change removed variables (top level or children): the rows of
 * removed variables can't be flashed, so their container is instead.
 */
export const hasRemovedVariables = (
  before: ?Array<Object>,
  after: ?Array<Object>
): boolean => {
  const afterByName = new Map(
    (after || []).map(variable => [variable.name, variable])
  );
  return (before || []).some(beforeVariable => {
    const afterVariable = afterByName.get(beforeVariable.name);
    if (!afterVariable) return true;
    if (beforeVariable.type !== afterVariable.type) return false;
    if (afterVariable.type === 'structure')
      return hasRemovedVariables(
        beforeVariable.children,
        afterVariable.children
      );
    if (afterVariable.type === 'array')
      return (
        (beforeVariable.children || []).length >
        (afterVariable.children || []).length
      );
    return false;
  });
};

const getChangedVariableOrChildrenNodeIds = (
  beforeVariable: Object,
  afterVariable: Object,
  nodeId: string
): Array<string> => {
  if (beforeVariable.type !== afterVariable.type) return [nodeId];
  if (afterVariable.type === 'structure') {
    return getChangedVariableNodeIds(
      beforeVariable.children,
      afterVariable.children,
      nodeId
    );
  }
  if (afterVariable.type === 'array') {
    return getChangedArrayVariableNodeIds(
      beforeVariable.children,
      afterVariable.children,
      nodeId
    );
  }
  return JSON.stringify(beforeVariable.value) !==
    JSON.stringify(afterVariable.value)
    ? [nodeId]
    : [];
};
