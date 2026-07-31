// @flow
import { type I18n as I18nType } from '@lingui/core';
import { t } from '@lingui/macro';
import newNameGenerator from '../Utils/NewNameGenerator';
import { getSceneFolderTreeViewItemId } from './SceneFolderTreeViewItemContent';

/**
 * List all the folders of the scenes folder structure, with the path used to
 * display them in the "Move to folder" menus.
 */
export const collectFoldersAndPaths = (
  folder: gdLayoutFolderOrLayout,
  parentPath: string = '',
  result: Array<{| folder: gdLayoutFolderOrLayout, path: string |}> = []
): Array<{| folder: gdLayoutFolderOrLayout, path: string |}> => {
  for (let i = 0; i < folder.getChildrenCount(); i++) {
    const child = folder.getChildAt(i);
    if (child.isFolder()) {
      const folderName = child.getFolderName();
      const path = parentPath ? `${parentPath}/${folderName}` : folderName;
      result.push({ folder: child, path });
      collectFoldersAndPaths(child, path, result);
    }
  }
  return result;
};

export const hasFolderNamed = (
  parentFolder: gdLayoutFolderOrLayout,
  name: string
): boolean => {
  for (let i = 0; i < parentFolder.getChildrenCount(); i++) {
    const child = parentFolder.getChildAt(i);
    if (child.isFolder() && child.getFolderName() === name) {
      return true;
    }
  }
  return false;
};

/**
 * Move the scene with the given name, that was just added at the root of the
 * folder structure by `gd.Project::insertNewLayout`, into the given folder.
 */
export const moveNewSceneToFolder = (
  project: gdProject,
  sceneName: string,
  parentFolder: gdLayoutFolderOrLayout,
  position: number
): void => {
  const layoutsRootFolder = project.getLayoutsRootFolder();
  if (parentFolder === layoutsRootFolder) return;

  const sceneInRootFolder = layoutsRootFolder.getLayoutChild(sceneName);
  layoutsRootFolder.moveLayoutFolderOrLayoutToAnotherFolder(
    sceneInRootFolder,
    parentFolder,
    position
  );
};

export const buildMoveToFolderSubmenu = (
  i18n: I18nType,
  project: gdProject,
  currentParent: ?gdLayoutFolderOrLayout,
  itemToMove: gdLayoutFolderOrLayout,
  onMove: (targetFolder: gdLayoutFolderOrLayout) => void,
  onCreateNewFolder: () => void
): Array<any> => {
  const layoutsRootFolder = project.getLayoutsRootFolder();
  const foldersAndPaths = collectFoldersAndPaths(layoutsRootFolder);

  return [
    {
      label: i18n._(t`Root`),
      enabled: currentParent !== layoutsRootFolder,
      click: () => onMove(layoutsRootFolder),
    },
    ...foldersAndPaths
      // A folder can't be moved inside itself or inside one of its children.
      .filter(
        ({ folder }) =>
          !itemToMove.isFolder() ||
          (folder !== itemToMove && !folder.isADescendantOf(itemToMove))
      )
      .map(({ folder, path }) => ({
        label: path,
        enabled: folder !== currentParent,
        click: () => onMove(folder),
      })),
    { type: 'separator' },
    {
      label: i18n._(t`Create new folder...`),
      click: onCreateNewFolder,
    },
  ];
};

export const createNewFolderAndMoveItem = (
  project: gdProject,
  itemToMove: gdLayoutFolderOrLayout,
  onProjectItemModified: () => void,
  expandFolders: (folderIds: Array<string>) => void,
  editName: (itemId: string) => void
): void => {
  const layoutsRootFolder = project.getLayoutsRootFolder();

  const newFolderName = newNameGenerator('NewFolder', name =>
    hasFolderNamed(layoutsRootFolder, name)
  );
  const newFolder = layoutsRootFolder.insertNewFolder(newFolderName, 0);

  itemToMove
    .getParent()
    .moveLayoutFolderOrLayoutToAnotherFolder(itemToMove, newFolder, 0);

  onProjectItemModified();
  expandFolders([getSceneFolderTreeViewItemId(newFolder)]);

  // The item is only rendered after the tree view is refreshed, so wait for
  // the next render before starting to edit its name.
  setTimeout(() => {
    editName(getSceneFolderTreeViewItemId(newFolder));
  }, 100);
};
