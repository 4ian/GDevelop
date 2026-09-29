// @flow
import { t } from '@lingui/macro';
import { type I18n as I18nType } from '@lingui/core';
import Clipboard from '../Utils/Clipboard';
import { SafeExtractor } from '../Utils/SafeExtractor';
import {
  serializeToJSObject,
  unserializeFromJSObject,
} from '../Utils/Serializer';
import newNameGenerator from '../Utils/NewNameGenerator';
import { mapFor } from '../Utils/MapFor';

const SCENE_FOLDER_OR_LAYOUTS_CLIPBOARD_KIND = 'SceneFolderOrLayouts';

// Kept for backward compatibility: read (but never written anymore) so that
// a scene copied before this clipboard was introduced (or copied from another
// window/version) can still be pasted.
const LAYOUT_CLIPBOARD_KIND = 'Layout';

type SerializedLayoutNode = {|
  kind: 'layout',
  name: string,
  layout: Object,
|};
type SerializedFolderNode = {|
  kind: 'folder',
  name: string,
  children: Array<SerializedLayoutNode | SerializedFolderNode>,
|};
type SerializedNode = SerializedLayoutNode | SerializedFolderNode;

/**
 * Serialize a node of the scenes folder structure. Folders are described by a
 * plain JS tree (they are not serializable on their own) and only the scenes
 * they contain are actually serialized.
 */
const serializeSceneFolderOrLayoutNode = (
  layoutFolderOrLayout: gdLayoutFolderOrLayout
): SerializedNode => {
  if (layoutFolderOrLayout.isFolder()) {
    return {
      kind: 'folder',
      name: layoutFolderOrLayout.getFolderName(),
      children: mapFor(0, layoutFolderOrLayout.getChildrenCount(), i =>
        serializeSceneFolderOrLayoutNode(layoutFolderOrLayout.getChildAt(i))
      ),
    };
  }
  const layout = layoutFolderOrLayout.getLayout();
  return {
    kind: 'layout',
    name: layout.getName(),
    layout: serializeToJSObject(layout),
  };
};

export const copySceneFolderOrLayoutToClipboard = (
  layoutFolderOrLayout: gdLayoutFolderOrLayout
): void => {
  Clipboard.set(SCENE_FOLDER_OR_LAYOUTS_CLIPBOARD_KIND, {
    items: [serializeSceneFolderOrLayoutNode(layoutFolderOrLayout)],
  });
};

export const hasSceneFolderOrLayoutsInClipboard = (): boolean =>
  Clipboard.has(SCENE_FOLDER_OR_LAYOUTS_CLIPBOARD_KIND) ||
  Clipboard.has(LAYOUT_CLIPBOARD_KIND);

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
  const layout = SafeExtractor.extractObjectProperty(rawNode, 'layout');
  if (!layout) return null;
  return { kind: 'layout', name, layout };
};

/**
 * Read the clipboard content, supporting both the folder-aware format and the
 * legacy single-scene format.
 */
const getSceneFolderOrLayoutsClipboardContent = (): ?{|
  items: Array<SerializedNode>,
|} => {
  if (Clipboard.has(SCENE_FOLDER_OR_LAYOUTS_CLIPBOARD_KIND)) {
    const content = Clipboard.get(SCENE_FOLDER_OR_LAYOUTS_CLIPBOARD_KIND);
    const rawItems = SafeExtractor.extractArrayProperty(content, 'items');
    if (!rawItems) return null;
    const items = rawItems.map(sanitizeNode).filter(Boolean);
    if (items.length === 0) return null;
    return { items };
  }
  if (Clipboard.has(LAYOUT_CLIPBOARD_KIND)) {
    const content = Clipboard.get(LAYOUT_CLIPBOARD_KIND);
    const layout = SafeExtractor.extractObjectProperty(content, 'layout');
    const name = SafeExtractor.extractStringProperty(content, 'name');
    if (!layout || !name) return null;
    return { items: [{ kind: 'layout', name, layout }] };
  }
  return null;
};

/**
 * Returns the localised label for a "Paste" menu item.
 */
export const getPasteMenuLabel = (i18n: I18nType): string => {
  const content = getSceneFolderOrLayoutsClipboardContent();
  if (!content || content.items.length === 0) return i18n._(t`Paste`);
  if (content.items.length === 1)
    return i18n._(t`Paste "${content.items[0].name}"`);
  return i18n._(t`Paste ${content.items.length} items`);
};

const getUniqueFolderName = (
  parentFolder: gdLayoutFolderOrLayout,
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
  node,
  project,
  parentFolder,
  position,
}: {|
  node: SerializedNode,
  project: gdProject,
  parentFolder: gdLayoutFolderOrLayout,
  position: number,
|}): {|
  createdLayouts: Array<gdLayout>,
  layoutFolderOrLayout: gdLayoutFolderOrLayout,
|} => {
  if (node.kind === 'folder') {
    const uniqueFolderName = getUniqueFolderName(parentFolder, node.name);
    const newFolder = parentFolder.insertNewFolder(uniqueFolderName, position);
    const createdLayouts: Array<gdLayout> = [];
    node.children.forEach(childNode => {
      const pastedChild = pasteNode({
        node: childNode,
        project,
        parentFolder: newFolder,
        position: newFolder.getChildrenCount(),
      });
      createdLayouts.push(...pastedChild.createdLayouts);
    });
    return { createdLayouts, layoutFolderOrLayout: newFolder };
  }

  const newName = newNameGenerator(
    node.name,
    name => project.hasLayoutNamed(name),
    ''
  );
  const newLayout = project.insertNewLayoutInFolder(
    newName,
    parentFolder,
    position
  );
  unserializeFromJSObject(newLayout, node.layout, 'unserializeFrom', project);
  // Unserialization has overwritten the name.
  newLayout.setName(newName);
  newLayout.updateBehaviorsSharedData(project);

  return {
    createdLayouts: [newLayout],
    layoutFolderOrLayout: parentFolder.getLayoutChild(newName),
  };
};

/**
 * Paste the content of the clipboard (scenes and/or folders, with their
 * content) inside the given folder, at the given position.
 */
export const pasteSceneFolderOrLayoutsFromClipboard = ({
  project,
  destinationFolder,
  positionInFolder,
}: {|
  project: gdProject,
  destinationFolder: gdLayoutFolderOrLayout,
  positionInFolder: number,
|}): ?{|
  createdLayouts: Array<gdLayout>,
  topLevelLayoutFolderOrLayouts: Array<gdLayoutFolderOrLayout>,
|} => {
  const clipboardContent = getSceneFolderOrLayoutsClipboardContent();
  if (!clipboardContent) return null;

  const createdLayouts: Array<gdLayout> = [];
  const topLevelLayoutFolderOrLayouts: Array<gdLayoutFolderOrLayout> = [];
  clipboardContent.items.forEach((node, index) => {
    const pastedNode = pasteNode({
      node,
      project,
      parentFolder: destinationFolder,
      position: positionInFolder + index,
    });
    createdLayouts.push(...pastedNode.createdLayouts);
    topLevelLayoutFolderOrLayouts.push(pastedNode.layoutFolderOrLayout);
  });

  return { createdLayouts, topLevelLayoutFolderOrLayouts };
};
