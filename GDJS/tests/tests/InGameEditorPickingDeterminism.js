// @ts-check

/**
 * Picking determinism of the in-game editor (benchmark plan, Track D).
 *
 * With a fixed scene, a fixed camera and a fixed cursor path, the instance
 * found under the cursor must be the same at every run: picking must not
 * depend on an iteration order, on a timing or on the previous interactions.
 */
describe('In-game editor picking determinism', function () {
  const pickingRunsCount = 5;

  /** @type {gdjs.RuntimeGame | null} */
  let runtimeGame = null;
  /** @type {HTMLDivElement | null} */
  let gameContainer = null;

  afterEach(() => {
    if (runtimeGame) runtimeGame.dispose(true);
    if (gameContainer) gameContainer.remove();
    runtimeGame = null;
    gameContainer = null;
  });

  /**
   * @param {string} name
   * @param {{width: number, height: number, depth: number}} size
   * @returns {ObjectData}
   */
  const createCubeObjectData = (name, size) => ({
    name,
    type: 'Scene3D::Cube3DObject',
    variables: [],
    behaviors: [],
    effects: [],
    // @ts-ignore - the content is not fully typed.
    content: size,
  });

  /**
   * @param {string} name
   * @param {string} persistentUuid
   * @param {{x: number, y: number, z: number}} position
   * @returns {InstanceData}
   */
  const createInstanceData = (name, persistentUuid, { x, y, z }) => ({
    name,
    persistentUuid,
    x,
    y,
    z,
    angle: 0,
    rotationX: 0,
    rotationY: 0,
    layer: '',
    zOrder: 0,
    customSize: false,
    width: 0,
    height: 0,
    locked: false,
    numberProperties: [],
    stringProperties: [],
    initialVariables: [],
  });

  /** @type {LayoutData} */
  const sceneData = {
    name: 'Determinism',
    mangledName: 'Determinism',
    title: '',
    r: 0,
    v: 0,
    b: 0,
    stopSoundsOnStartup: false,
    renderer3DWorldScale: 100,
    variables: [],
    behaviorsSharedData: [],
    usedResources: [],
    objectsGroups: [],
    layers: [
      {
        name: '',
        visibility: true,
        cameras: [],
        effects: [],
        ambientLightColorR: 255,
        ambientLightColorG: 255,
        ambientLightColorB: 255,
        isLightingLayer: false,
        followBaseLayerCamera: false,
        renderingType: '2d+3d',
        camera3DNearPlaneDistance: 3,
        camera3DFarPlaneDistance: 10000,
        camera3DFieldOfView: 45,
        cameraType: 'perspective',
      },
    ],
    objects: [
      createCubeObjectData('Ground', { width: 1000, height: 1000, depth: 100 }),
      createCubeObjectData('House', { width: 100, height: 100, depth: 100 }),
      createCubeObjectData('Tower', { width: 200, height: 200, depth: 300 }),
      createCubeObjectData('Rock', { width: 60, height: 60, depth: 60 }),
    ],
    instances: [
      createInstanceData('Ground', 'ground-1', { x: 0, y: 0, z: 0 }),
      createInstanceData('House', 'house-1', { x: 100, y: 100, z: 100 }),
      createInstanceData('Tower', 'tower-1', { x: -300, y: -200, z: 0 }),
      createInstanceData('Rock', 'rock-1', { x: 250, y: -250, z: 100 }),
    ],
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
  };

  /**
   * Record the instance picked at each position of the cursor path.
   * @param {gdjs.InGameEditor} inGameEditor
   * @param {Array<{x: number, y: number}>} cursorPath
   * @returns {Array<{x: number, y: number, instance: string | null}>}
   */
  const recordPickingAlongPath = (inGameEditor, cursorPath) => {
    const inputManager = inGameEditor.getRuntimeGame().getInputManager();

    return cursorPath.map(({ x, y }) => {
      inputManager.onMouseMove(x, y);
      const pickedInstance = inGameEditor.getObjectUnderCursor();
      return {
        x,
        y,
        instance: pickedInstance
          ? `${pickedInstance.getName()}|${pickedInstance.persistentUuid}`
          : null,
      };
    });
  };

  it('picks the same instance at each cursor position on 5 runs', async () => {
    const projectData = gdjs.createProjectData({ layouts: [sceneData] });
    runtimeGame = new gdjs.RuntimeGame(projectData, {
      initialRuntimeGameStatus: {
        isPaused: true,
        isInGameEdition: true,
        sceneName: 'Determinism',
        injectedExternalLayoutName: null,
        skipCreatingInstancesFromScene: false,
        eventsBasedObjectType: null,
        eventsBasedObjectVariantName: null,
        editorId: 'scene-editor',
      },
    });
    // The scene has no resources to load, and the loading screen needs images.
    runtimeGame.loadFirstAssetsAndStartBackgroundLoading = async () => {};
    gameContainer = document.createElement('div');
    document.body.appendChild(gameContainer);
    runtimeGame.getRenderer().createStandardCanvas(gameContainer);
    const inGameEditor = runtimeGame.getInGameEditor();
    if (!inGameEditor) throw new Error('The game has no in-game editor.');
    await inGameEditor.switchToSceneOrVariant(
      'scene-editor',
      'Determinism',
      null,
      null,
      null,
      null
    );

    // A fixed camera looking at the scene from the south, high enough for the
    // sky to be visible at the top of the screen.
    inGameEditor.restoreCameraState({
      cameraMode: 'orbit',
      positionX: 0,
      positionY: 0,
      positionZ: 100,
      rotationAngle: 20,
      elevationAngle: 40,
      distance: 1300,
    });
    inGameEditor.updateAndRender();
    inGameEditor.updateAndRender();
    const cameraStateBeforeRuns = inGameEditor.getCameraState();

    // The cursor path is built from the fixed scene: the top center of some
    // instances, some ground points, and screen positions in the sky. Every
    // position differs from the previous one, so the picking is always
    // recomputed instead of being read from the cache.
    const scene = inGameEditor.getCurrentScene();
    if (!scene) throw new Error('The editor has no current scene.');
    // Apply the camera of the editor (it's applied to the layers when needed).
    inGameEditor.getObjectUnderCursor();
    const threeCamera = scene.getLayer('').getRenderer().getThreeCamera();
    if (!threeCamera) throw new Error('The layer has no 3D camera.');
    threeCamera.updateMatrixWorld();
    const worldScale = scene.getRenderer3DWorldScale();
    const gameWidth = runtimeGame.getGameResolutionWidth();
    const gameHeight = runtimeGame.getGameResolutionHeight();
    const projectPoint = (x, y, z) => {
      const projected = new THREE.Vector3(
        x / worldScale,
        -y / worldScale,
        z / worldScale
      ).project(threeCamera);
      return {
        x: Math.round(((projected.x + 1) / 2) * gameWidth),
        y: Math.round(((1 - projected.y) / 2) * gameHeight),
      };
    };
    /** @type {Array<{x: number, y: number}>} */
    const cursorPath = [
      // The top center of the instances (x/y are the top-left corner of an
      // instance, and z is its bottom).
      projectPoint(150, 150, 200), // House
      projectPoint(-200, -100, 300), // Tower
      projectPoint(280, -220, 160), // Rock
      // Some points of the ground.
      { x: Math.round(gameWidth * 0.75), y: Math.round(gameHeight * 0.6) },
      { x: Math.round(gameWidth * 0.9), y: Math.round(gameHeight * 0.5) },
      // The sky.
      { x: Math.round(gameWidth * 0.5), y: Math.round(gameHeight * 0.02) },
      { x: Math.round(gameWidth * 0.02), y: Math.round(gameHeight * 0.5) },
    ];

    /** @type {Array<ReturnType<typeof recordPickingAlongPath>>} */
    const runs = [];
    for (let runIndex = 0; runIndex < pickingRunsCount; runIndex++) {
      runs.push(recordPickingAlongPath(inGameEditor, cursorPath));
    }

    // The path must be meaningful: several instances must be picked, and some
    // positions must not hit anything (the sky).
    const pickedInstances = new Set(
      runs[0]
        .map((picking) => picking.instance)
        .filter((instance) => instance !== null)
    );
    expect(pickedInstances.size).to.be.greaterThan(1);
    expect(
      runs[0].filter((picking) => picking.instance === null).length
    ).to.be.greaterThan(0);
    const pickedNames = Array.from(pickedInstances).map(
      (pickedInstance) => pickedInstance.split('|')[0]
    );
    expect(pickedNames).to.contain('House');
    expect(pickedNames).to.contain('Tower');
    expect(pickedNames).to.contain('Rock');
    expect(pickedNames).to.contain('Ground');

    // 100% of the positions must give the same instance on every run.
    for (let runIndex = 1; runIndex < pickingRunsCount; runIndex++) {
      expect(runs[runIndex]).to.eql(runs[0]);
    }

    // Picking must not move the camera.
    expect(inGameEditor.getCameraState()).to.eql(cameraStateBeforeRuns);
  });
});
