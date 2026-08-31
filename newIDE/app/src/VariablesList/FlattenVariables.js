// @flow
import { mapFor } from '../Utils/MapFor';
import { inheritedPrefix, separator } from './VariableToTreeNodeHandling';

const gd: libGDevelop = global.gd;

/**
 * A variable to be displayed as a row of the variables list. The tree of
 * variables is flattened into a list of these, so that only the rows that
 * are visible on screen have to be rendered.
 */
export type FlattenedVariable = {|
  nodeId: string,
  name: string,
  /** Position of the variable in its parent (or in the container, for a root variable). */
  index: number,
  depth: number,
  variable: gdVariable,
  parentVariable: gdVariable | null,
  isInherited: boolean,
  type: Variable_Type,
  isCollection: boolean,
  isExpanded: boolean,
|};

/**
 * Node ids of the variables to display, according to a search: the ones matching
 * the search and all their ancestors (the descendants of a matching variable are
 * displayed too, which is handled while walking the tree).
 */
const getNodeIdsToDisplay = (
  searchMatchingNodeIds: Array<string>
): Set<string> => {
  const nodeIdsToDisplay = new Set<string>();
  for (const matchingNodeId of searchMatchingNodeIds) {
    let nodeId = '';
    for (const nodeIdPart of matchingNodeId.split(separator)) {
      nodeId = nodeId ? nodeId + separator + nodeIdPart : nodeIdPart;
      nodeIdsToDisplay.add(nodeId);
    }
  }
  return nodeIdsToDisplay;
};

const flattenVariable = ({
  name,
  index,
  variable,
  parentVariable,
  parentNodeId,
  depth,
  isInherited,
  hasMatchingAncestor,
  searchFilter,
  flattenedVariables,
}: {|
  name: string,
  index: number,
  variable: gdVariable,
  parentVariable: gdVariable | null,
  parentNodeId: string | null,
  depth: number,
  isInherited: boolean,
  hasMatchingAncestor: boolean,
  searchFilter: ?{|
    matchingNodeIds: Set<string>,
    nodeIdsToDisplay: Set<string>,
  |},
  flattenedVariables: Array<FlattenedVariable>,
|}) => {
  const nodeId = parentNodeId
    ? `${parentNodeId}${separator}${name}`
    : isInherited
    ? `${inheritedPrefix}${name}`
    : name;

  if (
    searchFilter &&
    !hasMatchingAncestor &&
    !searchFilter.nodeIdsToDisplay.has(nodeId)
  ) {
    // Neither this variable nor any of its descendants match the search.
    return;
  }

  const type = variable.getType();
  const isCollection =
    type === gd.Variable.Structure || type === gd.Variable.Array;
  const isExpanded = isCollection && !variable.isFolded();

  flattenedVariables.push({
    nodeId,
    name,
    index,
    depth,
    variable,
    parentVariable,
    isInherited,
    type,
    isCollection,
    isExpanded,
  });

  if (!isExpanded) return;

  const childHasMatchingAncestor =
    hasMatchingAncestor ||
    (!!searchFilter && searchFilter.matchingNodeIds.has(nodeId));
  const flattenChild = (childName: string, childIndex: number) =>
    flattenVariable({
      name: childName,
      index: childIndex,
      variable:
        type === gd.Variable.Structure
          ? variable.getChild(childName)
          : variable.getAtIndex(childIndex),
      parentVariable: variable,
      parentNodeId: nodeId,
      depth: depth + 1,
      isInherited,
      hasMatchingAncestor: childHasMatchingAncestor,
      searchFilter,
      flattenedVariables,
    });

  if (type === gd.Variable.Structure) {
    variable
      .getAllChildrenNames()
      .toJSArray()
      .forEach(flattenChild);
  } else {
    mapFor(0, variable.getChildrenCount(), childIndex =>
      flattenChild(childIndex.toString(), childIndex)
    );
  }
};

/**
 * Flatten the tree of variables (folded variables have their children hidden)
 * into the list of rows to display, in order: first the inherited variables
 * that are not overridden, then the variables of the container itself.
 */
export const flattenVariablesContainers = ({
  variablesContainer,
  inheritedVariablesContainer,
  searchMatchingNodeIds,
}: {|
  variablesContainer: gdVariablesContainer,
  inheritedVariablesContainer: ?gdVariablesContainer,
  /** If set, only the variables matching the search are displayed. */
  searchMatchingNodeIds: ?Array<string>,
|}): Array<FlattenedVariable> => {
  const searchFilter = searchMatchingNodeIds
    ? {
        matchingNodeIds: new Set(searchMatchingNodeIds),
        nodeIdsToDisplay: getNodeIdsToDisplay(searchMatchingNodeIds),
      }
    : null;

  const flattenedVariables: Array<FlattenedVariable> = [];
  const flattenContainer = (
    container: gdVariablesContainer,
    isInherited: boolean
  ) => {
    mapFor(0, container.count(), index => {
      const name = container.getNameAt(index);
      // An inherited variable that is overridden is displayed by the container
      // itself, not as an inherited variable.
      if (isInherited && variablesContainer.has(name)) return;

      flattenVariable({
        name,
        index,
        variable: container.getAt(index),
        parentVariable: null,
        parentNodeId: null,
        depth: 0,
        isInherited,
        hasMatchingAncestor: false,
        searchFilter,
        flattenedVariables,
      });
    });
  };

  if (inheritedVariablesContainer) {
    flattenContainer(inheritedVariablesContainer, true);
  }
  flattenContainer(variablesContainer, false);

  return flattenedVariables;
};
