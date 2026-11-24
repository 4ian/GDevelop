// @flow
import { makeTestExtensions } from '../fixtures/TestExtensions';
import { editorFunctions, type EditorFunctionGenericOutput } from './index';
import { makeFakeLaunchFunctionOptionsWithProject } from './TestHelpers';

const gd: libGDevelop = global.gd;

describe('change_behavior_property (property warnings and shared properties)', () => {
  let project: gdProject;
  let testScene: gdLayout;

  beforeEach(() => {
    makeTestExtensions(gd);
    // $FlowFixMe[invalid-constructor]
    project = new gd.ProjectHelper.createNewGDJSProject();
    testScene = project.insertNewLayout('TestScene', 0);
    const testSceneObjects = testScene.getObjects();
    const object = testSceneObjects.insertNewObject(
      project,
      'Sprite',
      'MyObject',
      testSceneObjects.getObjectsCount()
    );
    object.addNewBehavior(
      project,
      'FakeBehavior::FakeBehavior',
      'MyFakeBehavior'
    );
  });

  afterEach(() => {
    project.delete();
  });

  // The live deletion path (delete_this_behavior) on a group — the legacy
  // remove_behavior tool is no longer offered to the AI since toolsVersion v6.
  it('deletes a behavior from every object of a group with delete_this_behavior', async () => {
    const testSceneObjects = testScene.getObjects();
    const enemy1 = testSceneObjects.insertNewObject(
      project,
      'Sprite',
      'Enemy1',
      testSceneObjects.getObjectsCount()
    );
    const enemy2 = testSceneObjects.insertNewObject(
      project,
      'Sprite',
      'Enemy2',
      testSceneObjects.getObjectsCount()
    );
    enemy1.addNewBehavior(project, 'FakeBehavior::FakeBehavior', 'MyBehavior');
    enemy2.addNewBehavior(project, 'FakeBehavior::FakeBehavior', 'MyBehavior');
    const group = testSceneObjects.getObjectGroups().insertNew('Enemies', 0);
    group.addObject('Enemy1');
    group.addObject('Enemy2');

    const result: EditorFunctionGenericOutput = await editorFunctions.change_behavior_property.launchFunction(
      {
        ...makeFakeLaunchFunctionOptionsWithProject(project),
        args: {
          scene_name: 'TestScene',
          object_name: 'Enemies',
          behavior_name: 'MyBehavior',
          delete_this_behavior: true,
        },
      }
    );

    expect(result.success).toBe(true);
    expect(enemy1.hasBehaviorNamed('MyBehavior')).toBe(false);
    expect(enemy2.hasBehaviorNamed('MyBehavior')).toBe(false);
  });

  it('fails listing the available property names when the property does not exist', async () => {
    const result: EditorFunctionGenericOutput = await editorFunctions.change_behavior_property.launchFunction(
      {
        ...makeFakeLaunchFunctionOptionsWithProject(project),
        args: {
          scene_name: 'TestScene',
          object_name: 'MyObject',
          behavior_name: 'MyFakeBehavior',
          changed_properties: [{ property_name: 'nope', new_value: '42' }],
        },
      }
    );

    expect(result.success).toBe(false);
    expect(result.message).toBe(
      'Nothing changed. Issues:\n' +
        'Property "nope" not on behavior "MyFakeBehavior" of "MyObject". ' +
        'Available properties: property1, property2.'
    );
  });

  it('skips changed_properties items missing property_name or new_value', async () => {
    const result: EditorFunctionGenericOutput = await editorFunctions.change_behavior_property.launchFunction(
      {
        ...makeFakeLaunchFunctionOptionsWithProject(project),
        args: {
          scene_name: 'TestScene',
          object_name: 'MyObject',
          behavior_name: 'MyFakeBehavior',
          changed_properties: [
            { new_value: 'hello' },
            { property_name: 'property1' },
          ],
        },
      }
    );

    expect(result.success).toBe(false);
    expect(result.message).toBe(
      'Nothing changed. Issues:\n' +
        'Missing "property_name" or "new_value" in changed_properties item: {"new_value":"hello"}. Skipped.\n' +
        'Missing "property_name" or "new_value" in changed_properties item: {"property_name":"property1"}. Skipped.'
    );

    // The existing property was not touched.
    const behavior = testScene
      .getObjects()
      .getObject('MyObject')
      .getBehavior('MyFakeBehavior');
    expect(
      behavior
        .getProperties()
        .get('property1')
        .getValue()
    ).toBe('Initial value 1');
  });

  it('changes a shared property of a behavior (stored in the scene shared data)', async () => {
    // The Physics behavior has shared data with properties (gravity, scale).
    const object = testScene.getObjects().getObject('MyObject');
    object.addNewBehavior(
      project,
      'PhysicsBehavior::PhysicsBehavior',
      'Physics'
    );
    // Create the shared data for the behaviors used in the scene (this is
    // normally done by the editor or by the add_behavior tool).
    testScene.updateBehaviorsSharedData(project);

    const result: EditorFunctionGenericOutput = await editorFunctions.change_behavior_property.launchFunction(
      {
        ...makeFakeLaunchFunctionOptionsWithProject(project),
        args: {
          scene_name: 'TestScene',
          object_name: 'MyObject',
          behavior_name: 'Physics',
          changed_properties: [
            {
              property_name: 'Gravity on Y axis (in m/s²)',
              new_value: '20',
            },
          ],
        },
      }
    );

    expect(result.success).toBe(true);
    // The change is verified against the shared data (not the behavior's own
    // properties), so the new value is echoed back without any warning.
    expect(result.message).toBe(
      'Done.\nSet "Gravity on Y axis (in m/s²)" on shared behavior "Physics" = "20".'
    );

    // The value is changed on the shared data of the scene.
    const sharedDataProperties = testScene
      .getBehaviorSharedData('Physics')
      .getProperties();
    expect(
      sharedDataProperties.get('Gravity on Y axis (in m/s²)').getValue()
    ).toBe('20');
  });
});

