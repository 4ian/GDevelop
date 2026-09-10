// @flow
import {
  serializeObjectFolderOrObjectNode,
  pasteNode,
} from './ObjectFolderOrObjectsClipboard';
import {
  type ObjectFolderOrObjectWithContext,
  getSelectionTopLevelNodes,
} from './EnumerateObjectFolderOrObject';

type DuplicateResult = {|
  createdObjects: Array<gdObject>,
  topLevelObjectFolderOrObjects: Array<gdObjectFolderOrObject>,
|};

/**
 * Duplicate objects and/or folders at a given position, without touching the
 * OS clipboard. When inserting several items, each one is placed at
 * `positionInFolder + index`.
 */
export const duplicateObjectFolderOrObjects = ({
  project,
  globalObjectsContainer,
  objectsContainer,
  items,
  destinationFolder,
  positionInFolder,
}: {|
  project: gdProject,
  globalObjectsContainer: gdObjectsContainer | null,
  objectsContainer: gdObjectsContainer,
  items: Array<ObjectFolderOrObjectWithContext>,
  destinationFolder: gdObjectFolderOrObject,
  positionInFolder: number,
|}): ?DuplicateResult => {
  const topLevelItems = getSelectionTopLevelNodes(items);
  if (topLevelItems.length === 0) return null;

  const createdObjects: Array<gdObject> = [];
  const topLevelObjectFolderOrObjects: Array<gdObjectFolderOrObject> = [];
  topLevelItems.forEach((item, index) => {
    const container =
      item.global && globalObjectsContainer
        ? globalObjectsContainer
        : objectsContainer;
    const node = serializeObjectFolderOrObjectNode(item.objectFolderOrObject);
    const pastedNode = pasteNode({
      node,
      project,
      globalObjectsContainer,
      objectsContainer,
      container,
      parentFolder: destinationFolder,
      position: positionInFolder + index,
    });
    createdObjects.push(...pastedNode.createdObjects);
    topLevelObjectFolderOrObjects.push(pastedNode.objectFolderOrObject);
  });

  return { createdObjects, topLevelObjectFolderOrObjects };
};

/**
 * Duplicate each top-level item right after itself. Positions are read live
 * after each insertion so later siblings already account for earlier copies.
 */
export const duplicateObjectFolderOrObjectsInPlace = ({
  project,
  globalObjectsContainer,
  objectsContainer,
  items,
}: {|
  project: gdProject,
  globalObjectsContainer: gdObjectsContainer | null,
  objectsContainer: gdObjectsContainer,
  items: Array<ObjectFolderOrObjectWithContext>,
|}): ?{|
  createdObjects: Array<gdObject>,
  duplicatedItems: Array<ObjectFolderOrObjectWithContext>,
|} => {
  const topLevelItems = getSelectionTopLevelNodes(items);
  if (topLevelItems.length === 0) return null;

  const createdObjects: Array<gdObject> = [];
  const duplicatedItems: Array<ObjectFolderOrObjectWithContext> = [];
  topLevelItems.forEach(item => {
    const parent = item.objectFolderOrObject.getParent();
    const result = duplicateObjectFolderOrObjects({
      project,
      globalObjectsContainer,
      objectsContainer,
      items: [item],
      destinationFolder: parent,
      positionInFolder: parent.getChildPosition(item.objectFolderOrObject) + 1,
    });
    if (!result) return;
    createdObjects.push(...result.createdObjects);
    result.topLevelObjectFolderOrObjects.forEach(objectFolderOrObject => {
      duplicatedItems.push({ objectFolderOrObject, global: item.global });
    });
  });

  if (duplicatedItems.length === 0) return null;
  return { createdObjects, duplicatedItems };
};
