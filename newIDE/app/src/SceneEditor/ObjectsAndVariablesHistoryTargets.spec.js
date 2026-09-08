// @flow
import {
  getVariablesContainerHistoryTarget as _getVariablesContainerHistoryTarget,
  getObjectsContainerHistoryTarget as _getObjectsContainerHistoryTarget,
  getObjectGroupsContainerHistoryTarget as _getObjectGroupsContainerHistoryTarget,
} from './ObjectsAndVariablesHistoryTargets';
import { type CompositeTarget } from '../Utils/History';

const gd: libGDevelop = global.gd;

const noopEnsurePersistentUuids = (object: gdObject) => {};

// getValue/setValue are optional in the general CompositeTarget type (some
// targets use `serializableObject` instead) - these three always provide
// them, so narrow the type once here for the whole test file.
type ValueTarget = {|
  getValue: () => Object,
  setValue: (value: Object) => void,
|};
const asValueTarget = (target: CompositeTarget): ValueTarget => {
  const { getValue, setValue } = target;
  if (!getValue || !setValue) throw new Error('Expected a value-based target.');
  return { getValue, setValue };
};
const getVariablesContainerHistoryTarget = (
  variablesContainer: gdVariablesContainer
): ValueTarget =>
  asValueTarget(_getVariablesContainerHistoryTarget(variablesContainer));
const getObjectsContainerHistoryTarget = (
  objectsContainer: gdObjectsContainer,
  project: gdProject,
  ensurePersistentUuidsOfObject: (object: gdObject) => void
): ValueTarget =>
  asValueTarget(
    _getObjectsContainerHistoryTarget(
      objectsContainer,
      project,
      ensurePersistentUuidsOfObject
    )
  );
const getObjectGroupsContainerHistoryTarget = (
  objectGroupsContainer: gdObjectGroupsContainer
): ValueTarget =>
  asValueTarget(_getObjectGroupsContainerHistoryTarget(objectGroupsContainer));

