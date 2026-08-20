// @flow
import {
  cleanNonExistingObjectFolderOrObjectWithContexts,
  getObjectFolderOrObjectWithContextFromObjectName,
} from './ObjectFolderOrObjectsSelection';
const gd: libGDevelop = global.gd;

describe('SceneEditor', () => {
  test('cleanNonExistingObjectFolderOrObjectWithContexts', () => {
    const project = gd.ProjectHelper.createNewGDJSProject();
    const globalObjectsContainer = new gd.ObjectsContainer(
      gd.ObjectsContainer.Unknown
    );
    const objectsContainer = new gd.ObjectsContainer(
      gd.ObjectsContainer.Unknown
    );

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

  test('getObjectFolderOrObjectWithContextFromObjectName finds objects in the right container', () => {
    const project = gd.ProjectHelper.createNewGDJSProject();
    const globalObjectsContainer = new gd.ObjectsContainer(
      gd.ObjectsContainer.Unknown
    );
    const objectsContainer = new gd.ObjectsContainer(
      gd.ObjectsContainer.Unknown
    );

    globalObjectsContainer.insertNewObjectInFolder(
      project,
      'Sprite',
      'MyGlobalSprite',
      globalObjectsContainer.getRootFolder(),
      0
    );
    objectsContainer.insertNewObjectInFolder(
      project,
      'Sprite',
      'MySceneSprite',
      objectsContainer.getRootFolder(),
      0
    );

    expect(
      getObjectFolderOrObjectWithContextFromObjectName(
        globalObjectsContainer,
        objectsContainer,
        'MyGlobalSprite'
      )
    ).toEqual({
      global: true,
      objectFolderOrObject: globalObjectsContainer
        .getRootFolder()
        .getChildAt(0),
    });
    expect(
      getObjectFolderOrObjectWithContextFromObjectName(
        globalObjectsContainer,
        objectsContainer,
        'MySceneSprite'
      )
    ).toEqual({
      global: false,
      objectFolderOrObject: objectsContainer.getRootFolder().getChildAt(0),
    });
    expect(
      getObjectFolderOrObjectWithContextFromObjectName(
        globalObjectsContainer,
        objectsContainer,
        'DoesNotExist'
      )
    ).toBe(null);

    project.delete();
  });

  test('cleanNonExistingObjectFolderOrObjectWithContexts keeps a multi-selection spanning several objects and folders intact', () => {
    const project = gd.ProjectHelper.createNewGDJSProject();
    const objectsContainer = new gd.ObjectsContainer(
      gd.ObjectsContainer.Unknown
    );
    const rootFolder = objectsContainer.getRootFolder();

    objectsContainer.insertNewObjectInFolder(
      project,
      'Sprite',
      'ObjectA',
      rootFolder,
      0
    );
    objectsContainer.insertNewObjectInFolder(
      project,
      'Sprite',
      'ObjectB',
      rootFolder,
      1
    );
    const folder = rootFolder.insertNewFolder('SomeFolder', 2);

    const selection = [
      { global: false, objectFolderOrObject: rootFolder.getChildAt(0) },
      { global: false, objectFolderOrObject: rootFolder.getChildAt(1) },
      { global: false, objectFolderOrObject: folder },
    ];

    expect(
      cleanNonExistingObjectFolderOrObjectWithContexts(
        null,
        objectsContainer,
        selection
      )
    ).toEqual(selection);

    project.delete();
  });
});
