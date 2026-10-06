// @ts-nocheck

describe('gdjs.LayerPixiRenderer (3D post-processing)', () => {
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
    renderingType: '3d',
    camera3DNearPlaneDistance: 3,
    camera3DFarPlaneDistance: 10000,
    camera3DFieldOfView: 45,
    cameraType: 'perspective',
  });

  const makeSceneData = (layers, backgroundColor) => ({
    layers,
    variables: [],
    r: backgroundColor[0],
    v: backgroundColor[1],
    b: backgroundColor[2],
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

  const makeEffectData = (effectType, doubleParameters = {}) => ({
    name: 'My' + effectType,
    effectType,
    stringParameters: {},
    booleanParameters: {},
    doubleParameters,
  });

  // A bloom that only applies to colors brighter than what the tests render.
  const bloomEffectData = makeEffectData('Scene3D::Bloom', {
    strength: 1,
    radius: 0,
    threshold: 2,
  });
  const glowingBloomEffectData = makeEffectData('Scene3D::Bloom', {
    strength: 1,
    radius: 0.5,
    threshold: 0.5,
  });
  const depthOfFieldEffectData = makeEffectData('Scene3D::DepthOfField');
  const ambientOcclusionEffectData = makeEffectData('Scene3D::N8AO');
  const brightnessEffectData = makeEffectData(
    'Scene3D::BrightnessAndContrast',
    { brightness: 0.3, contrast: 0 }
  );
  const lowContrastEffectData = makeEffectData(
    'Scene3D::BrightnessAndContrast',
    { brightness: 0, contrast: -0.5 }
  );

  /**
   * Add a flat colored quad, positioned in "game coordinates", to the 3D
   * objects of a layer.
   */
  const addQuad = (layer, color, x, y, width, height) => {
    const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(width, height),
      new THREE.MeshBasicMaterial({ color })
    );
    mesh.position.set(x, y, 0);
    layer.getRenderer().add3DRendererObject(mesh);
    return mesh;
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

  const makeSceneWithTwoLayers = (backgroundColor = [0, 0, 255]) => {
    runtimeGame = gdjs.getPixiRuntimeGame({
      propertiesOverrides: { antialiasingMode: 'none' },
    });
    gameContainer = document.createElement('div');
    document.body.appendChild(gameContainer);
    runtimeGame.getRenderer().createStandardCanvas(gameContainer);

    const runtimeScene = new gdjs.RuntimeScene(runtimeGame);
    runtimeScene.loadFromScene({
      sceneData: makeSceneData(
        [makeLayerData(''), makeLayerData('Top')],
        backgroundColor
      ),
      usedExtensionsWithVariablesData: [],
    });
    return runtimeScene;
  };

  /**
   * The base layer has a big red quad on the left of the screen, and the
   * layer on top of it only has a small green quad in its top left corner.
   */
  const makeSceneWithOverlappingQuads = () => {
    const runtimeScene = makeSceneWithTwoLayers();
    addQuad(runtimeScene.getLayer(''), 0xff0000, 200, 300, 400, 4000);
    addQuad(runtimeScene.getLayer('Top'), 0x00ff00, 100, 100, 100, 100);
    return runtimeScene;
  };

  afterEach(() => {
    if (runtimeGame) runtimeGame.dispose(true);
    if (gameContainer) gameContainer.remove();
    runtimeGame = null;
    gameContainer = null;
  });

  it('renders the layers on top of each other', () => {
    const runtimeScene = makeSceneWithOverlappingQuads();
    runtimeScene.renderAndStep(1000 / 60);

    expect(readPixel(runtimeGame, 200, 300)).to.eql([255, 0, 0]);
    expect(readPixel(runtimeGame, 100, 100)).to.eql([0, 255, 0]);
    expect(readPixel(runtimeGame, 600, 300)).to.eql([0, 0, 255]);
  });

  [
    { name: 'a bloom', effects: [bloomEffectData] },
    { name: 'a depth of field', effects: [depthOfFieldEffectData] },
    { name: 'an ambient occlusion', effects: [ambientOcclusionEffectData] },
    {
      name: 'an ambient occlusion, a depth of field and a bloom',
      effects: [
        ambientOcclusionEffectData,
        depthOfFieldEffectData,
        bloomEffectData,
      ],
    },
  ].forEach(({ name, effects }) => {
    it(`keeps the layers below visible when a layer has ${name}`, () => {
      const runtimeScene = makeSceneWithOverlappingQuads();
      const topLayer = runtimeScene.getLayer('Top');
      effects.forEach((effectData) => topLayer.addEffect(effectData));
      expect(topLayer.getRenderer().hasPostProcessingPass()).to.be(true);

      // Render twice to check the result does not depend on the state left
      // by the previous frame.
      runtimeScene.renderAndStep(1000 / 60);
      runtimeScene.renderAndStep(1000 / 60);

      expect(readPixel(runtimeGame, 200, 300)).to.eql([255, 0, 0]);
      expect(readPixel(runtimeGame, 600, 300)).to.eql([0, 0, 255]);
      // And the object of the layer with the effect is still rendered.
      expect(readPixel(runtimeGame, 100, 100)).to.eql([0, 255, 0]);
    });
  });

  [
    {
      name: 'brightness',
      effectData: brightnessEffectData,
      expectedQuadColor: [149, 255, 149],
    },
    {
      name: 'contrast',
      effectData: lowContrastEffectData,
      expectedQuadColor: [137, 225, 137],
    },
  ].forEach(({ name, effectData, expectedQuadColor }) => {
    it(`only changes the ${name} of what is rendered on the layer`, () => {
      const runtimeScene = makeSceneWithOverlappingQuads();
      runtimeScene.getLayer('Top').addEffect(effectData);

      runtimeScene.renderAndStep(1000 / 60);

      expect(readPixel(runtimeGame, 100, 100)).to.eql(expectedQuadColor);
      expect(readPixel(runtimeGame, 200, 300)).to.eql([255, 0, 0]);
      expect(readPixel(runtimeGame, 600, 300)).to.eql([0, 0, 255]);
    });
  });

  it('keeps the background of a layer below visible when a layer has a bloom', () => {
    const runtimeScene = makeSceneWithOverlappingQuads();
    // Like a skybox, a texture used as the background of the base layer.
    const backgroundTexture = new THREE.DataTexture(
      new Uint8Array([255, 255, 0, 255]),
      1,
      1
    );
    backgroundTexture.colorSpace = THREE.SRGBColorSpace;
    backgroundTexture.needsUpdate = true;
    runtimeScene.getLayer('').getRenderer().getThreeScene().background =
      backgroundTexture;
    runtimeScene.getLayer('Top').addEffect(bloomEffectData);

    runtimeScene.renderAndStep(1000 / 60);

    expect(readPixel(runtimeGame, 600, 300)).to.eql([255, 255, 0]);
    expect(readPixel(runtimeGame, 200, 300)).to.eql([255, 0, 0]);
    expect(readPixel(runtimeGame, 100, 100)).to.eql([0, 255, 0]);
  });

  it('renders the background color of the scene on a layer with a post-processing effect', () => {
    const runtimeScene = makeSceneWithOverlappingQuads();
    runtimeScene.getLayer('').addEffect(bloomEffectData);

    runtimeScene.renderAndStep(1000 / 60);

    expect(readPixel(runtimeGame, 600, 300)).to.eql([0, 0, 255]);
    expect(readPixel(runtimeGame, 200, 300)).to.eql([255, 0, 0]);
    expect(readPixel(runtimeGame, 100, 100)).to.eql([0, 255, 0]);
  });

  it('renders a glow proportional to the strength of the bloom, on any layer', () => {
    /** @returns The intensity of the light added around a white quad. */
    const renderGlow = (layerName, strength) => {
      const runtimeScene = makeSceneWithTwoLayers([0, 0, 0]);
      const layer = runtimeScene.getLayer(layerName);
      addQuad(layer, 0xffffff, 400, 300, 200, 200);
      layer.addEffect(
        makeEffectData('Scene3D::Bloom', {
          strength,
          radius: 0.5,
          threshold: 0.5,
        })
      );
      runtimeScene.renderAndStep(1000 / 60);

      const sRGBValue = readPixel(runtimeGame, 250, 300)[0] / 255;
      runtimeGame.dispose(true);
      gameContainer.remove();
      return Math.pow((sRGBValue + 0.055) / 1.055, 2.4);
    };

    for (const layerName of ['', 'Top']) {
      const glow = renderGlow(layerName, 0.1);
      const twiceStrongerGlow = renderGlow(layerName, 0.2);
      expect(glow).to.be.greaterThan(0.01);
      expect(twiceStrongerGlow / glow).to.be.within(1.8, 2.2);
    }
    expect(renderGlow('Top', 0.2)).to.be(renderGlow('', 0.2));
  });

  it('renders a layer with a post-processing effect at the resolution of the canvas', () => {
    // The canvas is not rendered at the pixel ratio of the device: neither
    // should the effects, or the layer would be scaled (so, smoothed) when
    // it's drawn on the canvas.
    const devicePixelRatio = window.devicePixelRatio;
    Object.defineProperty(window, 'devicePixelRatio', {
      value: 2,
      configurable: true,
    });
    try {
      const runtimeScene = makeSceneWithOverlappingQuads();
      runtimeScene.getLayer('Top').addEffect(bloomEffectData);

      // This is done by the game as soon as the game resolution is updated
      // (on startup or when the window is resized).
      runtimeScene.onGameResolutionResized();
      runtimeScene.renderAndStep(1000 / 60);

      const effectComposer = runtimeScene
        .getLayer('Top')
        .getRenderer()
        .getThreeEffectComposer();
      const gl = runtimeGame.getRenderer().getThreeRenderer().getContext();
      expect(effectComposer.renderTarget1.width).to.be(gl.drawingBufferWidth);
      expect(effectComposer.renderTarget1.height).to.be(gl.drawingBufferHeight);

      // The edges of the object are not smoothed.
      expect(readPixel(runtimeGame, 149, 100)).to.eql([0, 255, 0]);
      expect(readPixel(runtimeGame, 150, 100)).to.eql(
        readPixel(runtimeGame, 170, 100)
      );
    } finally {
      Object.defineProperty(window, 'devicePixelRatio', {
        value: devicePixelRatio,
        configurable: true,
      });
    }
  });
});
