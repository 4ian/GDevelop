// @ts-check

describe('gdjs.EffectsManager', () => {
  const runtimeGame = gdjs.getPixiRuntimeGame();

  it('can add effects on a runtime object', () => {
    const runtimeScene = new gdjs.RuntimeScene(runtimeGame);
    const object = new gdjs.TestRuntimeObjectWithFakeRenderer(runtimeScene, {
      name: 'obj1',
      type: '',
      variables: [],
      behaviors: [],
      effects: [
        {
          name: 'InitialKawaseBlurEffect',
          effectType: 'KawaseBlur',
          stringParameters: {},
          booleanParameters: {},
          doubleParameters: {
            pixelizeX: 1,
            pixelizeY: 2,
            blur: 3,
            quality: 4,
          },
        },
      ],
    });
    expect(object.hasEffect('NonExistingEffect')).to.be(false);
    expect(object.hasEffect('InitialKawaseBlurEffect')).to.be(true);
    expect(object.isEffectEnabled('NonExistingEffect')).to.be(false);
    expect(object.isEffectEnabled('InitialKawaseBlurEffect')).to.be(true);

    object.enableEffect('InitialKawaseBlurEffect', false);
    expect(object.isEffectEnabled('InitialKawaseBlurEffect')).to.be(false);
    object.enableEffect('InitialKawaseBlurEffect', true);
    expect(object.isEffectEnabled('InitialKawaseBlurEffect')).to.be(true);

    object.setEffectDoubleParameter('InitialKawaseBlurEffect', 'pixelizeX', 10);
    object.setEffectStringParameter(
      'InitialKawaseBlurEffect',
      'useless',
      'will-be-ignored'
    );
    object.setEffectBooleanParameter(
      'InitialKawaseBlurEffect',
      'useless',
      true
    );

    object.addEffect({
      name: 'AddedKawaseBlurEffect',
      effectType: 'KawaseBlur',
      stringParameters: {},
      booleanParameters: {},
      doubleParameters: {
        pixelizeX: 1,
        pixelizeY: 2,
        blur: 3,
        quality: 4,
      },
    });
    expect(object.hasEffect('AddedKawaseBlurEffect')).to.be(true);
    expect(object.hasEffect('InitialKawaseBlurEffect')).to.be(true);
    expect(object.isEffectEnabled('AddedKawaseBlurEffect')).to.be(true);
    expect(object.isEffectEnabled('InitialKawaseBlurEffect')).to.be(true);
  });

  it('can add effects on a runtime layer', () => {
    const runtimeScene = new gdjs.RuntimeScene(runtimeGame);
    runtimeScene.loadFromScene({
      layers: [
        {
          name: '',
          visibility: true,
          effects: [
            {
              name: 'InitialKawaseBlurEffect',
              effectType: 'KawaseBlur',
              stringParameters: {},
              booleanParameters: {},
              doubleParameters: {
                pixelizeX: 1,
                pixelizeY: 2,
                blur: 3,
                quality: 4,
              },
            },
          ],
          cameras: [],

          ambientLightColorR: 0,
          ambientLightColorG: 0,
          ambientLightColorB: 0,
          isLightingLayer: false,
          followBaseLayerCamera: true,
        },
      ],
      variables: [],
      r: 0,
      v: 0,
      b: 0,
      mangledName: 'Scene1',
      name: 'Scene1',
      stopSoundsOnStartup: false,
      title: '',
      behaviorsSharedData: [],
      objects: [],
      instances: [],
      usedResources: [],
    });

    const runtimeLayer = runtimeScene.getLayer('');

    expect(runtimeLayer.hasEffect('NonExistingEffect')).to.be(false);
    expect(runtimeLayer.hasEffect('InitialKawaseBlurEffect')).to.be(true);
    expect(runtimeLayer.isEffectEnabled('NonExistingEffect')).to.be(false);
    expect(runtimeLayer.isEffectEnabled('InitialKawaseBlurEffect')).to.be(true);

    runtimeLayer.enableEffect('InitialKawaseBlurEffect', false);
    expect(runtimeLayer.isEffectEnabled('InitialKawaseBlurEffect')).to.be(
      false
    );
    runtimeLayer.enableEffect('InitialKawaseBlurEffect', true);
    expect(runtimeLayer.isEffectEnabled('InitialKawaseBlurEffect')).to.be(true);

    runtimeLayer.setEffectDoubleParameter(
      'InitialKawaseBlurEffect',
      'pixelizeX',
      10
    );
    runtimeLayer.setEffectStringParameter(
      'InitialKawaseBlurEffect',
      'useless',
      'will-be-ignored'
    );
    runtimeLayer.setEffectBooleanParameter(
      'InitialKawaseBlurEffect',
      'useless',
      true
    );

    runtimeLayer.addEffect({
      name: 'AddedKawaseBlurEffect',
      effectType: 'KawaseBlur',
      stringParameters: {},
      booleanParameters: {},
      doubleParameters: {
        pixelizeX: 1,
        pixelizeY: 2,
        blur: 3,
        quality: 4,
      },
    });
    expect(runtimeLayer.hasEffect('AddedKawaseBlurEffect')).to.be(true);
    expect(runtimeLayer.hasEffect('InitialKawaseBlurEffect')).to.be(true);
    expect(runtimeLayer.isEffectEnabled('AddedKawaseBlurEffect')).to.be(true);
    expect(runtimeLayer.isEffectEnabled('InitialKawaseBlurEffect')).to.be(true);
  });
});