describe('change_behavior_property (network synchronization)', () => {
  let project: gdProject;
  let testScene: gdLayout;

  beforeEach(() => {
    makeTestExtensions(gd);
    // $FlowFixMe[invalid-constructor]
    project = new gd.ProjectHelper.createNewGDJSProject();
    testScene = project.insertNewLayout('TestScene', 0);
  });

  afterEach(() => {
    project.delete();
  });

  /**
   * The Multiplayer extension is not loaded in tests, but only the type of
   * the behavior is used to know if an object is synchronized over the network.
   */
  const addPlayerObject = ({
    name,
    isMultiplayer,
  }: {|
    name: string,
    isMultiplayer: boolean,
  |}): gdObject => {
    const testSceneObjects = testScene.getObjects();
    const object = testSceneObjects.insertNewObject(
      project,
      'Sprite',
      name,
      testSceneObjects.getObjectsCount()
    );
    if (isMultiplayer) {
      object.addNewBehavior(
        project,
        'Multiplayer::MultiplayerObjectBehavior',
        'MultiplayerObject'
      );
    }
    object.addNewBehavior(
      project,
      'FakeBehavior::FakeBehavior',
      'KeyboardMapper'
    );
    return object;
  };

  it('sets a behavior as not synchronized over the network', async () => {
    const player = addPlayerObject({ name: 'Player', isMultiplayer: true });

    const result: EditorFunctionGenericOutput = await editorFunctions.change_behavior_property.launchFunction(
      {
        ...makeFakeLaunchFunctionOptionsWithProject(project),
        args: {
          scene_name: 'TestScene',
          object_name: 'Player',
          behavior_name: 'KeyboardMapper',
          changed_properties: [
            { property_name: 'isSynchronizedOverNetwork', new_value: 'false' },
          ],
        },
      }
    );

    expect(result.success).toBe(true);
    expect(result.message).toBe(
      'Done.\n' +
        'Set "isSynchronizedOverNetwork" on behavior "KeyboardMapper" = "false".'
    );
    expect(
      player.getBehavior('KeyboardMapper').isSynchronizedOverNetwork()
    ).toBe(false);
  });

  it('sets it on every object of a group, and warns about objects without the multiplayer behavior', async () => {
    const player1 = addPlayerObject({ name: 'Player1', isMultiplayer: true });
    const player2 = addPlayerObject({ name: 'Player2', isMultiplayer: false });
    const group = testScene
      .getObjects()
      .getObjectGroups()
      .insertNew('Players', 0);
    group.addObject('Player1');
    group.addObject('Player2');

    const result: EditorFunctionGenericOutput = await editorFunctions.change_behavior_property.launchFunction(
      {
        ...makeFakeLaunchFunctionOptionsWithProject(project),
        args: {
          scene_name: 'TestScene',
          object_name: 'Players',
          behavior_name: 'KeyboardMapper',
          changed_properties: [
            // Matched like other property names.
            { property_name: 'is_synchronized_over_network', new_value: '0' },
          ],
        },
      }
    );

    expect(result.success).toBe(true);
    expect(result.message).toBe(
      'Done with warnings.\n' +
        'Set "isSynchronizedOverNetwork" on behavior "KeyboardMapper" = "false".\n' +
        'Warnings:\n' +
        '"Player2" has no "Multiplayer::MultiplayerObjectBehavior" behavior: "isSynchronizedOverNetwork" has no effect until it\'s added.'
    );
    expect(
      player1.getBehavior('KeyboardMapper').isSynchronizedOverNetwork()
    ).toBe(false);
    expect(
      player2.getBehavior('KeyboardMapper').isSynchronizedOverNetwork()
    ).toBe(false);
  });

  it('refuses a value that is not a boolean', async () => {
    const player = addPlayerObject({ name: 'Player', isMultiplayer: true });

    const result: EditorFunctionGenericOutput = await editorFunctions.change_behavior_property.launchFunction(
      {
        ...makeFakeLaunchFunctionOptionsWithProject(project),
        args: {
          scene_name: 'TestScene',
          object_name: 'Player',
          behavior_name: 'KeyboardMapper',
          changed_properties: [
            { property_name: 'isSynchronizedOverNetwork', new_value: 'no' },
          ],
        },
      }
    );

    expect(result.success).toBe(false);
    expect(result.message).toBe(
      'Nothing changed. Issues:\n' +
        'Could not set "isSynchronizedOverNetwork" on behavior "KeyboardMapper": use "true" or "false".'
    );
    expect(
      player.getBehavior('KeyboardMapper').isSynchronizedOverNetwork()
    ).toBe(true);
  });
});
