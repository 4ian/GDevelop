// @flow
import { t } from '@lingui/macro';
import { type I18n as I18nType } from '@lingui/core';
import Clipboard from '../Utils/Clipboard';
import { SafeExtractor } from '../Utils/SafeExtractor';
import { serializeToJSObject } from '../Utils/Serializer';
import newNameGenerator from '../Utils/NewNameGenerator';
import { mapFor } from '../Utils/MapFor';
import {
  type ProjectItemFoldersKind,
  type ProjectItemFolderOrItem,
  moveNewItemToFolder,
} from './ProjectItemFolders';

type SerializedItemNode = {|
  kind: 'item',
  name: string,
  item: Object,
|};
type SerializedFolderNode = {|
  kind: 'folder',
  name: string,
  children: Array<SerializedItemNode | SerializedFolderNode>,
|};
type SerializedNode = SerializedItemNode | SerializedFolderNode;

const getClipboardKind = (kind: ProjectItemFoldersKind): string =>
  `${kind.name}-folders-or-items`;

/**
 * Serialize a node of a folder structure. Folders are described by a plain JS
 * tree (they are not serializable on their own) and only the items they
 * contain are actually serialized.
 */
const serializeFolderOrItemNode = (
  folderOrItem: ProjectItemFolderOrItem
): SerializedNode => {
  if (folderOrItem.isFolder()) {
    return {
      kind: 'folder',
      name: folderOrItem.getFolderName(),
      children: mapFor(0, folderOrItem.getChildrenCount(), i =>
        serializeFolderOrItemNode(folderOrItem.getChildAt(i))
      ),
    };
  }
  const item = folderOrItem.getItem();
  return {
    kind: 'item',
    name: item.getName(),
    item: serializeToJSObject(item),
  };
};

export const copyFolderOrItemsToClipboard = (
  kind: ProjectItemFoldersKind,
  folderOrItems: Array<ProjectItemFolderOrItem>
): void => {
  Clipboard.set(getClipboardKind(kind), {
    items: folderOrItems.map(serializeFolderOrItemNode),
  });
};

export const copyFolderOrItemToClipboard = (
  kind: ProjectItemFoldersKind,
  folderOrItem: ProjectItemFolderOrItem
): void => copyFolderOrItemsToClipboard(kind, [folderOrItem]);

export const hasFolderOrItemsInClipboard = (
  kind: ProjectItemFoldersKind
): boolean =>
  Clipboard.has(getClipboardKind(kind)) ||
  Clipboard.has(kind.legacyClipboard.kind);

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
  const item = SafeExtractor.extractObjectProperty(rawNode, 'item');
  if (!item) return null;
  return { kind: 'item', name, item };
};

/**
 * Read the clipboard content, supporting both the folder-aware format and the
 * legacy single-item format.
 */
const getClipboardContent = (
  kind: ProjectItemFoldersKind
): ?{|
  items: Array<SerializedNode>,
|} => {
  if (Clipboard.has(getClipboardKind(kind))) {
    const content = Clipboard.get(getClipboardKind(kind));
    const rawItems = SafeExtractor.extractArrayProperty(content, 'items');
    if (!rawItems) return null;
    const items = rawItems.map(sanitizeNode).filter(Boolean);
    if (items.length === 0) return null;
    return { items };
  }
  const { legacyClipboard } = kind;
  if (Clipboard.has(legacyClipboard.kind)) {
    const content = Clipboard.get(legacyClipboard.kind);
    const item = SafeExtractor.extractObjectProperty(
      content,
      legacyClipboard.itemProperty
    );
    const name = SafeExtractor.extractStringProperty(content, 'name');
    if (!item || !name) return null;
    return { items: [{ kind: 'item', name, item }] };
  }
  return null;
};

/**
 * Returns the localised label for a "Paste" menu item.
 */
export const getPasteMenuLabel = (
  i18n: I18nType,
  kind: ProjectItemFoldersKind
): string => {
  const content = getClipboardContent(kind);
  if (!content || content.items.length === 0) return i18n._(t`Paste`);
  if (content.items.length === 1)
    return i18n._(t`Paste "${content.items[0].name}"`);
  return i18n._(t`Paste ${content.items.length} items`);
};

const getUniqueFolderName = (
  parentFolder: ProjectItemFolderOrItem,
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

const pasteNode = ({
  kind,
  node,
  project,
  parentFolder,
  position,
}: {|
  kind: ProjectItemFoldersKind,
  node: SerializedNode,
  project: gdProject,
  parentFolder: ProjectItemFolderOrItem,
  position: number,
|}): {|
  createdItems: Array<any>,
  folderOrItem: ProjectItemFolderOrItem,
|} => {
  if (node.kind === 'folder') {
    const uniqueFolderName = getUniqueFolderName(parentFolder, node.name);
    const newFolder = parentFolder.insertNewFolder(uniqueFolderName, position);
    const createdItems: Array<any> = [];
    node.children.forEach(childNode => {
      const pastedChild = pasteNode({
        kind,
        node: childNode,
        project,
        parentFolder: newFolder,
        position: newFolder.getChildrenCount(),
      });
      createdItems.push(...pastedChild.createdItems);
    });
    return { createdItems, folderOrItem: newFolder };
  }

  const newName = newNameGenerator(
    node.name,
    name => kind.hasItemNamed(project, name),
    ''
  );
  const newItem = kind.insertItemFromSerializedContent(
    project,
    newName,
    node.item
  );

  return {
    createdItems: [newItem],
    folderOrItem: moveNewItemToFolder(
      kind,
      project,
      newName,
      parentFolder,
      position
    ),
  };
};

/**
 * Paste the content of the clipboard (items and/or folders, with their
 * content) inside the given folder, at the given position.
 */
export const pasteFolderOrItemsFromClipboard = ({
  kind,
  project,
  destinationFolder,
  positionInFolder,
}: {|
  kind: ProjectItemFoldersKind,
  project: gdProject,
  destinationFolder: ProjectItemFolderOrItem,
  positionInFolder: number,
|}): ?{|
  createdItems: Array<any>,
  topLevelFolderOrItems: Array<ProjectItemFolderOrItem>,
|} => {
  const clipboardContent = getClipboardContent(kind);
  if (!clipboardContent) return null;

  const createdItems: Array<any> = [];
  const topLevelFolderOrItems: Array<ProjectItemFolderOrItem> = [];
  clipboardContent.items.forEach((node, index) => {
    const pastedNode = pasteNode({
      kind,
      node,
      project,
      parentFolder: destinationFolder,
      position: positionInFolder + index,
    });
    createdItems.push(...pastedNode.createdItems);
    topLevelFolderOrItems.push(pastedNode.folderOrItem);
  });

  return { createdItems, topLevelFolderOrItems };
};
