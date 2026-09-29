// @flow
import Clipboard from '../Utils/Clipboard';
import { SafeExtractor } from '../Utils/SafeExtractor';
import {
  serializeToJSObject,
  unserializeFromJSObject,
} from '../Utils/Serializer';
import newNameGenerator from '../Utils/NewNameGenerator';
import { mapFor } from '../Utils/MapFor';
import {
  type ObjectFolderOrObjectWithContext,
  getSelectionTopLevelNodes,
} from './EnumerateObjectFolderOrObject';
import { t } from '@lingui/macro';
import { type I18n as I18nType } from '@lingui/core';

const gd: libGDevelop = global.gd;

export const OBJECT_FOLDER_OR_OBJECTS_CLIPBOARD_KIND = 'ObjectFolderOrObjects';

// Kept for backward compatibility: read (but never written anymore) so that
// content copied before this multi-item clipboard was introduced (or copied
// from another window/version) can still be pasted.
export const OBJECT_CLIPBOARD_KIND = 'Object';

type SerializedObjectNode = {|
  kind: 'object',
  name: string,
  type: string,
  object: Object,
|};
type SerializedFolderNode = {|
  kind: 'folder',
  name: string,
  children: Array<SerializedObjectNode | SerializedFolderNode>,
|};
type SerializedNode = SerializedObjectNode | SerializedFolderNode;

export const serializeObjectFolderOrObjectNode = (
  objectFolderOrObject: gdObjectFolderOrObject
): SerializedNode => {
  if (objectFolderOrObject.isFolder()) {
    return {
      kind: 'folder',
      name: objectFolderOrObject.getFolderName(),
      children: mapFor(0, objectFolderOrObject.getChildrenCount(), i =>
        serializeObjectFolderOrObjectNode(objectFolderOrObject.getChildAt(i))
      ),
    };
  }
  const object = objectFolderOrObject.getObject();
  return {
    kind: 'object',
    name: object.getName(),
    type: object.getType(),
    object: serializeToJSObject(object),
  };
};

type ClipboardPayload = {|
  items: Array<SerializedNode>,
|};

/**
 * Serialize items to an in-memory payload without touching the OS clipboard.
 * Must be called while the C++ objects are still alive (before any deletion).
 * Returns null when the effective top-level selection is empty.
 */
export const serializeObjectFolderOrObjectsForClipboard = (
  items: Array<ObjectFolderOrObjectWithContext>
): ClipboardPayload | null => {
  const topLevelItems = getSelectionTopLevelNodes(items);
  if (topLevelItems.length === 0) return null;
  return {
    items: topLevelItems.map(({ objectFolderOrObject }) =>
      serializeObjectFolderOrObjectNode(objectFolderOrObject)
    ),
  };
};

/**
 * Write a previously serialized payload to the OS clipboard.
 * Call this only after the cut operation has been confirmed.
 */
export const writeObjectFolderOrObjectsToClipboard = (
  payload: ClipboardPayload
): void => {
  Clipboard.set(OBJECT_FOLDER_OR_OBJECTS_CLIPBOARD_KIND, payload);
};

export const copyObjectFolderOrObjectsToClipboard = (
  items: Array<ObjectFolderOrObjectWithContext>
): void => {
  const payload = serializeObjectFolderOrObjectsForClipboard(items);
  if (payload) writeObjectFolderOrObjectsToClipboard(payload);
};

export const hasObjectFolderOrObjectsInClipboard = (): boolean =>
  Clipboard.has(OBJECT_FOLDER_OR_OBJECTS_CLIPBOARD_KIND) ||
  Clipboard.has(OBJECT_CLIPBOARD_KIND);

const sanitizeNode = (rawNode: any): SerializedNode | null => {
  const name = SafeExtractor.extractStringProperty(rawNode, 'name');
  if (!name) return null;
  const kind = SafeExtractor.extractStringProperty(rawNode, 'kind');
  if (kind === 'folder') {
    const rawChildren =
      SafeExtractor.extractArrayProperty(rawNode, 'children') || [];
    const children = rawChildren.map(sanitizeNode).filter(Boolean);
    return { kind: 'folder', name, children };
  }
  const type = SafeExtractor.extractStringProperty(rawNode, 'type');
  const object = SafeExtractor.extractObjectProperty(rawNode, 'object');
  if (!type || !object) return null;
  return { kind: 'object', name, type, object };
};

