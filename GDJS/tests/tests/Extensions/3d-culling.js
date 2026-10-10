// @ts-nocheck

describe('gdjs.LayerPixiRenderer (3D culling)', () => {
  /** @param {string} name */
  const makeCubeObjectData = (name) => ({
    name,
    type: 'Scene3D::Cube3DObject',
    variables: [],
    behaviors: [],
    effects: [],
    content: {
      width: 100,
      height: 100,
      depth: 100,
      enableTextureTransparency: false,
      facesOrientation: 'Y',
      frontFaceResourceName: '',
      backFaceResourceName: '',
      backFaceUpThroughWhichAxisRotation: 'X',
      leftFaceResourceName: '',
      rightFaceResourceName: '',
      topFaceResourceName: '',
      bottomFaceResourceName: '',
      frontFaceResourceRepeat: false,
      backFaceResourceRepeat: false,
      leftFaceResourceRepeat: false,
      rightFaceResourceRepeat: false,
      topFaceResourceRepeat: false,
      bottomFaceResourceRepeat: false,
      tileScale: 1,
      frontFaceVisible: true,
      backFaceVisible: true,
      leftFaceVisible: true,
      rightFaceVisible: true,
      topFaceVisible: true,
      bottomFaceVisible: true,
      tint: '255;255;255',
      isCastingShadow: true,
      isReceivingShadow: true,
      materialType: 'Basic',
    },
  });

  const makeSceneData = (layerEffects) => ({
    layers: [
      {
        name: '',
        visibility: true,
        effects: layerEffects,
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
    objects: [makeCubeObjectData('Cube')],
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

  const sunEffectData = {
    name: 'Sun',
    effectType: 'Scene3D::DirectionalLight',
    doubleParameters: { elevation: 45, rotation: 0, intensity: 1 },
    stringParameters: { color: '255;255;255', top: 'Z+' },
    booleanParameters: { isCastingShadow: true },
  };

  let runtimeGame = null;
  let gameContainer = null;

  const makeScene = (layerEffects = []) => {
    runtimeGame = gdjs.getPixiRuntimeGame();
    gameContainer = document.createElement('div');
    document.body.appendChild(gameContainer);
    runtimeGame.getRenderer().createStandardCanvas(gameContainer);
    const runtimeScene = new gdjs.RuntimeScene(runtimeGame);
    runtimeScene.loadFromScene({
      sceneData: makeSceneData(layerEffects),
      usedExtensionsWithVariablesData: [],
    });
    return runtimeScene;
  };

  afterEach(() => {
    if (runtimeGame) runtimeGame.dispose(true);
    if (gameContainer) gameContainer.remove();
    runtimeGame = null;
    gameContainer = null;
  });

  // The camera of the 3D layer sees the area of the screen (800x600).
  const farX = 100000;

  it('hides the objects that are far from the camera, until they can be seen', () => {
    const runtimeScene = makeScene();
    const visibleCube = runtimeScene.createObject('Cube');
    visibleCube.setPosition(350, 250);
    const farCube = runtimeScene.createObject('Cube');
    farCube.setPosition(farX, 250);
    runtimeScene.renderAndStep(1000 / 60);

    expect(visibleCube.get3DRendererObject().visible).to.be(true);
    expect(farCube.get3DRendererObject().visible).to.be(false);

    farCube.setPosition(500, 250);
    runtimeScene.renderAndStep(1000 / 60);
    expect(farCube.get3DRendererObject().visible).to.be(true);
  });

  it('keeps hidden the objects hidden by the game', () => {
    const runtimeScene = makeScene();
    const cube = runtimeScene.createObject('Cube');
    cube.setPosition(farX, 250);
    runtimeScene.renderAndStep(1000 / 60);
    cube.hide();
    cube.setPosition(350, 250);
    runtimeScene.renderAndStep(1000 / 60);

    expect(cube.get3DRendererObject().visible).to.be(false);
  });

  it('keeps the objects that can cast shadows on the screen', () => {
    // Just out of the screen: it can only be hidden without shadows.
    const isCubeVisible = (layerEffects) => {
      const runtimeScene = makeScene(layerEffects);
      const cube = runtimeScene.createObject('Cube');
      cube.setPosition(900, 250);
      runtimeScene.renderAndStep(1000 / 60);
      const isVisible = cube.get3DRendererObject().visible;
      runtimeGame.dispose(true);
      gameContainer.remove();
      return isVisible;
    };
    expect(isCubeVisible([])).to.be(false);
    expect(isCubeVisible([sunEffectData])).to.be(true);

    const runtimeScene = makeScene([sunEffectData]);
    const farCube = runtimeScene.createObject('Cube');
    farCube.setPosition(farX, 250);
    runtimeScene.renderAndStep(1000 / 60);
    expect(farCube.get3DRendererObject().visible).to.be(false);
  });

  it('keeps the position of hidden objects up to date for raycasts', () => {
    const runtimeScene = makeScene();
    const cube = runtimeScene.createObject('Cube');
    cube.setPosition(farX, 250);
    runtimeScene.renderAndStep(1000 / 60);
    cube.setPosition(farX, 5000);
    runtimeScene.renderAndStep(1000 / 60);
    expect(cube.get3DRendererObject().visible).to.be(false);

    // A ray going down through the center of the cube, in Three.js coordinates.
    const layerRenderer = runtimeScene.getLayer('').getRenderer();
    const center = new THREE.Vector3(farX + 50, 5050, 1000).applyMatrix4(
      layerRenderer.getThreeGroup().matrixWorld
    );
    const raycaster = new THREE.Raycaster(center, new THREE.Vector3(0, 0, -1));
    expect(
      raycaster.intersectObject(cube.get3DRendererObject(), true).length
    ).to.be.greaterThan(0);
  });

  it("doesn't hide objects in the in-game editor", () => {
    const runtimeScene = makeScene();
    runtimeGame._isInGameEdition = true;
    const cube = runtimeScene.createObject('Cube');
    cube.setPosition(farX, 250);
    runtimeScene.renderAndStep(1000 / 60);

    expect(cube.get3DRendererObject().visible).to.be(true);
  });
});
