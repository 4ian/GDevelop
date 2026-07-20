// @flow
import { makeTestExtensions } from '../fixtures/TestExtensions';
import { editorFunctions, type EditorFunctionGenericOutput } from './index';
import { makeFakeLaunchFunctionOptionsWithProject } from './TestHelpers';

const gd: libGDevelop = global.gd;

describe('add_behavior', () => {
  let project: gdProject;
  let testScene: gdLayout;

  beforeEach(() => {
    makeTestExtensions(gd);
    // $FlowFixMe[invalid-constructor]
    project = new gd.ProjectHelper.createNewGDJSProject();
    testScene = project.insertNewLayout('TestScene', 0);
    testScene.getObjects().insertNewObject(project, 'Sprite', 'MySprite', 0);
  });

  afterEach(() => {
    project.delete();
  });

  it('fails when the behavior type does not exist', async () => {
    const result: EditorFunctionGenericOutput = await editorFunctions.add_behavior.launchFunction(
      {
        ...makeFakeLaunchFunctionOptionsWithProject(project),
        args: {
          scene_name: 'TestScene',
          object_name: 'MySprite',
          behavior_type: 'Bogus::NopeBehavior',
        },
      }
    );

    expect(result.success).toBe(false);
    expect(result.message).toBe(
      'Behavior type "Bogus::NopeBehavior" does not exist.'
    );
  });

  it('fails when the extension of the behavior cannot be installed', async () => {
    // $FlowFixMe[underconstrained-implicit-instantiation]
    const ensureExtensionInstalled = jest.fn();
    ensureExtensionInstalled.mockRejectedValue(new Error('Network error'));

    const result: EditorFunctionGenericOutput = await editorFunctions.add_behavior.launchFunction(
      {
        ...makeFakeLaunchFunctionOptionsWithProject(project),
        ensureExtensionInstalled,
        args: {
          scene_name: 'TestScene',
          object_name: 'MySprite',
          behavior_type: 'SomeExtension::SomeBehavior',
        },
      }
    );

    expect(ensureExtensionInstalled).toHaveBeenCalledWith(
      expect.objectContaining({ extensionName: 'SomeExtension' })
    );
    expect(result.success).toBe(false);
    expect(result.message).toBe(
      'Could not install extension "SomeExtension": Network error'
    );
  });

  it('adds the behavior under a custom name when behavior_name is provided', async () => {
    const result: EditorFunctionGenericOutput = await editorFunctions.add_behavior.launchFunction(
      {
        ...makeFakeLaunchFunctionOptionsWithProject(project),
        args: {
          scene_name: 'TestScene',
          object_name: 'MySprite',
          behavior_type: 'PlatformBehavior::PlatformerObjectBehavior',
          behavior_name: 'MyCustomPlatformer',
        },
      }
    );

    expect(result.success).toBe(true);
    expect(result.message).toContain(
      'Added behavior "MyCustomPlatformer" (type "PlatformBehavior::PlatformerObjectBehavior") to "MySprite".'
    );
    const object = testScene.getObjects().getObject('MySprite');
    expect(object.hasBehaviorNamed('MyCustomPlatformer')).toBe(true);
  });

  it('warns that a default capability cannot be added to an object missing it', async () => {
    // The fake 3D cube does not have the opacity capability, contrary to a Sprite.
    testScene
      .getObjects()
      .insertNewObject(project, 'FakeScene3D::Cube3DObject', 'MyCube', 1);

    const result: EditorFunctionGenericOutput = await editorFunctions.add_behavior.launchFunction(
      {
        ...makeFakeLaunchFunctionOptionsWithProject(project),
        args: {
          scene_name: 'TestScene',
          object_name: 'MyCube',
          behavior_type: 'OpacityCapability::OpacityBehavior',
        },
      }
    );

    expect(result.success).toBe(false);
    expect(result.message).toContain('is a default capability');
    expect(result.message).toContain('cannot be added to "MyCube"');
  });
});