/**
 * Read the clipboard content, supporting both the multi-item/folder format
 * and the legacy single-object format (kept for content copied before this
 * clipboard was introduced, or copied from another window/version).
 */
export const getObjectFolderOrObjectsClipboardContent = (): ?{|
  items: Array<SerializedNode>,
|} => {
  if (Clipboard.has(OBJECT_FOLDER_OR_OBJECTS_CLIPBOARD_KIND)) {
    const content = Clipboard.get(OBJECT_FOLDER_OR_OBJECTS_CLIPBOARD_KIND);
    const rawItems = SafeExtractor.extractArrayProperty(content, 'items');
    if (!rawItems) return null;
    const items = rawItems.map(sanitizeNode).filter(Boolean);
    if (items.length === 0) return null;
    return { items };
  }
  if (Clipboard.has(OBJECT_CLIPBOARD_KIND)) {
    const content = Clipboard.get(OBJECT_CLIPBOARD_KIND);
    const object = SafeExtractor.extractObjectProperty(content, 'object');
    const name = SafeExtractor.extractStringProperty(content, 'name');
    const type = SafeExtractor.extractStringProperty(content, 'type');
    if (!object || !name || !type) return null;
    return { items: [{ kind: 'object', name, type, object }] };
  }
  return null;
};

/**
 * A short, human readable name of what's in the clipboard, used in
 * "Paste ..." menu labels for single-item context menus.
 */
export const getObjectFolderOrObjectsClipboardSummaryName = (
  i18n: I18nType
): string => {
  const content = getObjectFolderOrObjectsClipboardContent();
  if (!content || content.items.length === 0) return '';
  if (content.items.length === 1) return content.items[0].name;
  return i18n._(t`${content.items.length} items`);
};

/**
 * Returns the localised label for a "Paste" menu item.
 * Shows the item name when one item is in the clipboard, a pluralised count
 * when several are, and a disabled hint when the clipboard is empty.
 */
export const getPasteMenuLabel = (i18n: I18nType): string => {
  const content = getObjectFolderOrObjectsClipboardContent();
  if (!content || content.items.length === 0) return i18n._(t`Paste`);
  if (content.items.length === 1)
    return i18n._(t`Paste "${content.items[0].name}"`);
  return i18n._(t`Paste ${content.items.length} items`);
};

const collectNodeObjectTypes = (
  node: SerializedNode,
  result: Array<string>
) => {
  if (node.kind === 'folder') {
    node.children.forEach(child => collectNodeObjectTypes(child, result));
  } else {
    result.push(node.type);
  }
};

/**
 * List the object types present in the clipboard (including inside folders),
 * to be checked (before pasting) against the project to know if pasting will
 * introduce a new object type in the project.
 */
export const getObjectFolderOrObjectsClipboardObjectTypes = (): Array<string> => {
  const content = getObjectFolderOrObjectsClipboardContent();
  if (!content) return [];
  const types: Array<string> = [];
  content.items.forEach(node => collectNodeObjectTypes(node, types));
  return types;
};

export const getUniqueFolderName = (
  parentFolder: gdObjectFolderOrObject,
  desiredName: string
): string => {
  const existingFolderNames = mapFor(0, parentFolder.getChildrenCount(), i => {
    const child = parentFolder.getChildAt(i);
    return child.isFolder() ? child.getFolderName() : null;
  }).filter(Boolean);
  return newNameGenerator(
    desiredName,
    name => existingFolderNames.includes(name),
    ''
  );
};

export const pasteNode = ({
  node,
  project,
  globalObjectsContainer,
  objectsContainer,
  container,
  parentFolder,
  position,
}: {|
  node: SerializedNode,
  project: gdProject,
  globalObjectsContainer: gdObjectsContainer | null,
  objectsContainer: gdObjectsContainer,
  container: gdObjectsContainer,
  parentFolder: gdObjectFolderOrObject,
  position: number,
|}): {|
  createdObjects: Array<gdObject>,
  objectFolderOrObject: gdObjectFolderOrObject,
|} => {
  if (node.kind === 'folder') {
    const uniqueFolderName = getUniqueFolderName(parentFolder, node.name);
    const newFolder = parentFolder.insertNewFolder(uniqueFolderName, position);
    const createdObjects: Array<gdObject> = [];
    node.children.forEach(childNode => {
      const pastedChild = pasteNode({
        node: childNode,
        project,
        globalObjectsContainer,
        objectsContainer,
        container,
        parentFolder: newFolder,
        position: newFolder.getChildrenCount(),
      });
      createdObjects.push(...pastedChild.createdObjects);
    });
    return { createdObjects, objectFolderOrObject: newFolder };
  }

  const newName = newNameGenerator(
    node.name,
    name =>
      objectsContainer.hasObjectNamed(name) ||
      (!!globalObjectsContainer && globalObjectsContainer.hasObjectNamed(name)),
    ''
  );
  const newObject = container.insertNewObjectInFolder(
    project,
    node.type,
    newName,
    parentFolder,
    position
  );
  unserializeFromJSObject(newObject, node.object, 'unserializeFrom', project);
  newObject.setName(newName); // Unserialization has overwritten the name.
  newObject.resetPersistentUuid();

  return {
    createdObjects: [newObject],
    objectFolderOrObject: parentFolder.getObjectChild(newName),
  };
};