describe('getObjectsContainerHistoryTarget', () => {
  const makeProject = () => {
    // $FlowFixMe[invalid-constructor]
    const project = new gd.ProjectHelper.createNewGDJSProject();
    const layout = project.insertNewLayout('Scene', 0);
    return { project, layout, objectsContainer: layout.getObjects() };
  };

  it('undoes and redoes the creation of an object, restoring its exact content', () => {
    const { project, objectsContainer } = makeProject();
    const target = getObjectsContainerHistoryTarget(
      objectsContainer,
      project,
      noopEnsurePersistentUuids
    );

    const before = target.getValue();
    const newObject = objectsContainer.insertNewObject(
      project,
      'Sprite',
      'Enemy',
      0
    );
    newObject
      .getVariables()
      .insertNew('Health', 0)
      .setValue(5);
    const after = target.getValue();

    target.setValue(before);
    expect(objectsContainer.hasObjectNamed('Enemy')).toBe(false);

    target.setValue(after);
    expect(objectsContainer.hasObjectNamed('Enemy')).toBe(true);
    expect(
      objectsContainer
        .getObject('Enemy')
        .getVariables()
        .get('Health')
        .getValue()
    ).toBe(5);

    project.delete();
  });

  it('never destroys and recreates an object unrelated to the step being undone/redone', () => {
    const { project, objectsContainer } = makeProject();
    const player = objectsContainer.insertNewObject(
      project,
      'Sprite',
      'Player',
      0
    );
    player
      .getVariables()
      .insertNew('Life', 0)
      .setValue(3);

    const target = getObjectsContainerHistoryTarget(
      objectsContainer,
      project,
      noopEnsurePersistentUuids
    );
    const before = target.getValue();

    const removedNames = [];
    const originalRemoveObject = objectsContainer.removeObject.bind(
      objectsContainer
    );
    objectsContainer.removeObject = (name: string) => {
      removedNames.push(name);
      originalRemoveObject(name);
    };

    objectsContainer.insertNewObject(project, 'Sprite', 'Enemy', 1);
    const after = target.getValue();
    target.setValue(before);
    target.setValue(after);

    expect(removedNames).not.toContain('Player');
    // Player's own identity, and its variable's, must be untouched -
    // otherwise any other open scene tab using this (global) object would
    // be left with dangling references.
    expect(objectsContainer.getObject('Player').ptr).toBe(player.ptr);
    expect(
      objectsContainer
        .getObject('Player')
        .getVariables()
        .get('Life').ptr
    ).toBe(player.getVariables().get('Life').ptr);

    project.delete();
  });

  it('updates an existing object in place (same underlying object) when its content changed', () => {
    const { project, objectsContainer } = makeProject();
    const player = objectsContainer.insertNewObject(
      project,
      'Sprite',
      'Player',
      0
    );
    const target = getObjectsContainerHistoryTarget(
      objectsContainer,
      project,
      noopEnsurePersistentUuids
    );
    const before = target.getValue();

    player
      .getVariables()
      .insertNew('Life', 0)
      .setValue(3);
    const after = target.getValue();

    target.setValue(before);
    expect(
      objectsContainer
        .getObject('Player')
        .getVariables()
        .has('Life')
    ).toBe(false);
    expect(objectsContainer.getObject('Player').ptr).toBe(player.ptr);

    target.setValue(after);
    expect(
      objectsContainer
        .getObject('Player')
        .getVariables()
        .get('Life')
        .getValue()
    ).toBe(3);
    expect(objectsContainer.getObject('Player').ptr).toBe(player.ptr);

    project.delete();
  });

  it('restores the folder structure', () => {
    const { project, objectsContainer } = makeProject();
    const target = getObjectsContainerHistoryTarget(
      objectsContainer,
      project,
      noopEnsurePersistentUuids
    );
    const before = target.getValue();

    const folder = objectsContainer
      .getRootFolder()
      .insertNewFolder('Enemies', 0);
    objectsContainer.insertNewObjectInFolder(
      project,
      'Sprite',
      'Enemy',
      folder,
      0
    );
    const after = target.getValue();

    target.setValue(before);
    expect(objectsContainer.getRootFolder().getChildrenCount()).toBe(0);

    target.setValue(after);
    expect(objectsContainer.getRootFolder().getChildrenCount()).toBe(1);
    expect(
      objectsContainer
        .getRootFolder()
        .getChildAt(0)
        .getChildAt(0)
        .getObject()
        .getName()
    ).toBe('Enemy');

    project.delete();
  });
});

describe('getObjectGroupsContainerHistoryTarget', () => {
  const makeContainer = () => {
    // $FlowFixMe[invalid-constructor]
    const project = new gd.ProjectHelper.createNewGDJSProject();
    const layout = project.insertNewLayout('Scene', 0);
    const objectsContainer = layout.getObjects();
    objectsContainer.insertNewObject(project, 'Sprite', 'Player', 0);
    objectsContainer.insertNewObject(project, 'Sprite', 'Enemy', 1);
    return {
      project,
      objectGroupsContainer: objectsContainer.getObjectGroups(),
    };
  };

  it('undoes and redoes the creation of a group', () => {
    const { project, objectGroupsContainer } = makeContainer();
    const target = getObjectGroupsContainerHistoryTarget(objectGroupsContainer);
    const before = target.getValue();

    const group = objectGroupsContainer.insertNew('Everyone', 0);
    group.addObject('Player');
    const after = target.getValue();

    target.setValue(before);
    expect(objectGroupsContainer.has('Everyone')).toBe(false);

    target.setValue(after);
    expect(objectGroupsContainer.has('Everyone')).toBe(true);
    expect(objectGroupsContainer.get('Everyone').find('Player')).toBe(true);

    project.delete();
  });

  it('never destroys and recreates a group unrelated to the step being undone/redone', () => {
    const { project, objectGroupsContainer } = makeContainer();
    const untouchedGroup = objectGroupsContainer.insertNew('Untouched', 0);
    untouchedGroup.addObject('Player');
    const target = getObjectGroupsContainerHistoryTarget(objectGroupsContainer);
    const before = target.getValue();

    objectGroupsContainer.insertNew('Everyone', 1);
    const after = target.getValue();
    target.setValue(before);
    target.setValue(after);

    expect(objectGroupsContainer.get('Untouched').ptr).toBe(untouchedGroup.ptr);
    expect(objectGroupsContainer.get('Untouched').find('Player')).toBe(true);

    project.delete();
  });

  it('updates a group in place (same underlying object) when its content changed', () => {
    const { project, objectGroupsContainer } = makeContainer();
    const group = objectGroupsContainer.insertNew('Everyone', 0);
    const target = getObjectGroupsContainerHistoryTarget(objectGroupsContainer);
    const before = target.getValue();

    group.addObject('Player');
    const after = target.getValue();

    target.setValue(before);
    expect(objectGroupsContainer.get('Everyone').find('Player')).toBe(false);
    expect(objectGroupsContainer.get('Everyone').ptr).toBe(group.ptr);

    target.setValue(after);
    expect(objectGroupsContainer.get('Everyone').find('Player')).toBe(true);
    expect(objectGroupsContainer.get('Everyone').ptr).toBe(group.ptr);

    project.delete();
  });
});

