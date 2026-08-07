// @flow
import { makeTestExtensions } from '../fixtures/TestExtensions';
import { editorFunctions, type EditorFunctionGenericOutput } from './index';
import { makeFakeLaunchFunctionOptionsWithProject } from './TestHelpers';

const gd: libGDevelop = global.gd;

describe('inspect_scene_properties_layers_effects', () => {
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

  it('returns the scene properties, game properties, layers and their effects', async () => {
    project.setName('My Game');
    project.setGameResolutionSize(1280, 720);
    project.setFirstLayout('TestScene');
    testScene.setBackgroundColor(255, 0, 128);
    testScene.insertNewLayer('UI', 1);
    const uiLayer = testScene.getLayer('UI');
    uiLayer.setVisibility(false);
    const effect = uiLayer.getEffects().insertNewEffect('MyNight', 0);
    effect.setEffectType('FakeNight');
    effect.setDoubleParameter('intensity', 0.5);

    const result: EditorFunctionGenericOutput = await editorFunctions.inspect_scene_properties_layers_effects.launchFunction(
      {
        ...makeFakeLaunchFunctionOptionsWithProject(project),
        args: { scene_name: 'TestScene' },
      }
    );

    expect(result.success).toBe(true);
    expect(result.propertiesLayersEffectsForSceneNamed).toBe('TestScene');
    expect(result.properties).toEqual(
      expect.objectContaining({
        name: 'TestScene',
        backgroundColor: '#ff0080',
        isFirstScene: true,
        gameResolutionWidth: 1280,
        gameResolutionHeight: 720,
        gameName: 'My Game',
      })
    );
    const layers = result.layers || [];
    expect(layers).toHaveLength(2);
    expect(layers[0]).toEqual(
      expect.objectContaining({
        name: '',
        position: 0,
        visible: true,
        effects: [],
      })
    );
    expect(layers[1]).toEqual(
      expect.objectContaining({
        name: 'UI',
        position: 1,
        visible: false,
      })
    );
    expect(layers[1].effects).toEqual([
      expect.objectContaining({
        effectName: 'MyNight',
        effectType: 'FakeNight',
      }),
    ]);
    // The set property value is reported, among the other (default) properties.
    expect(layers[1].effects[0].effectProperties).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: 'intensity', value: 0.5 }),
      ])
    );
  });

  it('reports the first scene of the project as the startup scene when firstLayout is not set', async () => {
    // `firstLayout` is empty on a fresh project: at runtime, the first scene
    // of the project is then used as the startup scene.
    project.insertNewLayout('OtherScene', 1);

    const firstSceneResult: EditorFunctionGenericOutput = await editorFunctions.inspect_scene_properties_layers_effects.launchFunction(
      {
        ...makeFakeLaunchFunctionOptionsWithProject(project),
        args: { scene_name: 'TestScene' },
      }
    );
    expect(
      firstSceneResult.properties && firstSceneResult.properties.isFirstScene
    ).toBe(true);

    const otherSceneResult: EditorFunctionGenericOutput = await editorFunctions.inspect_scene_properties_layers_effects.launchFunction(
      {
        ...makeFakeLaunchFunctionOptionsWithProject(project),
        args: { scene_name: 'OtherScene' },
      }
    );
    expect(
      otherSceneResult.properties && otherSceneResult.properties.isFirstScene
    ).toBe(false);
  });

  it('reports the startup scene according to firstLayout when it is set', async () => {
    project.insertNewLayout('OtherScene', 1);
    project.setFirstLayout('OtherScene');

    const firstSceneResult: EditorFunctionGenericOutput = await editorFunctions.inspect_scene_properties_layers_effects.launchFunction(
      {
        ...makeFakeLaunchFunctionOptionsWithProject(project),
        args: { scene_name: 'TestScene' },
      }
    );
    expect(
      firstSceneResult.properties && firstSceneResult.properties.isFirstScene
    ).toBe(false);

    const otherSceneResult: EditorFunctionGenericOutput = await editorFunctions.inspect_scene_properties_layers_effects.launchFunction(
      {
        ...makeFakeLaunchFunctionOptionsWithProject(project),
        args: { scene_name: 'OtherScene' },
      }
    );
    expect(
      otherSceneResult.properties && otherSceneResult.properties.isFirstScene
    ).toBe(true);
  });

  it('falls back to the first scene when firstLayout names a missing scene', async () => {
    project.setFirstLayout('DeletedScene');

    const result: EditorFunctionGenericOutput = await editorFunctions.inspect_scene_properties_layers_effects.launchFunction(
      {
        ...makeFakeLaunchFunctionOptionsWithProject(project),
        args: { scene_name: 'TestScene' },
      }
    );
    expect(result.properties && result.properties.isFirstScene).toBe(true);
  });

  it('fails when the scene does not exist and lists the scenes', async () => {
    const result: EditorFunctionGenericOutput = await editorFunctions.inspect_scene_properties_layers_effects.launchFunction(
      {
        ...makeFakeLaunchFunctionOptionsWithProject(project),
        args: { scene_name: 'MissingScene' },
      }
    );

    expect(result.success).toBe(false);
    expect(result.message).toBe(
      'Scene not found: "MissingScene". Scenes in this project: "TestScene".'
    );
  });
});
