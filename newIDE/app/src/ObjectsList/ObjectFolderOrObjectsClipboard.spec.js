// @flow
import Clipboard from '../Utils/Clipboard';
import { serializeToJSObject } from '../Utils/Serializer';
import {
  getSelectionTopLevelNodes,
  getObjectsToDeleteFromSelection,
  removeEmptyFoldersFromSelection,
  enumerateAllChildrenInFolder,
  enumerateAllChildrenInFolderMatchingSearch,
  isSelectableWhileSearching,
  dropDescendantsOfRemovedFolders,
} from './EnumerateObjectFolderOrObject';
import {
  copyObjectFolderOrObjectsToClipboard,
  hasObjectFolderOrObjectsInClipboard,
  pasteObjectFolderOrObjectsFromClipboard,
  getObjectFolderOrObjectsClipboardObjectTypes,
  getObjectFolderOrObjectsClipboardSummaryName,
  OBJECT_FOLDER_OR_OBJECTS_CLIPBOARD_KIND,
  OBJECT_CLIPBOARD_KIND,
} from './ObjectFolderOrObjectsClipboard';
import {
  duplicateObjectFolderOrObjects,
  duplicateObjectFolderOrObjectsInPlace,
} from './ObjectFolderOrObjectsDuplicate';
import { makeFakeI18n } from '../EditorFunctions/TestHelpers';

const gd: libGDevelop = global.gd;