describe('getVariablesContainerHistoryTarget', () => {
  const makeContainer = () => {
    // $FlowFixMe[invalid-constructor]
    const project = new gd.ProjectHelper.createNewGDJSProject();
    const layout = project.insertNewLayout('Scene', 0);
    return { project, variablesContainer: layout.getVariables() };
  };

  it('undoes and redoes the creation of a variable', () => {
    const { project, variablesContainer } = makeContainer();
    const target = getVariablesContainerHistoryTarget(variablesContainer);
    const before = target.getValue();

    variablesContainer.insertNew('Score', 0).setValue(0);
    const after = target.getValue();

    target.setValue(before);
    expect(variablesContainer.has('Score')).toBe(false);

    target.setValue(after);
    expect(variablesContainer.has('Score')).toBe(true);
    expect(variablesContainer.get('Score').getValue()).toBe(0);

    project.delete();
  });

  it('never destroys and recreates a variable unrelated to the step being undone/redone', () => {
    const { project, variablesContainer } = makeContainer();
    const untouched = variablesContainer.insertNew('Untouched', 0);
    untouched.setValue(42);
    const target = getVariablesContainerHistoryTarget(variablesContainer);
    const before = target.getValue();

    variablesContainer.insertNew('Score', 1).setValue(0);
    const after = target.getValue();
    target.setValue(before);
    target.setValue(after);

    expect(variablesContainer.get('Untouched').ptr).toBe(untouched.ptr);
    expect(variablesContainer.get('Untouched').getValue()).toBe(42);

    project.delete();
  });

  it('updates a variable in place (same underlying object) when its value changed', () => {
    const { project, variablesContainer } = makeContainer();
    const score = variablesContainer.insertNew('Score', 0);
    score.setValue(0);
    const target = getVariablesContainerHistoryTarget(variablesContainer);
    const before = target.getValue();

    score.setValue(10);
    const after = target.getValue();

    target.setValue(before);
    expect(variablesContainer.get('Score').getValue()).toBe(0);
    expect(variablesContainer.get('Score').ptr).toBe(score.ptr);

    target.setValue(after);
    expect(variablesContainer.get('Score').getValue()).toBe(10);
    expect(variablesContainer.get('Score').ptr).toBe(score.ptr);

    project.delete();
  });
});

