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

  const bloomEffectData = {
    name: 'MyBloom',
    effectType: 'Scene3D::Bloom',
    stringParameters: {},
    booleanParameters: {},
    doubleParameters: { strength: 1, radius: 0, threshold: 0 },
  };

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
      gl.drawingBufferHeight - y,
      1,
      1,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      pixel
    );
    return [pixel[0], pixel[1], pixel[2]];
  };

  const makeSceneWithTwoLayers = () => {
    const runtimeGame = gdjs.getPixiRuntimeGame({
      propertiesOverrides: { antialiasingMode: 'none' },
    });
    const gameContainer = document.createElement('div');
    document.body.appendChild(gameContainer);
    runtimeGame.getRenderer().createStandardCanvas(gameContainer);

    const runtimeScene = new gdjs.RuntimeScene(runtimeGame);
    runtimeScene.loadFromScene({
      sceneData: makeSceneData([makeLayerData(''), makeLayerData('Top')]),
      usedExtensionsWithVariablesData: [],
    });

    // The base layer has a big red quad on the left of the screen, and the
    // layer on top of it only has a small green quad in its top left corner.
    addQuad(runtimeScene.getLayer(''), 0xff0000, 200, 300, 400, 4000);
    addQuad(runtimeScene.getLayer('Top'), 0x00ff00, 100, 100, 100, 100);

    return { runtimeGame, runtimeScene, gameContainer };
  };

  it('renders the layers on top of each other', () => {
    const { runtimeGame, runtimeScene, gameContainer } =
      makeSceneWithTwoLayers();
    runtimeScene.renderAndStep(1000 / 60);

    expect(readPixel(runtimeGame, 200, 300)).to.eql([255, 0, 0]);
    expect(readPixel(runtimeGame, 100, 100)).to.eql([0, 255, 0]);
    expect(readPixel(runtimeGame, 600, 300)).to.eql([0, 0, 255]);

    runtimeGame.dispose(true);
    gameContainer.remove();
  });

  it('keeps the layers below visible when a layer has a post-processing effect', () => {
    const { runtimeGame, runtimeScene, gameContainer } =
      makeSceneWithTwoLayers();
    const topLayer = runtimeScene.getLayer('Top');
    topLayer.addEffect(bloomEffectData);
    expect(topLayer.getRenderer().hasPostProcessingPass()).to.be(true);

    runtimeScene.renderAndStep(1000 / 60);

    // The layers below are still visible where the layer with the effect is
    // empty (the bloom of the green quad is added on top of them).
    expect(readPixel(runtimeGame, 200, 300)[0]).to.be.greaterThan(200);
    expect(readPixel(runtimeGame, 600, 300)[2]).to.be.greaterThan(200);
    // And the object of the layer with the effect is still rendered.
    expect(readPixel(runtimeGame, 100, 100)[1]).to.be.greaterThan(200);

    runtimeGame.dispose(true);
    gameContainer.remove();
  });

  it('renders the background color of the scene on a layer with a post-processing effect', () => {
    const { runtimeGame, runtimeScene, gameContainer } =
      makeSceneWithTwoLayers();
    runtimeScene.getLayer('').addEffect(bloomEffectData);

    runtimeScene.renderAndStep(1000 / 60);

    expect(readPixel(runtimeGame, 600, 300)[2]).to.be.greaterThan(200);
    expect(readPixel(runtimeGame, 200, 300)[0]).to.be.greaterThan(200);

    runtimeGame.dispose(true);
    gameContainer.remove();
  });

  it('renders a layer with a post-processing effect at the resolution of the canvas', () => {
    const { runtimeGame, runtimeScene, gameContainer } =
      makeSceneWithTwoLayers();
    runtimeScene.getLayer('Top').addEffect(bloomEffectData);

    // This is done by the game as soon as the game resolution is updated
    // (on startup or when the window is resized).
    runtimeScene.onGameResolutionResized();
    runtimeScene.renderAndStep(1000 / 60);

    const threeRenderer = runtimeGame.getRenderer().getThreeRenderer();
    const effectComposer = runtimeScene
      .getLayer('Top')
      .getRenderer()
      .getThreeEffectComposer();
    const gl = threeRenderer.getContext();

    expect(effectComposer.renderTarget1.width).to.be(gl.drawingBufferWidth);
    expect(effectComposer.renderTarget1.height).to.be(gl.drawingBufferHeight);

    runtimeGame.dispose(true);
    gameContainer.remove();
  });
});
