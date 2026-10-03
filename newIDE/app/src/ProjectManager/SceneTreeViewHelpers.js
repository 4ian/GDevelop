// @flow
import { type I18n as I18nType } from '@lingui/core';
import { t } from '@lingui/macro';
import { type MenuItemTemplate } from '../UI/Menu/Menu.flow';
import { enumerateSceneFoldersInProject } from './EnumerateSceneFolders';

/**
 * Build the "Move to folder" submenu of a scene or of a scenes folder, in the
 * same way the objects list does it for objects and object folders.
 *
 * `itemToMove` and its own children are filtered out of the destinations, as a
 * folder can't be moved inside itself.
 */
export const buildMoveToFolderSubmenu = (
  i18n: I18nType,
  project: gdProject,
  itemToMove: gdLayoutFolderOrLayout,
  onMoved: () => void,
  onAddFolder: () => void
): Array<MenuItemTemplate> => {
  const foldersAndPaths = enumerateSceneFoldersInProject(project);
  foldersAndPaths.unshift({
    path: i18n._(t`Root folder`),
    folder: project.getLayoutsRootFolder(),
  });

  const currentParent = itemToMove.getParent();
  const filteredFoldersAndPaths = foldersAndPaths.filter(
    folderAndPath =>
      !folderAndPath.folder.isADescendantOf(itemToMove) &&
      folderAndPath.folder !== itemToMove
  );

  return [
    ...filteredFoldersAndPaths.map(({ folder, path }) => ({
      label: path,
      enabled: folder !== currentParent,
      click: () => {
        if (folder === currentParent) return;
        currentParent.moveLayoutFolderOrLayoutToAnotherFolder(
          itemToMove,
          folder,
          0
        );
        onMoved();
      },
    })),
    { type: 'separator' },
    {
      label: i18n._(t`Create new folder...`),
      click: onAddFolder,
    },
  ];
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
