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
    runtimeScene.loadFromScene({sceneData: {
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
            renderer3DWorldScale: 100,
      behaviorsSharedData: [],
      objects: [],
      objectsGroups: [],
      instances: [],
      usedResources: [],
      uiSettings: {
        grid: false,
        gridType: 'rectangular',
        gridWidth: 10,
        gridHeight: 10,
        gridDepth: 10,
        gridOffsetX: 0,
        gridOffsetY: 0,
        gridOffsetZ: 0,
        gridColor: 0,
        gridAlpha: 1,
        snap: false,
      }
    }, usedExtensionsWithVariablesData: []});

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
  describe('post-processing passes of a 3D layer', () => {
    /** @type {Map<THREE_ADDONS.Pass, string>} */
    const effectNamesByPass = new Map();

    /** @type {gdjs.PixiFiltersTools.FilterCreator} */
    const postProcessingFilterCreator = {
      makeFilter: (target, effectData) => {
        const pass = new THREE_ADDONS.ShaderPass(
          THREE_ADDONS.BrightnessContrastShader
        );
        effectNamesByPass.set(pass, effectData.name);
        let isEnabled = false;
        /** @type {gdjs.PixiFiltersTools.Filter} */
        const filter = {
          isEnabled: () => isEnabled,
          setEnabled: (target, enabled) =>
            enabled ? filter.applyEffect(target) : filter.removeEffect(target),
          applyEffect: (target) => {
            if (!(target instanceof gdjs.Layer)) return false;
            target
              .getRenderer()
              .addPostProcessingPass(pass, effectData.name);
            isEnabled = true;
            return true;
          },
          removeEffect: (target) => {
            if (!(target instanceof gdjs.Layer)) return false;
            target.getRenderer().removePostProcessingPass(pass);
            isEnabled = false;
            return true;
          },
          updatePreRender: () => {},
          updateDoubleParameter: () => {},
          getDoubleParameter: () => 0,
          updateStringParameter: () => {},
          updateColorParameter: () => {},
          getColorParameter: () => 0,
          updateBooleanParameter: () => {},
          getNetworkSyncData: () => ({}),
          updateFromNetworkSyncData: () => {},
        };
        return filter;
      },
    };
    gdjs.PixiFiltersTools.registerFilterCreator(
      'Test::PostProcessing',
      postProcessingFilterCreator
    );

    /**
     * @param {string} name
     * @param {boolean} [disabled]
     * @returns {EffectData}
     */
    const makeEffectData = (name, disabled = false) => ({
      name,
      effectType: 'Test::PostProcessing',
      disabled,
      stringParameters: {},
      booleanParameters: {},
      doubleParameters: {},
    });

    /**
     * @param {EffectData[]} effects
     * @returns {gdjs.Layer}
     */
    const make3DLayerWithEffects = (effects) => {
      const runtimeGame = gdjs.getPixiRuntimeGame();
      runtimeGame
        .getRenderer()
        .createStandardCanvas(document.createElement('div'));
      const runtimeScene = new gdjs.RuntimeScene(runtimeGame);
      runtimeScene.loadFromScene({
        sceneData: {
          layers: [
            {
              name: '',
              renderingType: '3d',
              visibility: true,
              effects,
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
          renderer3DWorldScale: 100,
          behaviorsSharedData: [],
          objects: [],
          objectsGroups: [],
          instances: [],
          usedResources: [],
          uiSettings: {
            grid: false,
            gridType: 'rectangular',
            gridWidth: 10,
            gridHeight: 10,
            gridDepth: 10,
            gridOffsetX: 0,
            gridOffsetY: 0,
            gridOffsetZ: 0,
            gridColor: 0,
            gridAlpha: 1,
            snap: false,
          },
        },
        usedExtensionsWithVariablesData: [],
      });
      // @ts-ignore - The base layer is a gdjs.Layer.
      return runtimeScene.getLayer('');
    };

    /**
     * @param {gdjs.Layer} layer
     * @returns {string[]} The names of the passes after the scene rendering.
     */
    const getPostProcessingPassNames = (layer) => {
      const composer = layer.getRenderer().getThreeEffectComposer();
      if (!composer) throw new Error('The layer has no effect composer.');
      expect(
        composer.passes[composer.passes.length - 1] instanceof
          THREE_ADDONS.OutputPass
      ).to.be(true);
      return composer.passes
        .slice(1)
        .filter((pass) => effectNamesByPass.has(pass))
        .map((pass) => effectNamesByPass.get(pass) || '');
    };

    it('applies the passes in the order of the effects', () => {
      const layer = make3DLayerWithEffects([
        makeEffectData('First', true),
        makeEffectData('Second'),
        makeEffectData('Third'),
      ]);
      expect(getPostProcessingPassNames(layer)).to.eql(['Second', 'Third']);

      layer.enableEffect('First', true);
      expect(getPostProcessingPassNames(layer)).to.eql([
        'First',
        'Second',
        'Third',
      ]);

      layer.enableEffect('Second', false);
      layer.enableEffect('Second', true);
      expect(getPostProcessingPassNames(layer)).to.eql([
        'First',
        'Second',
        'Third',
      ]);

      layer.setEffectsOrder(['Third', 'First', 'Second']);
      expect(getPostProcessingPassNames(layer)).to.eql([
        'Third',
        'First',
        'Second',
      ]);

      layer.addEffect(makeEffectData('AddedLater'));
      expect(getPostProcessingPassNames(layer)).to.eql([
        'Third',
        'First',
        'Second',
        'AddedLater',
      ]);

      layer.removeEffect('First');
      layer.removeEffect('Second');
      layer.removeEffect('Third');
      layer.removeEffect('AddedLater');
      expect(getPostProcessingPassNames(layer)).to.eql([]);
      expect(layer.getRenderer().hasPostProcessingPass()).to.be(false);
    });
  });
});
