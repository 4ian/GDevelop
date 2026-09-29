// @flow
import {
  getFolderOrItemIndex,
  groupInNewFolder,
  moveFolderOrItemAt,
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

  const getChildrenNames = (folder: gdLayoutFolderOrLayout): Array<string> => {
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

  it('groups nodes in a new folder created where the first one was', () => {
    const project = makeProjectWithScenes(['A', 'B', 'C', 'D']);
    const rootFolder = project.getLayoutsRootFolder();

    const grouping = groupInNewFolder([
      rootFolder.getItemChild('B'),
      rootFolder.getItemChild('D'),
    ]);
    if (!grouping) throw new Error('Nothing was grouped.');

    expect(grouping.parentFolder.isRootFolder()).toBe(true);
    expect(getChildrenNames(rootFolder)).toEqual(['A', '[NewFolder]', 'C']);
    expect(getChildrenNames(grouping.newFolder)).toEqual(['B', 'D']);

    project.delete();
  });

  it('leaves a node inside another grouped node where it is', () => {
    const project = makeProjectWithScenes(['A', 'B']);
    const rootFolder = project.getLayoutsRootFolder();
    const folder = rootFolder.insertNewFolder('Folder', 2);
    moveFolderOrItemAt(rootFolder.getItemChild('B'), 0, folder);

    const grouping = groupInNewFolder([folder, folder.getItemChild('B')]);
    if (!grouping) throw new Error('Nothing was grouped.');

    expect(getChildrenNames(rootFolder)).toEqual(['A', '[NewFolder]']);
    expect(getChildrenNames(grouping.newFolder)).toEqual(['[Folder]']);
    expect(getChildrenNames(folder)).toEqual(['B']);

    expect(groupInNewFolder([])).toBe(null);
    project.delete();
  });
});
