// @flow

import { mapFor } from '../Utils/MapFor';
import { normalizeString } from '../Utils/Search';
const gd: libGDevelop = global.gd;

type MovementType =
  | 'ArrayToTopLevel'
  | 'FromArrayToAnotherArray'
  | 'FromArrayToStructure'
  | 'FromStructureToAnotherStructure'
  | 'FromStructureToArray'
  | 'InsideSameArray'
  | 'InsideSameStructure'
  | 'InsideTopLevel'
  | 'StructureToTopLevel'
  | 'TopLevelToStructure'
  | 'TopLevelToArray';

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

export const isAnAncestryOf = (
  variable: gdVariable,
  lineage: VariableLineage
): boolean => {
  const lineageVariables = lineage.map(context => context.variable);
  return lineageVariables.includes(variable);
};

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

export const updateListOfNodesFollowingChangeName = (
  list: string[],
  oldNodeId: string,
  newName: string
) => {
  const newList: Array<string> = [...list];
  const indexOfRenamedNode = newList.indexOf(oldNodeId);
  const indicesOfChildrenOfRenamedNode = newList.map((otherNodeId, index) => {
    if (otherNodeId.startsWith(`${oldNodeId}${separator}`)) {
      return index;
    }
    return null;
  });
  const originalNodeIdBits = oldNodeId.split(separator);
  const variableName = originalNodeIdBits[originalNodeIdBits.length - 1];
  [indexOfRenamedNode, ...indicesOfChildrenOfRenamedNode].forEach(index => {
    if (index === null || index < 0) return;
    const nodeIdToChange = newList[index];
    const bitsToChange = nodeIdToChange.split(separator);
    bitsToChange[bitsToChange.indexOf(variableName)] = newName;
    newList.splice(index, 1, bitsToChange.join(separator));
  });
  return newList;
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
    !draggedVariableParentVariable &&
    !!targetVariableParentVariable &&
    targetVariableParentVariable.getType() === gd.Variable.Array
  )
    return 'TopLevelToArray';
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

export const generateListOfNodesMatchingSearchInVariable = ({
  variable,
  variableName,
  nodeId,
  searchText,
  acc,
}: {|
  variable: gdVariable,
  variableName: string,
  nodeId: string,
  searchText: string,
  acc: Array<string>,
|}): Array<string> => {
  let newAcc;
  let childrenNodes;
  switch (variable.getType()) {
    case gd.Variable.Boolean:
      if (normalizeString(variableName).includes(searchText)) {
        return [nodeId];
      }
      return [];
    case gd.Variable.String:
      if (
        normalizeString(variableName).includes(searchText) ||
        normalizeString(variable.getString()).includes(searchText)
      ) {
        return [nodeId];
      }
      return [];
    case gd.Variable.Number:
      if (
        normalizeString(variableName).includes(searchText) ||
        variable
          .getValue()
          .toString()
          .includes(searchText)
      ) {
        return [nodeId];
      }
      return [];
    case gd.Variable.Array:
      newAcc = [...acc];
      if (normalizeString(variableName).includes(searchText)) {
        newAcc.push(nodeId);
      }
      childrenNodes = mapFor(0, variable.getChildrenCount(), index => {
        const childVariable = variable.getAtIndex(index);
        return generateListOfNodesMatchingSearchInVariable({
          variable: childVariable,
          variableName: '',
          nodeId: `${nodeId}${separator}${index}`,
          searchText: searchText,
          acc: newAcc,
        });
      }).flat();
      return [...newAcc, ...childrenNodes];
    case gd.Variable.Structure:
      newAcc = [...acc];
      if (normalizeString(variableName).includes(searchText)) {
        newAcc.push(nodeId);
      }
      childrenNodes = variable
        .getAllChildrenNames()
        .toJSArray()
        .map(childName => {
          const childVariable = variable.getChild(childName);

          return Array.from(
            new Set(
              generateListOfNodesMatchingSearchInVariable({
                variable: childVariable,
                variableName: childName,
                nodeId: `${nodeId}${separator}${childName}`,
                searchText: searchText,
                acc,
              })
            )
          );
        })
        .flat();

      return [...newAcc, ...childrenNodes];
    default:
      return [];
  }
};

export const generateListOfNodesMatchingSearchInVariablesContainer = (
  variablesContainer: gdVariablesContainer,
  searchText: string,
  prefix?: string
): Array<string> => {
  return mapFor(0, variablesContainer.count(), index => {
    const variable = variablesContainer.getAt(index);
    const name = variablesContainer.getNameAt(index);
    return generateListOfNodesMatchingSearchInVariable({
      variable,
      variableName: name,
      nodeId: prefix ? `${prefix}${name}` : name,
      searchText,
      acc: [],
    });
  }).flat();
};