describe('ObjectFolderOrObjectsClipboard', () => {
  beforeEach(() => {
    Clipboard.set(OBJECT_FOLDER_OR_OBJECTS_CLIPBOARD_KIND, null);
    Clipboard.set(OBJECT_CLIPBOARD_KIND, null);
  });

  const makeProjectWithObjects = () => {
    const project = gd.ProjectHelper.createNewGDJSProject();
    const globalObjectsContainer = new gd.ObjectsContainer(
      gd.ObjectsContainer.Unknown
    );
    const objectsContainer = new gd.ObjectsContainer(
      gd.ObjectsContainer.Unknown
    );
    const rootFolder = objectsContainer.getRootFolder();

    objectsContainer.insertNewObjectInFolder(
      project,
      'Sprite',
      'MySprite',
      rootFolder,
      0
    );
    const subFolder = rootFolder.insertNewFolder('MyFolder', 1);
    objectsContainer.insertNewObjectInFolder(
      project,
      'Sprite',
      'MySpriteInFolder',
      subFolder,
      0
    );

    return {
      project,
      globalObjectsContainer,
      objectsContainer,
      rootFolder,
      subFolder,
    };
  };

  test('getSelectionTopLevelNodes filters out descendants of selected folders', () => {
    const {
      project,
      objectsContainer,
      rootFolder,
      subFolder,
    } = makeProjectWithObjects();
    const objectInFolder = subFolder.getChildAt(0);

    const topLevelNodes = getSelectionTopLevelNodes([
      { global: false, objectFolderOrObject: subFolder },
      { global: false, objectFolderOrObject: objectInFolder },
      { global: false, objectFolderOrObject: rootFolder.getChildAt(0) },
    ]);

    expect(topLevelNodes).toEqual([
      { global: false, objectFolderOrObject: subFolder },
      { global: false, objectFolderOrObject: rootFolder.getChildAt(0) },
    ]);

    const nestedFolder = subFolder.insertNewFolder('NestedFolder', 1);
    objectsContainer.insertNewObjectInFolder(
      project,
      'Sprite',
      'DeepSprite',
      nestedFolder,
      0
    );
    const nestedObject = nestedFolder.getChildAt(0);
    const topLevelWithNesting = getSelectionTopLevelNodes([
      { global: false, objectFolderOrObject: subFolder },
      { global: false, objectFolderOrObject: nestedFolder },
      { global: false, objectFolderOrObject: nestedObject },
      { global: false, objectFolderOrObject: rootFolder.getChildAt(0) },
    ]);
    expect(topLevelWithNesting).toEqual([
      { global: false, objectFolderOrObject: subFolder },
      { global: false, objectFolderOrObject: rootFolder.getChildAt(0) },
    ]);

    project.delete();
  });

  test('enumerateAllChildrenInFolderMatchingSearch follows the list search filter', () => {
    const { project, objectsContainer, rootFolder } = makeProjectWithObjects();
    objectsContainer.insertNewObjectInFolder(
      project,
      'Sprite',
      'Enemy1',
      rootFolder,
      2
    );
    const enemiesFolder = rootFolder.insertNewFolder('Enemies', 3);
    objectsContainer.insertNewObjectInFolder(
      project,
      'Sprite',
      'EnemyBoss',
      enemiesFolder,
      0
    );
    objectsContainer.insertNewObjectInFolder(
      project,
      'Sprite',
      'Wall',
      enemiesFolder,
      1
    );

    const allNames = enumerateAllChildrenInFolder(rootFolder).map(item =>
      item.isFolder() ? item.getFolderName() : item.getObject().getName()
    );
    expect(allNames).toEqual([
      'MySprite',
      'MyFolder',
      'MySpriteInFolder',
      'Enemy1',
      'Enemies',
      'EnemyBoss',
      'Wall',
    ]);

    expect(
      enumerateAllChildrenInFolderMatchingSearch(rootFolder, '').map(item =>
        item.isFolder() ? item.getFolderName() : item.getObject().getName()
      )
    ).toEqual(allNames);

    expect(
      enumerateAllChildrenInFolderMatchingSearch(rootFolder, 'enemy').map(
        item =>
          item.isFolder() ? item.getFolderName() : item.getObject().getName()
      )
    ).toEqual(['Enemy1', 'EnemyBoss']);

    expect(isSelectableWhileSearching(enemiesFolder, 'enemy')).toBe(false);
    expect(
      isSelectableWhileSearching(enemiesFolder.getChildAt(0), 'enemy')
    ).toBe(true);

    project.delete();
  });

  test('dropDescendantsOfRemovedFolders clears children left behind after deselecting a folder', () => {
    const { project, rootFolder, subFolder } = makeProjectWithObjects();
    const objectInFolder = subFolder.getChildAt(0);
    const sibling = rootFolder.getChildAt(0);

    const nextAfterDeselectingFolder = [
      { global: false, objectFolderOrObject: objectInFolder },
      { global: false, objectFolderOrObject: sibling },
    ];

    // Ctrl+click deselected the folder: its still-selected child is dropped.
    expect(
      dropDescendantsOfRemovedFolders([subFolder], nextAfterDeselectingFolder)
    ).toEqual([{ global: false, objectFolderOrObject: sibling }]);

    // A plain click on the child of a selected folder is not a toggle-off
    // gesture (no removed items): the clicked child stays selected.
    expect(
      dropDescendantsOfRemovedFolders(
        [],
        [{ global: false, objectFolderOrObject: objectInFolder }]
      )
    ).toEqual([{ global: false, objectFolderOrObject: objectInFolder }]);

    // Deselecting a plain object never drops anything.
    expect(
      dropDescendantsOfRemovedFolders([sibling], nextAfterDeselectingFolder)
    ).toEqual(nextAfterDeselectingFolder);

    project.delete();
  });

  test('copy then paste a folder with its content, giving unique names', () => {
    const {
      project,
      globalObjectsContainer,
      objectsContainer,
      rootFolder,
      subFolder,
    } = makeProjectWithObjects();

    copyObjectFolderOrObjectsToClipboard([
      { global: false, objectFolderOrObject: subFolder },
    ]);
    expect(hasObjectFolderOrObjectsInClipboard()).toBe(true);
    expect(getObjectFolderOrObjectsClipboardSummaryName(makeFakeI18n())).toBe(
      'MyFolder'
    );
    expect(getObjectFolderOrObjectsClipboardObjectTypes()).toEqual(['Sprite']);

    const pastedContent = pasteObjectFolderOrObjectsFromClipboard({
      project,
      globalObjectsContainer,
      objectsContainer,
      global: false,
      destinationFolder: rootFolder,
      positionInFolder: rootFolder.getChildrenCount(),
    });

    expect(pastedContent).not.toBe(null);
    if (!pastedContent) throw new Error('unreachable');
    expect(pastedContent.createdObjects).toHaveLength(1);
    expect(pastedContent.topLevelObjectFolderOrObjects).toHaveLength(1);

    const pastedFolder = pastedContent.topLevelObjectFolderOrObjects[0];
    expect(pastedFolder.isFolder()).toBe(true);
    // A sibling folder already named "MyFolder" exists, so the pasted one
    // must get a unique name.
    expect(pastedFolder.getFolderName()).not.toBe('MyFolder');
    expect(pastedFolder.getChildrenCount()).toBe(1);
    // The pasted object must keep a unique name too, distinct from the
    // original "MySpriteInFolder".
    expect(objectsContainer.hasObjectNamed('MySpriteInFolder')).toBe(true);
    expect(objectsContainer.getObjectsCount()).toBe(3);

    project.delete();
  });

  test('backward compatibility with the legacy single-object clipboard kind', () => {
    const {
      project,
      globalObjectsContainer,
      objectsContainer,
      rootFolder,
    } = makeProjectWithObjects();

    const object = objectsContainer.getObject('MySprite');
    Clipboard.set(OBJECT_CLIPBOARD_KIND, {
      name: object.getName(),
      type: object.getType(),
      object: serializeToJSObject(object),
    });

    expect(hasObjectFolderOrObjectsInClipboard()).toBe(true);
    expect(Clipboard.has(OBJECT_FOLDER_OR_OBJECTS_CLIPBOARD_KIND)).toBe(false);

    const pastedContent = pasteObjectFolderOrObjectsFromClipboard({
      project,
      globalObjectsContainer,
      objectsContainer,
      global: false,
      destinationFolder: rootFolder,
      positionInFolder: rootFolder.getChildrenCount(),
    });

    expect(pastedContent).not.toBe(null);
    if (!pastedContent) throw new Error('unreachable');
    expect(pastedContent.createdObjects).toHaveLength(1);

    project.delete();
  });

  test('duplicateObjectFolderOrObjects creates independent copies without touching the clipboard', () => {
    const {
      project,
      globalObjectsContainer,
      objectsContainer,
      rootFolder,
    } = makeProjectWithObjects();

    const objectItem = {
      global: false,
      objectFolderOrObject: rootFolder.getChildAt(0),
    };

    const clipboardSummaryBefore = getObjectFolderOrObjectsClipboardSummaryName(
      makeFakeI18n()
    );

    const duplicatedContent = duplicateObjectFolderOrObjects({
      project,
      globalObjectsContainer,
      objectsContainer,
      items: [objectItem],
      destinationFolder: rootFolder,
      positionInFolder: 1,
    });

    expect(duplicatedContent).not.toBe(null);
    if (!duplicatedContent) throw new Error('unreachable');
    expect(duplicatedContent.createdObjects).toHaveLength(1);
    expect(objectsContainer.getObjectsCount()).toBe(3);
    // Duplication must not read from nor write to the OS clipboard.
    expect(getObjectFolderOrObjectsClipboardSummaryName(makeFakeI18n())).toBe(
      clipboardSummaryBefore
    );

    project.delete();
  });

  test('duplicateObjectFolderOrObjectsInPlace inserts each copy after its original sibling', () => {
    const project = gd.ProjectHelper.createNewGDJSProject();
    const globalObjectsContainer = new gd.ObjectsContainer(
      gd.ObjectsContainer.Unknown
    );
    const objectsContainer = new gd.ObjectsContainer(
      gd.ObjectsContainer.Unknown
    );
    const rootFolder = objectsContainer.getRootFolder();
    ['A', 'B', 'C'].forEach((name, index) => {
      objectsContainer.insertNewObjectInFolder(
        project,
        'Sprite',
        name,
        rootFolder,
        index
      );
    });

    const result = duplicateObjectFolderOrObjectsInPlace({
      project,
      globalObjectsContainer,
      objectsContainer,
      items: [
        { global: false, objectFolderOrObject: rootFolder.getChildAt(0) },
        { global: false, objectFolderOrObject: rootFolder.getChildAt(1) },
      ],
    });

    expect(result).not.toBe(null);
    if (!result) throw new Error('unreachable');
    expect(
      Array.from({ length: rootFolder.getChildrenCount() }, (_, i) => {
        const child = rootFolder.getChildAt(i);
        return child.isFolder()
          ? child.getFolderName()
          : child.getObject().getName();
      })
    ).toEqual(['A', 'A2', 'B', 'B2', 'C']);

    project.delete();
  });

  test('getObjectsToDeleteFromSelection and removeEmptyFoldersFromSelection handle nested folders bottom-up', () => {
    const {
      project,
      objectsContainer,
      rootFolder,
      subFolder,
    } = makeProjectWithObjects();

    const nestedFolder = subFolder.insertNewFolder('NestedFolder', 1);

    const objectsToDelete = getObjectsToDeleteFromSelection([subFolder]);
    expect(objectsToDelete.map(object => object.getName())).toEqual([
      'MySpriteInFolder',
    ]);

    objectsContainer.removeObject('MySpriteInFolder');
    expect(subFolder.getChildrenCount()).toBe(1);
    expect(nestedFolder.getChildrenCount()).toBe(0);

    removeEmptyFoldersFromSelection([subFolder]);

    expect(rootFolder.getChildrenCount()).toBe(1);
    expect(rootFolder.getChildAt(0).isFolder()).toBe(false);

    project.delete();
  });

  test('removeEmptyFoldersFromSelection does not crash when some top-level selected items are plain objects already removed from the container', () => {
    // Regression test: bulk-deleting a selection made of several plain
    // objects (no folders at all) used to throw a UseAfterFreeError, because
    // `collectFoldersBottomUp` called `isFolder()` on objects that had
    // already been removed from the container (their wrapper is dead).
    const { project, objectsContainer, rootFolder } = makeProjectWithObjects();

    const topLevelObjectFolderOrObjects = [
      rootFolder.getChildAt(0), // 'MySprite', a plain object.
    ];

    objectsContainer.removeObject('MySprite');

    expect(() =>
      removeEmptyFoldersFromSelection(topLevelObjectFolderOrObjects)
    ).not.toThrow();

    project.delete();
  });
});
