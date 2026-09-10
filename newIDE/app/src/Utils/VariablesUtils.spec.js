// @flow
import { makeObjectGroupMergedVariablesContainer } from './VariablesUtils';

const gd: libGDevelop = global.gd;

describe('makeObjectGroupMergedVariablesContainer', () => {
  const setUpProjectWithObjectGroup = () => {
    const project = gd.ProjectHelper.createNewGDJSProject();
    const layout = project.insertNewLayout('Scene', 0);
    const objectsContainer = layout.getObjects();
    const objectA = objectsContainer.insertNewObject(
      project,
      'Sprite',
      'ObjectA',
      0
    );
    const objectB = objectsContainer.insertNewObject(
      project,
      'Sprite',
      'ObjectB',
      1
    );
    const objectGroup = objectsContainer
      .getObjectGroups()
      .insertNew('Group', 0);
    objectGroup.addObject('ObjectA');
    objectGroup.addObject('ObjectB');

    const makeMergedVariablesContainer = () =>
      makeObjectGroupMergedVariablesContainer(
        gd.ObjectsContainersList.makeNewObjectsContainersListForProjectAndLayout(
          project,
          layout
        ),
        objectGroup
      );

    return { project, objectA, objectB, makeMergedVariablesContainer };
  };

  it('returns a new, caller-owned container at each call (never a shared instance)', () => {
    const {
      project,
      objectA,
      objectB,
      makeMergedVariablesContainer,
    } = setUpProjectWithObjectGroup();
    objectA
      .getVariables()
      .insertNew('Health', 0)
      .setValue(100);
    objectB
      .getVariables()
      .insertNew('Health', 0)
      .setValue(100);

    const container1 = makeMergedVariablesContainer();
    const container2 = makeMergedVariablesContainer();
    expect(container1.ptr).not.toBe(container2.ptr);

    // A mutation of one container (or a new merge) does not affect the other.
    container2.remove('Health');
    const container3 = makeMergedVariablesContainer();
    expect(container1.has('Health')).toBe(true);
    expect(container3.has('Health')).toBe(true);

    container1.delete();
    container2.delete();
    container3.delete();
    project.delete();
  });

  it('keeps the intersection of variables, with mixed values markers and persistent UUIDs', () => {
    const {
      project,
      objectA,
      objectB,
      makeMergedVariablesContainer,
    } = setUpProjectWithObjectGroup();
    objectA
      .getVariables()
      .insertNew('Health', 0)
      .setValue(100);
    objectB
      .getVariables()
      .insertNew('Health', 0)
      .setValue(50);
    objectA
      .getVariables()
      .insertNew('OnlyOnA', 1)
      .setValue(1);
    objectA.getVariables().ensurePersistentUuids();
    objectB.getVariables().ensurePersistentUuids();

    const mergedVariablesContainer = makeMergedVariablesContainer();

    // Only the common variables are kept.
    expect(mergedVariablesContainer.has('Health')).toBe(true);
    expect(mergedVariablesContainer.has('OnlyOnA')).toBe(false);

    // Different values are marked as "mixed" (an editor-only marker).
    expect(mergedVariablesContainer.get('Health').hasMixedValues()).toBe(true);

    // The persistent UUIDs of the first object variables are kept, so that
    // refactoring changesets can be computed against them.
    expect(mergedVariablesContainer.get('Health').getPersistentUuid()).toBe(
      objectA
        .getVariables()
        .get('Health')
        .getPersistentUuid()
    );

    mergedVariablesContainer.delete();
    project.delete();
  });
});
