// @flow
import { cleanNonExistingObjectFolderOrObjectWithContexts } from './ObjectFolderOrObjectsSelection';
const gd: libGDevelop = global.gd;

describe('SceneEditor', () => {
  test('cleanNonExistingObjectFolderOrObjectWithContexts', () => {
    const project = gd.ProjectHelper.createNewGDJSProject();
    const globalObjectsContainer = new gd.ObjectsContainer();
    const objectsContainer = new gd.ObjectsContainer();

    const globalRootFolder = globalObjectsContainer.getRootFolder();
    globalObjectsContainer.insertNewObjectInFolder(
      project,
      'Sprite',
      'MySprite',
      globalRootFolder,
      0
    );
    const subFolder = globalObjectsContainer
      .getRootFolder()
      .insertNewFolder('Sub folder', 1);
    globalObjectsContainer.insertNewObjectInFolder(
      project,
      'Sprite',
      'MySprite2',
      subFolder,
      0
    );
    globalObjectsContainer.insertNewObjectInFolder(
      project,
      'Sprite',
      'MySprite3',
      subFolder,
      1
    );

    // The first selection had everything selected.
    const firstSelection = [
      {
        global: true,
        objectFolderOrObject: globalRootFolder.getChildAt(0),
      },
      {
        global: true,
        objectFolderOrObject: subFolder,
      },
      {
        global: true,
        objectFolderOrObject: subFolder.getChildAt(0),
      },
      {
        global: true,
        objectFolderOrObject: subFolder.getChildAt(1),
      },
    ];

    // Remove an object and check we can clean the selection.
    globalObjectsContainer.removeObject('MySprite2');
    expect(
      cleanNonExistingObjectFolderOrObjectWithContexts(
        globalObjectsContainer,
        objectsContainer,
        firstSelection
      )
    ).toEqual([
      {
        global: true,
        objectFolderOrObject: globalRootFolder.getChildAt(0),
      },
      {
        global: true,
        objectFolderOrObject: subFolder,
      },
      {
        global: true,
        objectFolderOrObject: subFolder.getChildAt(0),
      },
    ]);

    // Remove an object and a folder and check we can clean the selection.
    globalObjectsContainer.removeObject('MySprite3');
    globalObjectsContainer.getRootFolder().removeFolderChild(subFolder);
    expect(
      cleanNonExistingObjectFolderOrObjectWithContexts(
        globalObjectsContainer,
        objectsContainer,
        firstSelection
      )
    ).toEqual([
      {
        global: true,
        objectFolderOrObject: globalRootFolder.getChildAt(0),
      },
    ]);

    project.delete();
  });
});
