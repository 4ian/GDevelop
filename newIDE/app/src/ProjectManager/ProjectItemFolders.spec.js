// @flow
import {
  type ProjectItemFolderOrItem,
  getFolderOrItemIndex,
  enumerateItemsInFolder,
  getTopLevelFolderOrItems,
  moveFolderOrItemAt,
  removeFolderWithoutItems,
} from './ProjectItemFolders';

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

    removeFolderWithoutItems(folder);
    expect(getChildrenNames(rootFolder)).toEqual(['A']);

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