describe('global objects/groups/variables shared across scene tabs', () => {
  // Every open SceneEditor tab tracks the same *global* containers in its
  // own, independent history - two tabs are simulated here as two separate
  // calls to the target-generator functions, both wrapping the same
  // container, exactly as two mounted SceneEditor instances would. The
  // regression this guards: tab A undoing/redoing its own step must never
  // destroy a global object/group/variable that tab B still holds a
  // reference to (its instances, effects, behaviors, or just a cached
  // pointer), or tab B crashes with "memory access out of bounds" the next
  // time it touches that reference - this is exactly the real crash
  // reported after undoing/redoing scene and external layout renames.
  const makeProjectWithGlobals = () => {
    // $FlowFixMe[invalid-constructor]
    const project = new gd.ProjectHelper.createNewGDJSProject();
    project.insertNewLayout('SceneA', 0);
    project.insertNewLayout('SceneB', 1);
    return { project, globalObjectsContainer: project.getObjects() };
  };

  it('undoing/redoing a global object from tab A never invalidates a global object tab B still references', () => {
    const { project, globalObjectsContainer } = makeProjectWithGlobals();
    const sharedEnemy = globalObjectsContainer.insertNewObject(
      project,
      'Sprite',
      'SharedEnemy',
      0
    );
    sharedEnemy
      .getVariables()
      .insertNew('Health', 0)
      .setValue(10);
    // Tab B opens and keeps its own reference to the global object (as its
    // objects list, or an effect/behavior editor, would).
    const tabBReferenceToSharedEnemy = globalObjectsContainer.getObject(
      'SharedEnemy'
    );

    // Tab A gets its own view of the same global container.
    const tabATarget = getObjectsContainerHistoryTarget(
      globalObjectsContainer,
      project,
      noopEnsurePersistentUuids
    );
    const before = tabATarget.getValue();

    // Tab A creates, then undoes/redoes, an unrelated global object.
    globalObjectsContainer.insertNewObject(project, 'Sprite', 'NewFromA', 1);
    const after = tabATarget.getValue();
    tabATarget.setValue(before);
    tabATarget.setValue(after);

    // Tab B's reference to the unrelated, untouched global object must
    // still be the exact same underlying object, with its own content
    // intact.
    expect(globalObjectsContainer.getObject('SharedEnemy').ptr).toBe(
      tabBReferenceToSharedEnemy.ptr
    );
    expect(
      tabBReferenceToSharedEnemy
        .getVariables()
        .get('Health')
        .getValue()
    ).toBe(10);

    project.delete();
  });

  it('undoing/redoing a global object group from tab A never invalidates one tab B still references', () => {
    const { project, globalObjectsContainer } = makeProjectWithGlobals();
    globalObjectsContainer.insertNewObject(project, 'Sprite', 'Player', 0);
    const globalObjectGroupsContainer = globalObjectsContainer.getObjectGroups();
    const sharedGroup = globalObjectGroupsContainer.insertNew('Shared', 0);
    sharedGroup.addObject('Player');
    const tabBReferenceToSharedGroup = globalObjectGroupsContainer.get(
      'Shared'
    );

    const tabATarget = getObjectGroupsContainerHistoryTarget(
      globalObjectGroupsContainer
    );
    const before = tabATarget.getValue();

    globalObjectGroupsContainer.insertNew('NewFromA', 1);
    const after = tabATarget.getValue();
    tabATarget.setValue(before);
    tabATarget.setValue(after);

    expect(globalObjectGroupsContainer.get('Shared').ptr).toBe(
      tabBReferenceToSharedGroup.ptr
    );
    expect(tabBReferenceToSharedGroup.find('Player')).toBe(true);

    project.delete();
  });

  it('undoing/redoing a global variable from tab A never invalidates one tab B still references', () => {
    const { project } = makeProjectWithGlobals();
    const globalVariablesContainer = project.getVariables();
    const sharedVariable = globalVariablesContainer.insertNew('Shared', 0);
    sharedVariable.setValue(99);
    const tabBReferenceToSharedVariable = globalVariablesContainer.get(
      'Shared'
    );

    const tabATarget = getVariablesContainerHistoryTarget(
      globalVariablesContainer
    );
    const before = tabATarget.getValue();

    globalVariablesContainer.insertNew('NewFromA', 1).setValue(0);
    const after = tabATarget.getValue();
    tabATarget.setValue(before);
    tabATarget.setValue(after);

    expect(globalVariablesContainer.get('Shared').ptr).toBe(
      tabBReferenceToSharedVariable.ptr
    );
    expect(tabBReferenceToSharedVariable.getValue()).toBe(99);

    project.delete();
  });
});
