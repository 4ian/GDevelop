// @flow
import { makeTestExtensions } from '../fixtures/TestExtensions';
import { editorFunctions, type EditorFunctionGenericOutput } from './index';
import { makeFakeLaunchFunctionOptionsWithProject } from './TestHelpers';

const gd: libGDevelop = global.gd;

describe('change_object_properties_effects (effect rename, move and warnings)', () => {
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
      'MySprite',
      testSceneObjects.getObjectsCount()
    );
    const effect = object.getEffects().insertNewEffect('MySepia', 0);
    effect.setEffectType('FakeSepia');
    effect.setDoubleParameter('opacity', 0.7);
  });

  afterEach(() => {
    project.delete();
  });

  const getMySpriteEffects = () =>
    testScene
      .getObjects()
      .getObject('MySprite')
      .getEffects();

  it('renames an existing object effect', async () => {
    const result: EditorFunctionGenericOutput = await editorFunctions.change_object_properties_effects.launchFunction(
      {
        ...makeFakeLaunchFunctionOptionsWithProject(project),
        args: {
          scene_name: 'TestScene',
          object_name: 'MySprite',
          changed_effects: [
            { effect_name: 'MySepia', new_effect_name: 'NewName' },
          ],
        },
      }
    );

    expect(result.success).toBe(true);
    expect(result.message).toBe(
      'Done.\nRenamed the "MySepia" effect on object "MySprite" to "NewName".'
    );

    const effects = getMySpriteEffects();
    expect(effects.hasEffectNamed('MySepia')).toBe(false);
    expect(effects.hasEffectNamed('NewName')).toBe(true);
    // The renamed effect keeps its type and parameters.
    expect(effects.getEffect('NewName').getEffectType()).toBe('FakeSepia');
  });

  it('moves an existing object effect to a new position', async () => {
    // Add a second effect so there is something to reorder.
    const effects = getMySpriteEffects();
    const nightEffect = effects.insertNewEffect('MyNight', 1);
    nightEffect.setEffectType('FakeNight');
    expect(effects.getEffectPosition('MySepia')).toBe(0);

    const result: EditorFunctionGenericOutput = await editorFunctions.change_object_properties_effects.launchFunction(
      {
        ...makeFakeLaunchFunctionOptionsWithProject(project),
        args: {
          scene_name: 'TestScene',
          object_name: 'MySprite',
          changed_effects: [{ effect_name: 'MySepia', new_effect_position: 1 }],
        },
      }
    );

    expect(result.success).toBe(true);
    expect(result.message).toBe(
      'Done.\nMoved the "MySepia" effect on object "MySprite" to position 1.'
    );
    expect(effects.getEffectPosition('MyNight')).toBe(0);
    expect(effects.getEffectPosition('MySepia')).toBe(1);
  });

  it('warns and does not add an effect with an invalid effect type', async () => {
    const result: EditorFunctionGenericOutput = await editorFunctions.change_object_properties_effects.launchFunction(
      {
        ...makeFakeLaunchFunctionOptionsWithProject(project),
        args: {
          scene_name: 'TestScene',
          object_name: 'MySprite',
          changed_effects: [{ effect_name: 'MyGlow', effect_type: 'Bogus' }],
        },
      }
    );

    expect(result.success).toBe(false);
    expect(result.message).toBe(
      'No changes. Issues:\nEffect type "Bogus" is not a valid effect type. Effect "MyGlow" was NOT added.'
    );
    expect(getMySpriteEffects().hasEffectNamed('MyGlow')).toBe(false);
  });

  it('warns when changing properties of an effect that does not exist', async () => {
    const result: EditorFunctionGenericOutput = await editorFunctions.change_object_properties_effects.launchFunction(
      {
        ...makeFakeLaunchFunctionOptionsWithProject(project),
        args: {
          scene_name: 'TestScene',
          object_name: 'MySprite',
          changed_effects: [
            {
              effect_name: 'Nope',
              changed_properties: [
                { property_name: 'opacity', new_value: '0.5' },
              ],
            },
          ],
        },
      }
    );

    expect(result.success).toBe(false);
    expect(result.message).toBe(
      'No changes. Issues:\nEffect "Nope" not found. Skipped.'
    );
  });

  it('warns when changing a property that does not exist on the effect', async () => {
    const result: EditorFunctionGenericOutput = await editorFunctions.change_object_properties_effects.launchFunction(
      {
        ...makeFakeLaunchFunctionOptionsWithProject(project),
        args: {
          scene_name: 'TestScene',
          object_name: 'MySprite',
          changed_effects: [
            {
              effect_name: 'MySepia',
              changed_properties: [{ property_name: 'nope', new_value: '1' }],
            },
          ],
        },
      }
    );

    expect(result.success).toBe(false);
    expect(result.message).toBe(
      'No changes. Issues:\nProperty "nope" not on effect "MySepia". Skipped.'
    );
    // The existing property was not touched.
    expect(
      getMySpriteEffects()
        .getEffect('MySepia')
        .getDoubleParameter('opacity')
    ).toBe(0.7);
  });
});
