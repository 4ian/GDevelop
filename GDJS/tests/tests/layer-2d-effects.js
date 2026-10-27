// @ts-nocheck

describe('gdjs.LayerPixiRenderer (2D effects)', () => {
  const makeLayerData = (renderingType) => ({
    name: '',
    visibility: true,
    effects: [],
    cameras: [],
    ambientLightColorR: 255,
    ambientLightColorG: 255,
    ambientLightColorB: 255,
    isLightingLayer: false,
    followBaseLayerCamera: false,
    renderingType,
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

  const kawaseBlurEffectData = {
    name: 'MyKawaseBlur',
    effectType: 'KawaseBlur',
    stringParameters: {},
    booleanParameters: {},
    doubleParameters: { pixelizeX: 1, pixelizeY: 1, blur: 8, quality: 4 },
  };
  // The default values of the effect.
  const gaussianBlurEffectData = {
    name: 'MyBlur',
    effectType: 'Blur',
    stringParameters: {},
    booleanParameters: {},
    doubleParameters: { blur: 8, quality: 1, resolution: 2, kernelSize: 5 },
  };

  /** Read the color of one pixel of the canvas, in "game coordinates". */
  const readPixel = (runtimeGame, x, y) => {
    const gl = runtimeGame.getRenderer().getThreeRenderer().getContext();
    const pixel = new Uint8Array(4);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.readPixels(
      x,
      gl.drawingBufferHeight - 1 - y,
      1,
      1,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      pixel
    );
    return [pixel[0], pixel[1], pixel[2]];
  };

  let runtimeGame = null;
  let gameContainer = null;

  /**
   * Render a 800x600 scene with a blue background and a layer containing
   * a green rectangle.
   */
  const renderLayerWithRectangle = (renderingType, rectangle, effectData) => {
    runtimeGame = gdjs.getPixiRuntimeGame({
      propertiesOverrides: { antialiasingMode: 'none' },
    });
    gameContainer = document.createElement('div');
    document.body.appendChild(gameContainer);
    runtimeGame.getRenderer().createStandardCanvas(gameContainer);

    const runtimeScene = new gdjs.RuntimeScene(runtimeGame);
    runtimeScene.loadFromScene({
      sceneData: makeSceneData([makeLayerData(renderingType)]),
      usedExtensionsWithVariablesData: [],
    });
    const layer = runtimeScene.getLayer('');
    const graphics = new PIXI.Graphics();
    graphics.beginFill(0x00ff00);
    graphics.drawRect(
      rectangle.x,
      rectangle.y,
      rectangle.width,
      rectangle.height
    );
    graphics.endFill();
    layer.getRenderer().getRendererObject().addChild(graphics);
    layer.addEffect(effectData);

    runtimeScene.onGameResolutionResized();
    runtimeScene.renderAndStep(1000 / 60);
  };

  afterEach(() => {
    if (runtimeGame) runtimeGame.dispose(true);
    if (gameContainer) gameContainer.remove();
    runtimeGame = null;
    gameContainer = null;
  });

  const green = [0, 255, 0];
  const blue = [0, 0, 255];

  [
    { effectName: 'Kawase blur', effectData: kawaseBlurEffectData },
    { effectName: 'Gaussian blur', effectData: gaussianBlurEffectData },
  ].forEach(({ effectName, effectData }) => {
    [
      { layerType: '2D', renderingType: '2d' },
      { layerType: '2D+3D', renderingType: '' },
    ].forEach(({ layerType, renderingType }) => {
      describe(`${effectName} on a ${layerType} layer`, () => {
        it('has no seam on the edges of the screen when the layer does not cover the whole screen', () => {
          renderLayerWithRectangle(
            renderingType,
            { x: 100, y: 100, width: 1000, height: 800 },
            effectData
          );

          expect(readPixel(runtimeGame, 400, 300)).to.eql(green);
          expect(readPixel(runtimeGame, 799, 300)).to.eql(green);
          expect(readPixel(runtimeGame, 400, 599)).to.eql(green);
          expect(readPixel(runtimeGame, 799, 599)).to.eql(green);
          // The part of the screen that the layer does not cover is untouched.
          expect(readPixel(runtimeGame, 0, 0)).to.eql(blue);
        });

        [
          {
            name: 'covers exactly the screen',
            rectangle: { x: 0, y: 0, width: 800, height: 600 },
          },
          {
            name: 'is bigger than the screen',
            rectangle: { x: -100, y: -100, width: 1200, height: 1000 },
          },
        ].forEach(({ name, rectangle }) => {
          it(`has no seam on the edges of the screen when the layer ${name}`, () => {
            renderLayerWithRectangle(renderingType, rectangle, effectData);

            expect(readPixel(runtimeGame, 400, 300)).to.eql(green);
            expect(readPixel(runtimeGame, 0, 300)).to.eql(green);
            expect(readPixel(runtimeGame, 799, 300)).to.eql(green);
            expect(readPixel(runtimeGame, 400, 0)).to.eql(green);
            expect(readPixel(runtimeGame, 400, 599)).to.eql(green);
            expect(readPixel(runtimeGame, 0, 0)).to.eql(green);
            expect(readPixel(runtimeGame, 799, 599)).to.eql(green);
          });
        });

        it('blurs the borders of what is inside the screen', () => {
          renderLayerWithRectangle(
            renderingType,
            { x: 0, y: 0, width: 400, height: 600 },
            effectData
          );

          expect(readPixel(runtimeGame, 300, 300)).to.eql(green);
          expect(readPixel(runtimeGame, 500, 300)).to.eql(blue);
          const borderColor = readPixel(runtimeGame, 400, 300);
          expect(borderColor[1]).to.be.within(50, 200);
          expect(borderColor[2]).to.be.within(50, 200);
        });
      });
    });
  });
});
