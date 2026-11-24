// @flow
import { makeTestExtensions } from '../fixtures/TestExtensions';
import {
  editorFunctions,
  type EditorFunctionGenericOutput,
  type RenderForEditorOptions,
} from './index';
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

  // The early returns of renderForEditor (no project, unknown behavior type)
  // used to crash on a variable read before its declaration.
  it('renders a description even without a project or with an unknown behavior type', () => {
    const { editorCallbacks } = makeFakeLaunchFunctionOptionsWithProject(
      project
    );
    const args = {
      scene_name: 'TestScene',
      object_name: 'MySprite',
      behavior_type: 'Bogus::NopeBehavior',
    };

    const { renderForEditor } = editorFunctions.add_behavior;
    if (!renderForEditor) throw new Error('renderForEditor is not defined.');
    const makeOptions = (
      projectOrNull: ?gdProject
    ): RenderForEditorOptions => ({
      project: projectOrNull,
      args,
      editorCallbacks,
      shouldShowDetails: false,
      editorFunctionCallResultOutput: null,
      exampleShortHeaders: null,
    });

    expect(renderForEditor(makeOptions(null)).text).toBeTruthy();
    expect(renderForEditor(makeOptions(project)).text).toBeTruthy();
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
  describe('capabilities required by the behavior', () => {
    const getSceneObject = (name: string) =>
      testScene.getObjects().getObject(name);

    it('refuses a behavior requiring the 3D capability on an object without it', async () => {
      const result: EditorFunctionGenericOutput = await editorFunctions.add_behavior.launchFunction(
        {
          ...makeFakeLaunchFunctionOptionsWithProject(project),
          args: {
            scene_name: 'TestScene',
            object_name: 'MySprite',
            behavior_type: 'FakePhysics3D::Physics3DBehavior',
          },
        }
      );

      expect(result.success).toBe(false);
      expect(result.message).toContain(
        'Behavior "Physics3D" (type "FakePhysics3D::Physics3DBehavior") needs a capability that "MySprite" (type "Sprite") does not have: "3D capability" (FakeScene3D::Base3DBehavior). It cannot be added to this object.'
      );
      expect(getSceneObject('MySprite').hasBehaviorNamed('Physics3D')).toBe(
        false
      );
      // The capability was not added either.
      expect(
        getSceneObject('MySprite')
          .getAllBehaviorNames()
          .toJSArray()
      ).not.toContain('Object3D');
    });

    it('adds a behavior requiring the 3D capability to a 3D object', async () => {
      testScene
        .getObjects()
        .insertNewObject(project, 'FakeScene3D::Model3DObject', 'MyModel', 1);

      const result: EditorFunctionGenericOutput = await editorFunctions.add_behavior.launchFunction(
        {
          ...makeFakeLaunchFunctionOptionsWithProject(project),
          args: {
            scene_name: 'TestScene',
            object_name: 'MyModel',
            behavior_type: 'FakePhysics3D::Physics3DBehavior',
          },
        }
      );

      expect(result.success).toBe(true);
      expect(result.message).toContain(
        'Added behavior "Physics3D" (type "FakePhysics3D::Physics3DBehavior") to "MyModel"'
      );
      const model = getSceneObject('MyModel');
      expect(model.hasBehaviorNamed('Physics3D')).toBe(true);
      // The capability the object had by default is used, not duplicated.
      expect(
        model
          .getAllBehaviorNames()
          .toJSArray()
          .filter(
            name =>
              model.getBehavior(name).getTypeName() ===
              'FakeScene3D::Base3DBehavior'
          )
      ).toEqual(['Object3D']);
    });

    it('checks the other capabilities the same way (a Sprite is animatable, a 3D model is not)', async () => {
      testScene
        .getObjects()
        .insertNewObject(project, 'FakeScene3D::Model3DObject', 'MyModel', 1);
      const options = makeFakeLaunchFunctionOptionsWithProject(project);

      const onSprite: EditorFunctionGenericOutput = await editorFunctions.add_behavior.launchFunction(
        {
          ...options,
          args: {
            scene_name: 'TestScene',
            object_name: 'MySprite',
            behavior_type: 'FakeAnimatedBehavior::AnimatedBehavior',
          },
        }
      );
      expect(onSprite.success).toBe(true);
      expect(getSceneObject('MySprite').hasBehaviorNamed('Animated')).toBe(
        true
      );

      const onModel: EditorFunctionGenericOutput = await editorFunctions.add_behavior.launchFunction(
        {
          ...options,
          args: {
            scene_name: 'TestScene',
            object_name: 'MyModel',
            behavior_type: 'FakeAnimatedBehavior::AnimatedBehavior',
          },
        }
      );
      expect(onModel.success).toBe(false);
      expect(onModel.message).toContain(
        'needs a capability that "MyModel" (type "FakeScene3D::Model3DObject") does not have: "Objects with animations" (AnimatableCapability::AnimatableBehavior)'
      );
      expect(getSceneObject('MyModel').hasBehaviorNamed('Animated')).toBe(
        false
      );
    });

    it('adds the behavior to the compatible objects of a group and warns about the others', async () => {
      testScene
        .getObjects()
        .insertNewObject(project, 'FakeScene3D::Model3DObject', 'MyModel', 1);
      const group = testScene
        .getObjects()
        .getObjectGroups()
        .insertNew('Things', 0);
      group.addObject('MySprite');
      group.addObject('MyModel');

      const result: EditorFunctionGenericOutput = await editorFunctions.add_behavior.launchFunction(
        {
          ...makeFakeLaunchFunctionOptionsWithProject(project),
          args: {
            scene_name: 'TestScene',
            object_name: 'Things',
            behavior_type: 'FakePhysics3D::Physics3DBehavior',
          },
        }
      );

      expect(result.success).toBe(true);
      expect(result.message).toContain('Done with warnings.');
      expect(result.message).toContain(
        'Added behavior "Physics3D" (type "FakePhysics3D::Physics3DBehavior") to "MyModel"'
      );
      expect(result.message).toContain(
        'needs a capability that "MySprite" (type "Sprite") does not have: "3D capability" (FakeScene3D::Base3DBehavior). It cannot be added to this object.'
      );
      expect(getSceneObject('MyModel').hasBehaviorNamed('Physics3D')).toBe(
        true
      );
      expect(getSceneObject('MySprite').hasBehaviorNamed('Physics3D')).toBe(
        false
      );
    });

    it('tells which setting gives a custom object of the project the capability', async () => {
      const extension = project.insertNewEventsFunctionsExtension('UI', 0);
      extension.getEventsBasedObjects().insertNew('Dialog', 0);
      testScene
        .getObjects()
        .insertNewObject(project, 'UI::Dialog', 'MyDialog', 1);

      const result: EditorFunctionGenericOutput = await editorFunctions.add_behavior.launchFunction(
        {
          ...makeFakeLaunchFunctionOptionsWithProject(project),
          args: {
            scene_name: 'TestScene',
            object_name: 'MyDialog',
            behavior_type: 'FakeAnimatedBehavior::AnimatedBehavior',
          },
        }
      );

      expect(result.success).toBe(false);
      expect(result.message).toContain(
        'needs a capability that "MyDialog" (type "UI::Dialog") does not have: "Objects with animations" (AnimatableCapability::AnimatableBehavior). It cannot be added to this object. A custom object gets it when its "isAnimatable" setting is "true" (`change_custom_object`, `changed_settings`).'
      );
    });

    it('refuses a behavior the editor does not offer on the children of a custom object', async () => {
      const extension = project.insertNewEventsFunctionsExtension('UI', 0);
      const dialog = extension.getEventsBasedObjects().insertNew('Dialog', 0);
      dialog
        .getDefaultVariant()
        .getObjects()
        .insertNewObject(project, 'FakeScene3D::Model3DObject', 'Body', 0);

      const result: EditorFunctionGenericOutput = await editorFunctions.add_behavior.launchFunction(
        {
          ...makeFakeLaunchFunctionOptionsWithProject(project),
          args: {
            scope: {
              type: 'custom_object_variant',
              extension_name: 'UI',
              custom_object_name: 'Dialog',
              variant_name: '',
            },
            object_name: 'Body',
            behavior_type: 'FakePhysics3D::Physics3DBehavior',
          },
        }
      );

      expect(result.success).toBe(false);
      expect(result.message).toBe(
        'Behavior "Physics3D" (type "FakePhysics3D::Physics3DBehavior") cannot be added to "Body": it is not usable on a child object of a custom object (the editor does not offer it there). Add it to an object placed in a scene instead: the custom object "UI::Dialog" itself, or the object to simulate.'
      );
      expect(
        dialog
          .getDefaultVariant()
          .getObjects()
          .getObject('Body')
          .hasBehaviorNamed('Physics3D')
      ).toBe(false);
    });

    it('adds a behavior of an extension of the project without looking it up in the store registry', async () => {
      const extension = project.insertNewEventsFunctionsExtension('UI', 0);
      extension.getEventsBasedBehaviors().insertNew('Glow', 0);
      const options = makeFakeLaunchFunctionOptionsWithProject(project);
      // The registry knows nothing about the project's own extensions.
      const ensureExtensionInstalled = jest.fn(
        async (_options: mixed): Promise<void> => {
          throw new Error(
            'Extension "UI" does not exist in the extension registry.'
          );
        }
      );
      // What the editor does: regenerate the extensions, so that the metadata
      // of a behavior authored a moment ago exists.
      const ensureExtensionsUpToDate = jest.fn(() => {
        options.reloadExtensionMetadata('UI');
        return Promise.resolve();
      });

      const result: EditorFunctionGenericOutput = await editorFunctions.add_behavior.launchFunction(
        {
          ...options,
          ensureExtensionInstalled,
          ensureExtensionsUpToDate,
          args: {
            scene_name: 'TestScene',
            object_name: 'MySprite',
            behavior_type: 'UI::Glow',
          },
        }
      );

      expect(ensureExtensionInstalled).not.toHaveBeenCalled();
      expect(ensureExtensionsUpToDate).toHaveBeenCalled();
      expect(result.success).toBe(true);
      expect(getSceneObject('MySprite').hasBehaviorNamed('Glow')).toBe(true);
    });
  });
});
