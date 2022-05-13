// @flow

import { mapFor } from '../Utils/MapFor';
const gd: libGDevelop = global.gd;

type MovementType =
  | 'TopLevelToStructure'
  | 'InsideTopLevel'
  | 'StructureToTopLevel'
  | 'ArrayToTopLevel'
  | 'FromStructureToAnotherStructure'
  | 'InsideSameStructure'
  | 'FromArrayToAnotherArray'
  | 'InsideSameArray'
  | 'FromStructureToArray'
  | 'FromArrayToStructure';

type VariableLineage = Array<{|
  nodeId: string,
  name: string,
  variable: gdVariable,
|}>;

type VariableContext = {|
  variable: gdVariable | null,
  lineage: VariableLineage,
  depth: number,
  name: string | null,
|};

export const inheritedPrefix = '$!';
export const separator = '$.$';

export const removeInheritedPrefix = (str: string): string =>
  str.slice(inheritedPrefix.length, str.length);

export const getDirectParentVariable = (lineage: VariableLineage) =>
  lineage[lineage.length - 1] ? lineage[lineage.length - 1].variable : null;
export const getDirectParentNodeId = (lineage: VariableLineage) =>
  lineage[lineage.length - 1] ? lineage[lineage.length - 1].nodeId : null;
export const getOldestAncestryVariable = (lineage: VariableLineage) =>
  lineage.length ? lineage[0] : null;

export const getVariableContextFromNodeId = (
  nodeId: string,
  variablesContainer: gdVariablesContainer
): VariableContext => {
  const bits = nodeId.split(separator);
  let parentVariable = null;
  let currentVariable = null;
  let currentVariableName = null;
  let lineage = [];
  let name = null;
  let depth = -1;

  while (depth < bits.length - 1) {
    depth += 1;
    currentVariableName = bits[depth];
    if (depth === 0 && currentVariableName.startsWith(inheritedPrefix)) {
      currentVariableName = removeInheritedPrefix(currentVariableName);
    }
    if (!parentVariable) {
      currentVariable = variablesContainer.get(currentVariableName);
    } else {
      if (parentVariable.getType() === gd.Variable.Array) {
        const index = parseInt(currentVariableName, 10);
        if (index >= parentVariable.getChildrenCount()) {
          return { variable: null, lineage, depth, name };
        }
        currentVariable = parentVariable.getAtIndex(index);
      } else {
        if (!parentVariable.hasChild(currentVariableName)) {
          return { variable: null, lineage, depth, name };
        }
        currentVariable = parentVariable.getChild(currentVariableName);
      }
    }
    if (depth < bits.length - 1) {
      lineage.push({
        nodeId: bits.slice(0, depth + 1).join(separator),
        name: currentVariableName,
        variable: currentVariable,
      });
    }
    parentVariable = currentVariable;
  }
  return {
    variable: currentVariable,
    name: currentVariableName,
    depth,
    lineage,
  };
};

export const getExpandedNodeIdsFromVariables = (
  variables: { name: string, variable: gdVariable }[],
  accumulator: string[],
  parentNodeId: string = ''
): string[] => {
  let newAccumulator = [];
  for (const { name, variable } of variables) {
    const nodeId = parentNodeId ? `${parentNodeId}${separator}${name}` : name;
    if (!variable.isFolded() && variable.getChildrenCount() > 0) {
      newAccumulator.push(nodeId);
    }
    if (variable.getType() === gd.Variable.Array) {
      const children = mapFor(0, variable.getChildrenCount(), index => ({
        name: index.toString(),
        variable: variable.getAtIndex(index),
      }));
      newAccumulator = [
        ...newAccumulator,
        ...getExpandedNodeIdsFromVariables(children, newAccumulator, nodeId),
      ];
    } else if (variable.getType() === gd.Variable.Structure) {
      const children = variable
        .getAllChildrenNames()
        .toJSArray()
        .map((childName, index) => ({
          variable: variable.getChild(childName),
          name: childName,
        }));
      newAccumulator = [
        ...newAccumulator,
        ...getExpandedNodeIdsFromVariables(children, newAccumulator, nodeId),
      ];
    }
  }
  return newAccumulator;
};

