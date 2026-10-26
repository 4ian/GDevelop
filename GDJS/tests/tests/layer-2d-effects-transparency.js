// @ts-nocheck

/**
 * The effects of a scene layer are applied on the whole screen: effects adding
 * noise must only change the pixels inside the bounds of the layer content,
 * or they show on top of the layers below even when the layer is empty.
 */
describe('gdjs.LayerPixiRenderer (2D effects on transparent pixels)', () => {
  const makeLayerData = (name) => ({
    name,
    visibility: true,
    effects: [],
    cameras: [],
    ambientLightColorR: 255,
    ambientLightColorG: 255,
    ambientLightColorB: 255,
    isLightingLayer: false,
    followBaseLayerCamera: false,
    renderingType: '',
    camera3DNearPlaneDistance: 3,
    camera3DFarPlaneDistance: 10000,
    camera3DFieldOfView: 45,
    cameraType: 'perspective',
  });

  const makeSceneData = (layers) => ({
    layers,
    variables: [],
    r: 0,
    v: 0,
    b: 255,
    mangledName: 'Scene1',
    name: 'Scene1',
    stopSoundsOnStartup: false,
    title: '',
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
  });

  // The default values of the effects (see Extensions/Effects/JsExtension.js).
  const crtEffectData = {
    name: 'MyCRT',
    effectType: 'CRT',
    stringParameters: {},
    booleanParameters: { verticalLine: false },
    doubleParameters: {
      lineWidth: 1,
      lineContrast: 0.25,
      noise: 0.3,
      curvature: 1,
      noiseSize: 1,
      vignetting: 0.3,
      vignettingAlpha: 1,
      vignettingBlur: 0.3,
      animationSpeed: 1,
      animationFrequency: 60,
      padding: 0,
    },
  };
  const oldFilmEffectData = {
    name: 'MyOldFilm',
    effectType: 'OldFilm',
    stringParameters: {},
    booleanParameters: {},
    doubleParameters: {
      sepia: 0.3,
      noise: 0.3,
      noiseSize: 1,
      scratch: 0.5,
      scratchDensity: 0.3,
      scratchWidth: 1,
      vignetting: 0.3,
      vignettingAlpha: 1,
      vignettingBlur: 0.3,
      animationFrequency: 60,
    },
  };

  let runtimeGame = null;
  let gameContainer = null;

  afterEach(() => {
    if (runtimeGame) runtimeGame.dispose(true);
    if (gameContainer) gameContainer.remove();
    runtimeGame = null;
    gameContainer = null;
  });

  /**
   * Render a 800x600 scene with a blue background, an empty base layer and
   * a layer with the effect, containing the given green rectangles.
   * @returns the pixels sampled on a grid covering the screen.
   */
  const renderAndSamplePixels = (effectData, rectangles) => {
    runtimeGame = gdjs.getPixiRuntimeGame({
      propertiesOverrides: { antialiasingMode: 'none' },
    });
    gameContainer = document.createElement('div');
    document.body.appendChild(gameContainer);
    runtimeGame.getRenderer().createStandardCanvas(gameContainer);

    const runtimeScene = new gdjs.RuntimeScene(runtimeGame);
    runtimeScene.loadFromScene({
      sceneData: makeSceneData([makeLayerData(''), makeLayerData('Effects')]),
      usedExtensionsWithVariablesData: [],
    });
    const layer = runtimeScene.getLayer('Effects');
    const graphics = new PIXI.Graphics();
    graphics.beginFill(0x00ff00);
    for (const { x, y, width, height } of rectangles) {
      graphics.drawRect(x, y, width, height);
    }
    graphics.endFill();
    layer.getRenderer().getRendererObject().addChild(graphics);
    layer.addEffect(effectData);

    runtimeScene.onGameResolutionResized();
    runtimeScene.renderAndStep(1000 / 60);

    const gl = runtimeGame.getRenderer().getThreeRenderer().getContext();
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    const width = gl.drawingBufferWidth;
    const height = gl.drawingBufferHeight;
    const pixels = new Uint8Array(width * height * 4);
    gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);

    const sampledPixels = [];
    for (let y = 5; y < height; y += 10) {
      for (let x = 5; x < width; x += 10) {
        const i = (y * width + x) * 4;
        sampledPixels.push({
          x,
          color: [pixels[i], pixels[i + 1], pixels[i + 2]],
        });
      }
    }
    return sampledPixels;
  };

  const leftHalf = { x: 0, y: 0, width: 400, height: 600 };
  const bottomRightDot = { x: 796, y: 596, width: 4, height: 4 };
  const isOnLeftHalf = ({ x }) => x < 400;
  const isOnRightHalf = ({ x }) => x >= 400;

  const isColor = (color, expectedColor) =>
    color[0] === expectedColor[0] &&
    color[1] === expectedColor[1] &&
    color[2] === expectedColor[2];

  const blue = [0, 0, 255];
  const green = [0, 255, 0];

  [
    { effectName: 'CRT', effectData: crtEffectData },
    { effectName: 'Old film', effectData: oldFilmEffectData },
  ].forEach(({ effectName, effectData }) => {
    describe(effectName, () => {
      it('does not change the layers below when the layer is empty', () => {
        const sampledPixels = renderAndSamplePixels(effectData, []);

        const changedPixels = sampledPixels.filter(
          ({ color }) => !isColor(color, blue)
        );
        expect(changedPixels.length).to.be(0);
      });

      it('adds noise on what the layer contains', () => {
        const sampledPixels = renderAndSamplePixels(effectData, [
          { x: 0, y: 0, width: 800, height: 600 },
        ]);

        const changedPixels = sampledPixels.filter(
          ({ color }) => !isColor(color, green)
        );
        expect(changedPixels.length).to.be.above(sampledPixels.length / 10);
      });

      it('adds noise on the transparent pixels inside the bounds of the layer content', () => {
        const sampledPixels = renderAndSamplePixels(effectData, [
          leftHalf,
          bottomRightDot,
        ]);

        const rightHalfPixels = sampledPixels.filter(isOnRightHalf);
        const changedPixels = rightHalfPixels.filter(
          ({ color }) => !isColor(color, blue)
        );
        expect(changedPixels.length).to.be.above(rightHalfPixels.length / 10);
      });

      it('does not change the pixels outside the bounds of the layer content', () => {
        const sampledPixels = renderAndSamplePixels(effectData, [leftHalf]);

        const leftHalfPixels = sampledPixels.filter(isOnLeftHalf);
        const changedLeftPixels = leftHalfPixels.filter(
          ({ color }) => !isColor(color, green)
        );
        expect(changedLeftPixels.length).to.be.above(
          leftHalfPixels.length / 10
        );
        const changedRightPixels = sampledPixels
          .filter(isOnRightHalf)
          .filter(({ color }) => !isColor(color, blue));
        expect(changedRightPixels.length).to.be(0);
      });
    });
  });
});
