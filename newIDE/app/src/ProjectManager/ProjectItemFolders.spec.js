// @flow
import {
  type ProjectItemFolderOrItem,
  getFolderOrItemIndex,
  enumerateItemsInFolder,
  getTopLevelFolderOrItems,
  moveFolderOrItemAt,
  dropDescendantsOfRemovedFolders,
  getItemsToDeleteFromSelection,
  removeEmptyFoldersFromSelection,
} from './ProjectItemFolders';
import { removeFolderAndSubFolders } from '../Utils/Folders';

const gd: libGDevelop = global.gd;

describe('ProjectItemFolders', () => {
  const makeProjectWithScenes = (sceneNames: Array<string>) => {
    const project = gd.ProjectHelper.createNewGDJSProject();
    sceneNames.forEach((sceneName, index) =>
      project.insertNewLayout(sceneName, index)
    );
    return project;
  };

  const getChildrenNames = (folder: ProjectItemFolderOrItem): Array<string> => {
    const names = [];
    for (let index = 0; index < folder.getChildrenCount(); index++) {
      const child = folder.getChildAt(index);
      names.push(
        child.isFolder()
          ? `[${child.getFolderName()}]`
          : child.getItem().getName()
      );
    }
    return names;
  };

  it('moves a node in its folder, or in another folder', () => {
    const project = makeProjectWithScenes(['A', 'B', 'C']);
    const rootFolder = project.getLayoutsRootFolder();
    const folder = rootFolder.insertNewFolder('Folder', 3);

    // Moving down: the moved node is not counted in the destination index.
    moveFolderOrItemAt(rootFolder.getItemChild('A'), 2);
    expect(getChildrenNames(rootFolder)).toEqual(['B', 'A', 'C', '[Folder]']);

    moveFolderOrItemAt(rootFolder.getItemChild('C'), 0, folder);
    expect(getChildrenNames(rootFolder)).toEqual(['B', 'A', '[Folder]']);
    expect(getChildrenNames(folder)).toEqual(['C']);
    expect(getFolderOrItemIndex(folder.getItemChild('C'))).toBe(0);

    project.delete();
  });

  it('tells if a folder holds an item, even deep inside', () => {
    const project = makeProjectWithScenes(['A']);
    const rootFolder = project.getLayoutsRootFolder();
    const folder = rootFolder.insertNewFolder('Folder', 1);
    const subFolder = folder.insertNewFolder('SubFolder', 0);

    // Only empty folders: nothing would be moved out by removing it.
    expect(enumerateItemsInFolder(folder)).toHaveLength(0);

    moveFolderOrItemAt(rootFolder.getItemChild('A'), 0, subFolder);
    expect(enumerateItemsInFolder(folder)).toHaveLength(1);

    project.delete();
  });

  it('lists the items of a folder and of its folders', () => {
    const project = makeProjectWithScenes(['A', 'B', 'C']);
    const rootFolder = project.getLayoutsRootFolder();
    const folder = rootFolder.insertNewFolder('Folder', 0);
    const subFolder = folder.insertNewFolder('SubFolder', 0);
    moveFolderOrItemAt(rootFolder.getItemChild('A'), 1, folder);
    moveFolderOrItemAt(rootFolder.getItemChild('B'), 0, subFolder);

    expect(
      enumerateItemsInFolder(folder).map(scene => scene.getName())
    ).toEqual(['B', 'A']);

    project.delete();
  });

  it('removes a folder holding only empty folders', () => {
    const project = makeProjectWithScenes(['A']);
    const rootFolder = project.getLayoutsRootFolder();
    const folder = rootFolder.insertNewFolder('Folder', 1);
    folder.insertNewFolder('SubFolder', 0).insertNewFolder('SubSubFolder', 0);

    removeFolderAndSubFolders(folder);
    expect(getChildrenNames(rootFolder)).toEqual(['A']);

    project.delete();
  });

  it('lists the items to delete, and removes the emptied folders', () => {
    const project = makeProjectWithScenes(['A', 'B', 'C']);
    const rootFolder = project.getLayoutsRootFolder();
    const folder = rootFolder.insertNewFolder('Folder', 3);
    const subFolder = folder.insertNewFolder('SubFolder', 0);
    moveFolderOrItemAt(rootFolder.getItemChild('B'), 0, subFolder);
    const selection = [rootFolder.getItemChild('A'), folder];

    const itemsToDelete = getItemsToDeleteFromSelection(selection);
    expect(itemsToDelete.map(scene => scene.getName())).toEqual(['A', 'B']);

    project.removeLayout('A');
    project.removeLayout('B');
    removeEmptyFoldersFromSelection(selection);
    expect(getChildrenNames(rootFolder)).toEqual(['C']);

    project.delete();
  });

  it('drops the descendants of an explicitly deselected folder', () => {
    const project = makeProjectWithScenes(['A', 'B']);
    const rootFolder = project.getLayoutsRootFolder();
    const folder = rootFolder.insertNewFolder('Folder', 2);
    moveFolderOrItemAt(rootFolder.getItemChild('A'), 0, folder);
    const nodeOfA = folder.getItemChild('A');
    const nodeOfB = rootFolder.getItemChild('B');
    const identity = (node: ProjectItemFolderOrItem) => node;

    expect(
      dropDescendantsOfRemovedFolders([folder], [nodeOfA, nodeOfB], identity)
    ).toEqual([nodeOfB]);
    // Deselecting an item keeps the other nodes.
    expect(
      dropDescendantsOfRemovedFolders([nodeOfB], [nodeOfA], identity)
    ).toEqual([nodeOfA]);

    project.delete();
  });

  it('keeps only the nodes that are not inside another selected folder', () => {
    const project = makeProjectWithScenes(['A', 'B']);
    const rootFolder = project.getLayoutsRootFolder();
    const folder = rootFolder.insertNewFolder('Folder', 2);
    moveFolderOrItemAt(rootFolder.getItemChild('B'), 0, folder);

    const itemB = folder.getItemChild('B');
    const itemA = rootFolder.getItemChild('A');
    expect(getTopLevelFolderOrItems([folder, itemB, itemA])).toEqual([
      folder,
      itemA,
    ]);
    expect(getTopLevelFolderOrItems([])).toEqual([]);

    project.delete();
  });
});