export const updateListOfNodesFollowingChangeName = (
  list: string[],
  oldNodeId: string,
  newName: string
) => {
  const newList: Array<string> = [...list];
  const indexOfRenamedNode = newList.indexOf(oldNodeId);
  const indicesOfChildrenOfRenamedNode = newList
    .map(otherNodeId => {
      if (otherNodeId.startsWith(`${oldNodeId}${separator}`)) {
        return newList.indexOf(otherNodeId);
      }
      return null;
    })
    .filter(Boolean);
  const originalNodeIdBits = oldNodeId.split(separator);
  const variableName = originalNodeIdBits[originalNodeIdBits.length - 1];
  [indexOfRenamedNode, ...indicesOfChildrenOfRenamedNode]
    .filter(index => index >= 0)
    .forEach(index => {
      const nodeIdToChange = newList[index];
      const bitsToChange = nodeIdToChange.split(separator);
      bitsToChange[bitsToChange.indexOf(variableName)] = newName;
      newList.splice(index, 1, bitsToChange.join(separator));
    });
  return newList;
};

export const getExpandedNodeIdsFromVariablesContainer = (
  variablesContainer: gdVariablesContainer,
  isInherited: boolean = false
): string[] => {
  const variables = [];
  for (let index = 0; index < variablesContainer.count(); index += 1) {
    variables.push({
      name: `${
        isInherited ? inheritedPrefix : ''
      }${variablesContainer.getNameAt(index)}`,
      variable: variablesContainer.getAt(index),
    });
  }
  return getExpandedNodeIdsFromVariables(variables, []);
};

export const foldNodesVariables = (
  variablesContainer: gdVariablesContainer,
  nodes: string[],
  fold: boolean
) => {
  nodes.forEach(nodeId => {
    const { variable } = getVariableContextFromNodeId(
      nodeId,
      variablesContainer
    );
    if (variable) {
      variable.setFolded(fold);
    }
  });
};

export const getMovementTypeWithinVariablesContainer = (
  draggedVariableContext: VariableContext,
  targetVariableContext: VariableContext
): ?MovementType => {
  const { lineage: targetVariableLineage } = targetVariableContext;
  const targetVariableParentVariable = getDirectParentVariable(
    targetVariableLineage
  );

  const { lineage: draggedVariableLineage } = draggedVariableContext;
  const draggedVariableParentVariable = getDirectParentVariable(
    draggedVariableLineage
  );

  if (!!draggedVariableParentVariable && !!targetVariableParentVariable) {
    if (
      targetVariableParentVariable.getType() === gd.Variable.Structure &&
      draggedVariableParentVariable.getType() === gd.Variable.Structure &&
      draggedVariableParentVariable !== targetVariableParentVariable
    )
      return 'FromStructureToAnotherStructure';
    if (
      targetVariableParentVariable.getType() === gd.Variable.Structure &&
      draggedVariableParentVariable === targetVariableParentVariable
    )
      return 'InsideSameStructure';
    if (
      targetVariableParentVariable.getType() === gd.Variable.Array &&
      draggedVariableParentVariable.getType() === gd.Variable.Array &&
      draggedVariableParentVariable !== targetVariableParentVariable
    )
      return 'FromArrayToAnotherArray';
    if (
      targetVariableParentVariable.getType() === gd.Variable.Array &&
      draggedVariableParentVariable === targetVariableParentVariable
    )
      return 'InsideSameArray';
    if (
      targetVariableParentVariable.getType() === gd.Variable.Array &&
      draggedVariableParentVariable.getType() === gd.Variable.Structure
    )
      return 'FromStructureToArray';
    if (
      targetVariableParentVariable.getType() === gd.Variable.Structure &&
      draggedVariableParentVariable.getType() === gd.Variable.Array
    )
      return 'FromArrayToStructure';
  }

  if (!draggedVariableParentVariable && !targetVariableParentVariable)
    return 'InsideTopLevel';
  if (
    !draggedVariableParentVariable &&
    !!targetVariableParentVariable &&
    targetVariableParentVariable.getType() === gd.Variable.Structure
  )
    return 'TopLevelToStructure';
  if (
    !!draggedVariableParentVariable &&
    !targetVariableParentVariable &&
    draggedVariableParentVariable.getType() === gd.Variable.Structure
  )
    return 'StructureToTopLevel';
  if (
    !!draggedVariableParentVariable &&
    !targetVariableParentVariable &&
    draggedVariableParentVariable.getType() === gd.Variable.Array
  )
    return 'ArrayToTopLevel';

  return null;
};
