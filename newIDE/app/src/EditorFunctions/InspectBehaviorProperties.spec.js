// @flow
import { editorFunctions, type EditorFunctionGenericOutput } from './index';
import { makeFakeLaunchFunctionOptionsWithProject } from './TestHelpers';

const gd: libGDevelop = global.gd;

describe('inspect_behavior_properties (not found and shared properties)', () => {
  let project: gdProject;
  let testScene: gdLayout;

  beforeEach(() => {
    // $FlowFixMe[invalid-constructor]
    project = new gd.ProjectHelper.createNewGDJSProject();
    testScene = project.insertNewLayout('TestScene', 0);
  });

  afterEach(() => {
    project.delete();
  });

  it('fails when the object or group is not found', async () => {
    const result: EditorFunctionGenericOutput = await editorFunctions.inspect_behavior_properties.launchFunction(
      {
        ...makeFakeLaunchFunctionOptionsWithProject(project),
        args: {
          scene_name: 'TestScene',
          object_name: 'MissingObject',
          behavior_name: 'SomeBehavior',
        },
      }
    );

    expect(result.success).toBe(false);
    expect(result.message).toBe(
      'Object or group not found: "MissingObject" in scene "TestScene" nor globally.'
    );
  });

  it('returns the shared properties of a behavior having shared data', async () => {
    const object = testScene
      .getObjects()
      .insertNewObject(project, 'Sprite', 'Ball', 0);
    // The Physics behavior has shared data with properties (gravity, scale).
    object.addNewBehavior(
      project,
      'PhysicsBehavior::PhysicsBehavior',
      'Physics'
    );
    // Create the shared data for the behaviors used in the scene (this is
    // normally done by the editor or by the add_behavior tool).
    testScene.updateBehaviorsSharedData(project);

    const result: EditorFunctionGenericOutput = await editorFunctions.inspect_behavior_properties.launchFunction(
      {
        ...makeFakeLaunchFunctionOptionsWithProject(project),
        args: {
          scene_name: 'TestScene',
          object_name: 'Ball',
          behavior_name: 'Physics',
        },
      }
    );

    expect(result.success).toBe(true);
    expect(result.behaviorName).toBe('Physics');
    // The behavior own properties are returned...
    expect(result.properties).toEqual(
      expect.arrayContaining([expect.objectContaining({ name: 'Friction' })])
    );
    // ...as well as the properties of the shared data.
    expect(result.sharedProperties).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: 'Gravity on X axis (in m/s²)',
          value: '0',
        }),
        expect.objectContaining({
          name: 'Gravity on Y axis (in m/s²)',
          value: '9',
        }),
      ])
    );
  });

  it('does not return sharedProperties when the behavior has no shared data in the scene', async () => {
    const object = testScene
      .getObjects()
      .insertNewObject(project, 'Sprite', 'Player', 0);
    object.addNewBehavior(
      project,
      'PlatformBehavior::PlatformerObjectBehavior',
      'PlatformerObject'
    );

    const result: EditorFunctionGenericOutput = await editorFunctions.inspect_behavior_properties.launchFunction(
      {
        ...makeFakeLaunchFunctionOptionsWithProject(project),
        args: {
          scene_name: 'TestScene',
          object_name: 'Player',
          behavior_name: 'PlatformerObject',
        },
      }
    );

    expect(result.success).toBe(true);
    expect(result.sharedProperties).toBeUndefined();
  });
});
