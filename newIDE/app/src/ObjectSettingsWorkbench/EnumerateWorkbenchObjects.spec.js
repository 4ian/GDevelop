// @flow
import { makeTestProject } from '../fixtures/TestProject';
import {
  serializeToJSObject,
  unserializeFromJSObject,
} from '../Utils/Serializer';
import {
  enumerateWorkbenchObjects,
  filterWorkbenchObjects,
} from './EnumerateWorkbenchObjects';

const gd: libGDevelop = global.gd;

describe('Object Settings workbench object enumeration', () => {
  it('keeps scene/global ownership and excludes prefab children', () => {
    const { project, testLayout } = makeTestProject(gd);
    const objects = enumerateWorkbenchObjects(project);

    expect(objects.slice(0, testLayout.getObjects().getObjectsCount())).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ scope: 'scene', ownerName: 'TestLayout' }),
      ])
    );
    expect(objects.filter(item => item.scope === 'global')).toHaveLength(2);
    expect(objects.some(item => item.scope === 'prefab')).toBe(false);
  });

  it('omits a global definition shadowed in any scene', () => {
    const { project, emptyLayout } = makeTestProject(gd);
    emptyLayout
      .getObjects()
      .insertNewObject(project, 'TextObject::Text', 'GlobalTextObject', 0);

    const matchingObjects = enumerateWorkbenchObjects(project).filter(
      item => item.object.getName() === 'GlobalTextObject'
    );

    expect(matchingObjects).toHaveLength(1);
    expect(matchingObjects[0].scope).toBe('scene');
    expect(matchingObjects[0].ownerName).toBe(emptyLayout.getName());
  });

  it('searches names, types, origins and owners case-insensitively', () => {
    const { project } = makeTestProject(gd);
    const objects = enumerateWorkbenchObjects(project);

    expect(
      filterWorkbenchObjects({ project, objects, query: 'GLOBAL' }).every(
        item => item.scope === 'global'
      )
    ).toBe(true);
    expect(
      filterWorkbenchObjects({ project, objects, query: 'testlayout' }).every(
        item => item.scope === 'scene'
      )
    ).toBe(true);
    expect(
      filterWorkbenchObjects({ project, objects, query: 'panelspritebutton' })
        .length
    ).toBeGreaterThan(0);
    expect(
      filterWorkbenchObjects({ project, objects, query: 'prefab' })
    ).toHaveLength(0);
  });

  it('uses a stable key to resolve a fresh wrapper after an object is replaced', () => {
    const { project, testLayout } = makeTestProject(gd);
    const originalItem = enumerateWorkbenchObjects(project).find(
      item => item.scope === 'scene' && item.layout === testLayout
    );
    if (!originalItem) throw new Error('Expected a scene object in the fixture.');

    const originalKey = originalItem.key;
    const { objectName, objectType } = originalItem;
    const objects = testLayout.getObjects();
    objects.removeObject(objectName);
    expect(() => serializeToJSObject(originalItem.object)).toThrow();

    objects.insertNewObject(project, objectType, objectName, 0);
    const replacementItem = enumerateWorkbenchObjects(project).find(
      item => item.key === originalKey
    );
    expect(replacementItem).toBeDefined();
    if (!replacementItem) throw new Error('Expected a replacement object.');
    expect(() => serializeToJSObject(replacementItem.object)).not.toThrow();
  });

  it('resolves a behavior again by name after an object refresh destroys its wrapper', () => {
    const { project, testLayout } = makeTestProject(gd);
    const objects = testLayout.getObjects();
    const object = objects.insertNewObject(
      project,
      'Sprite',
      'BehaviorOwner',
      objects.getObjectsCount()
    );
    const behavior = object.addNewBehavior(
      project,
      'PlatformBehavior::PlatformerObjectBehavior',
      'PlatformerObject'
    );
    if (!behavior) throw new Error('Expected the behavior to be created.');

    const behaviorName = behavior.getName();
    const serializedObject = serializeToJSObject(object);
    unserializeFromJSObject(
      object,
      serializedObject,
      'unserializeFrom',
      project
    );

    expect(() => behavior.getName()).toThrow();
    const refreshedBehavior = object.getBehavior(behaviorName);
    expect(refreshedBehavior.getName()).toBe(behaviorName);
    expect(() => refreshedBehavior.getProperties()).not.toThrow();
  });
});