/**
 * Paste the content of the clipboard (objects and/or folders, with their
 * content) into the given container, inside (or right after) the given
 * folder.
 */
export const pasteObjectFolderOrObjectsFromClipboard = ({
  project,
  globalObjectsContainer,
  objectsContainer,
  global,
  destinationFolder,
  positionInFolder,
}: {|
  project: gdProject,
  globalObjectsContainer: gdObjectsContainer | null,
  objectsContainer: gdObjectsContainer,
  global: boolean,
  destinationFolder: gdObjectFolderOrObject,
  positionInFolder: number,
|}): ?{|
  createdObjects: Array<gdObject>,
  topLevelObjectFolderOrObjects: Array<gdObjectFolderOrObject>,
|} => {
  const clipboardContent = getObjectFolderOrObjectsClipboardContent();
  if (!clipboardContent) return null;

  const container =
    global && globalObjectsContainer
      ? globalObjectsContainer
      : objectsContainer;

  const createdObjects: Array<gdObject> = [];
  const topLevelObjectFolderOrObjects: Array<gdObjectFolderOrObject> = [];
  clipboardContent.items.forEach((node, index) => {
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
 * Paste the content of the clipboard at the given position and run the whole
 * notification sequence shared by every paste entry point of the Objects
 * panel: mark the project as modified, fire the object hooks (only when
 * actual objects were created - pasting empty folders produces top-level
 * items but no objects), and select the pasted items.
 * Returns true when something was pasted.
 */
export const pasteObjectFolderOrObjectsAndNotify = ({
  project,
  globalObjectsContainer,
  objectsContainer,
  global,
  destinationFolder,
  positionInFolder,
  onObjectModified,
  onObjectPasted,
  onObjectCreated,
  selectObjectFolderOrObjectsWithContext,
}: {|
  project: gdProject,
  globalObjectsContainer: gdObjectsContainer | null,
  objectsContainer: gdObjectsContainer,
  global: boolean,
  destinationFolder: gdObjectFolderOrObject,
  positionInFolder: number,
  onObjectModified: (shouldForceUpdateList: boolean) => void,
  onObjectPasted: ?(object: gdObject) => void,
  onObjectCreated: (
    objects: Array<gdObject>,
    isTheFirstOfItsTypeInProject: boolean
  ) => void,
  selectObjectFolderOrObjectsWithContext: (
    items: Array<ObjectFolderOrObjectWithContext>
  ) => void,
|}): boolean => {
  const isTheFirstOfItsTypeInProject = getObjectFolderOrObjectsClipboardObjectTypes().some(
    objectType => !gd.UsedObjectTypeFinder.scanProject(project, objectType)
  );

  const pastedContent = pasteObjectFolderOrObjectsFromClipboard({
    project,
    globalObjectsContainer,
    objectsContainer,
    global,
    destinationFolder,
    positionInFolder,
  });
  if (!pastedContent) return false;
  const { createdObjects, topLevelObjectFolderOrObjects } = pastedContent;
  if (topLevelObjectFolderOrObjects.length === 0) return false;

  // onObjectModified(true) already calls forceUpdateList internally.
  onObjectModified(true);
  if (createdObjects.length > 0) {
    if (onObjectPasted) onObjectPasted(createdObjects[0]);
    onObjectCreated(createdObjects, isTheFirstOfItsTypeInProject);
  }
  selectObjectFolderOrObjectsWithContext(
    topLevelObjectFolderOrObjects.map(objectFolderOrObject => ({
      objectFolderOrObject,
      global,
    }))
  );
  return true;
};
