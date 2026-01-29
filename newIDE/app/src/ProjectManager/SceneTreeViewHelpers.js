import { t } from '@lingui/macro';
import newNameGenerator from '../Utils/NewNameGenerator';
import { getSceneFolderTreeViewItemId } from './SceneFolderTreeViewItemContent';

export const collectFoldersAndPaths = (
  folder: gdLayoutFolderOrLayout,
  parentPath: string = '',
  result: Array<{ folder: gdLayoutFolderOrLayout, path: string }> = []
): Array<{ folder: gdLayoutFolderOrLayout, path: string }> => {
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
  const childrenCount = parentFolder.getChildrenCount
    ? parentFolder.getChildrenCount()
    : 0;

  for (let i = 0; i < childrenCount; i++) {
    const child = parentFolder.getChildAt(i);
    if (child && child.isFolder && child.isFolder()) {
      if (child.getFolderName && child.getFolderName() === name) {
        return true;
      }
    }
  }

  return false;
};

export const buildMoveToFolderSubmenu = (
  i18n: I18nType,
  project: gdProject,
  currentParent: ?any,
  itemToMove: any,
  onMove: (targetFolder: any) => void,
  onCreateNewFolder: () => void
) => {
  const layoutsRootFolder = project.getLayoutsRootFolder();
  const foldersAndPaths = layoutsRootFolder
    ? collectFoldersAndPaths(layoutsRootFolder)
    : [];

  return [
    {
      label: i18n._(t`Root`),
      enabled: layoutsRootFolder && currentParent !== layoutsRootFolder,
      click: () => {
        if (layoutsRootFolder) {
          onMove(layoutsRootFolder);
        }
      },
    },
    ...foldersAndPaths
      .filter(({ folder }) => {
        if (itemToMove.isFolder && itemToMove.isFolder()) {
          return folder !== itemToMove && !folder.isADescendantOf(itemToMove);
        }
        return true;
      })
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
  itemToMove: any,
  onProjectItemModified: () => void,
  expandFolders: ?(folderIds: string[]) => void,
  editName: ?(itemId: string) => void
): void => {
  const layoutsRootFolder = project.getLayoutsRootFolder();
  if (!layoutsRootFolder) return;

  const newFolderName = newNameGenerator('NewFolder', name => {
    for (let i = 0; i < layoutsRootFolder.getChildrenCount(); i++) {
      const child = layoutsRootFolder.getChildAt(i);
      if (child.isFolder() && child.getFolderName() === name) {
        return true;
      }
    }
    return false;
  });

  const newFolder = layoutsRootFolder.insertNewFolder(newFolderName, 0);

  const currentParent = itemToMove.getParent();
  if (currentParent) {
    currentParent.moveObjectFolderOrObjectToAnotherFolder(
      itemToMove,
      newFolder,
      0
    );
  }

  onProjectItemModified();

  if (expandFolders) {
    expandFolders([getSceneFolderTreeViewItemId(newFolder)]);
  }
  if (editName) {
    setTimeout(() => {
      editName(getSceneFolderTreeViewItemId(newFolder));
    }, 100);
  }
};
