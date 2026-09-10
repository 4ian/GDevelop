// @flow
import { editorFunctions, type EditorFunctionGenericOutput } from './index';
import { makeFakeLaunchFunctionOptionsWithProject } from './TestHelpers';

const gd: libGDevelop = global.gd;

describe('inspect_object_properties_effects (additional cases)', () => {
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

  const addSpriteAnimation = (object: gdObject, animationName: string) => {
    const spriteConfiguration = gd.asSpriteConfiguration(
      object.getConfiguration()
    );
    const animation = new gd.Animation();
    animation.setName(animationName);
    animation.setDirectionsCount(1);
    const sprite = new gd.Sprite();
    sprite.setImageName('fake-image.png');
    animation.getDirection(0).addSprite(sprite);
    spriteConfiguration.getAnimations().addAnimation(animation);
    sprite.delete();
    animation.delete();
  };

  it('reminds to inspect both variables and behaviors with the dedicated tools', async () => {
    const testSceneObjects = testScene.getObjects();
    const object = testSceneObjects.insertNewObject(
      project,
      'Sprite',
      'MySprite',
      testSceneObjects.getObjectsCount()
    );
    object
      .getVariables()
      .insertNew('Health', 0)
      .setValue(100);
    object.addNewBehavior(
      project,
      'PlatformBehavior::PlatformerObjectBehavior',
      'PlatformerObject'
    );

    const result: EditorFunctionGenericOutput = await editorFunctions.inspect_object_properties_effects.launchFunction(
      {
        ...makeFakeLaunchFunctionOptionsWithProject(project),
        args: {
          scene_name: 'TestScene',
          object_name: 'MySprite',
        },
      }
    );

    expect(result.success).toBe(true);
    expect(result.reminder).toBeDefined();
    // Note: the behavior count also includes the default capability behaviors
    // of the object (e.g. effect, opacity...), so it's not asserted to be 1.
    const behaviorCount = (result.behaviors || []).length;
    expect(behaviorCount).toBeGreaterThan(0);
    expect(result.reminder).toBe(
      `This object also has 1 variable(s) (inspect with \`inspect_variables\`) and ${behaviorCount} behavior(s) (inspect with \`inspect_behavior_properties\`).`
    );
    expect(result.behaviors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          behaviorName: 'PlatformerObject',
          behaviorType: 'PlatformBehavior::PlatformerObjectBehavior',
        }),
      ])
    );
  });

  it('lists the animation names of an animated object', async () => {
    const testSceneObjects = testScene.getObjects();
    const object = testSceneObjects.insertNewObject(
      project,
      'Sprite',
      'MyAnimatedSprite',
      testSceneObjects.getObjectsCount()
    );
    addSpriteAnimation(object, 'Idle');
    addSpriteAnimation(object, 'Run');
    addSpriteAnimation(object, ''); // An animation without a name.

    const result: EditorFunctionGenericOutput = await editorFunctions.inspect_object_properties_effects.launchFunction(
      {
        ...makeFakeLaunchFunctionOptionsWithProject(project),
        args: {
          scene_name: 'TestScene',
          object_name: 'MyAnimatedSprite',
        },
      }
    );

    expect(result.success).toBe(true);
    expect(result.animationNames).toBe(
      'Idle, Run, (animation without name, animation index is: 2)'
    );
  });

  it('does not include an animationNames field for an object without animations', async () => {
    const testSceneObjects = testScene.getObjects();
    testSceneObjects.insertNewObject(
      project,
      'Sprite',
      'MyEmptySprite',
      testSceneObjects.getObjectsCount()
    );

    const result: EditorFunctionGenericOutput = await editorFunctions.inspect_object_properties_effects.launchFunction(
      {
        ...makeFakeLaunchFunctionOptionsWithProject(project),
        args: {
          scene_name: 'TestScene',
          object_name: 'MyEmptySprite',
        },
      }
    );

    expect(result.success).toBe(true);
    expect(result.animationNames).toBeUndefined();
  });

  it('fails when the object is not found in the scene nor globally', async () => {
    const result: EditorFunctionGenericOutput = await editorFunctions.inspect_object_properties_effects.launchFunction(
      {
        ...makeFakeLaunchFunctionOptionsWithProject(project),
        args: {
          scene_name: 'TestScene',
          object_name: 'DoesNotExist',
        },
      }
    );

    expect(result.success).toBe(false);
    expect(result.message).toBe(
      'Object not found: "DoesNotExist" in scene "TestScene" nor globally.'
    );
  });

  it('inspects a global object when a scene name is passed', async () => {
    const globalObjects = project.getObjects();
    globalObjects.insertNewObject(
      project,
      'Sprite',
      'MyGlobalSprite',
      globalObjects.getObjectsCount()
    );

    const result: EditorFunctionGenericOutput = await editorFunctions.inspect_object_properties_effects.launchFunction(
      {
        ...makeFakeLaunchFunctionOptionsWithProject(project),
        args: {
          scene_name: 'TestScene',
          object_name: 'MyGlobalSprite',
        },
      }
    );

    expect(result.success).toBe(true);
    expect(result.objectName).toBe('MyGlobalSprite');
    expect(result.properties).toBeTruthy();
  });
});
