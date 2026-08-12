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
 * Duplicate objects and/or folders in place (right after themselves, or at
 * the given position), without touching the OS clipboard.
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
