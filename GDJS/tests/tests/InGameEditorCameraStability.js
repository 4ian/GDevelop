// @ts-check

/**
 * Camera stability of the in-game editor (benchmark plan, Track D).
 *
 * These tests are the success criterion of the camera work: while the editor
 * is shown, moving its camera must not change the cameras of the layers, and a
 * Play then Stop round-trip must give every layer back its own camera.
 *
 * They currently fail: `EditorCamera.updateCamera` writes the editor camera
 * into every layer camera at each editor frame, so the layers never keep their
 * own camera.
 */
describe('In-game editor camera stability', function () {
  // Cameras are compared with this tolerance, to ignore float noise.
  const cameraEpsilon = 1e-3;

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

  const layerNames = ['', 'BackgroundObjects', 'ForegroundObjects'];

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
   * @param {string} layer
   * @returns {InstanceData}
   */
  const createInstanceData = (name, persistentUuid, { x, y, z }, layer) => ({
    name,
    persistentUuid,
    x,
    y,
    z,
    angle: 0,
    rotationX: 0,
    rotationY: 0,
    layer,
    zOrder: 0,
    customSize: false,
    width: 0,
    height: 0,
    locked: false,
    numberProperties: [],
    stringProperties: [],
    initialVariables: [],
  });

  /** @type {LayerData} */
  const layerData = {
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
  };

  /** @type {LayoutData} */
  const sceneData = {
    name: 'ThreeLayers',
    mangledName: 'ThreeLayers',
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
    layers: layerNames.map((name) => ({ ...layerData, name })),
    objects: [
      createCubeObjectData('Ground', { width: 1000, height: 1000, depth: 100 }),
      createCubeObjectData('Background', {
        width: 200,
        height: 200,
        depth: 200,
      }),
      createCubeObjectData('Foreground', {
        width: 100,
        height: 100,
        depth: 100,
      }),
    ],
    instances: [
      createInstanceData('Ground', 'ground-1', { x: 0, y: 0, z: 0 }, ''),
      createInstanceData(
        'Background',
        'background-1',
        { x: 200, y: 0, z: 0 },
        'BackgroundObjects'
      ),
      createInstanceData(
        'Foreground',
        'foreground-1',
        { x: 0, y: 200, z: 0 },
        'ForegroundObjects'
      ),
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
   * Show the scene with 3 layers, each one having its own camera.
   * The cameras are set before the first editor frame, as if the game had
   * already moved them with events.
   * @returns {Promise<{
   *   inGameEditor: gdjs.InGameEditor,
   *   scene: gdjs.RuntimeScene,
   *   initialCameras: {[layerName: string]: {[stateName: string]: number}},
   * }>}
   */
  const createEditorWithDistinctLayerCameras = async () => {
    const projectData = gdjs.createProjectData({ layouts: [sceneData] });
    runtimeGame = new gdjs.RuntimeGame(projectData, {
      initialRuntimeGameStatus: {
        isPaused: true,
        isInGameEdition: true,
        sceneName: 'ThreeLayers',
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
      'ThreeLayers',
      null,
      null,
      null,
      null
    );
    const scene = inGameEditor.getCurrentScene();
    if (!scene) throw new Error('The editor has no current scene.');

    // Give each layer its own camera, before the editor applies its own.
    layerNames.forEach((layerName, index) => {
      const layer = scene.getLayer(layerName);
      layer.setCameraX(100 + index * 250);
      layer.setCameraY(50 + index * 100);
      layer.setCameraZ(10 + index * 5, 45);
      layer.setCameraRotation(5 + index * 10);
      layer.setCameraRotationX(2 + index * 3);
      layer.setCameraRotationY(1 + index * 2);
      layer.setCameraZoom(1 + index * 0.25);
    });

    return { inGameEditor, scene, initialCameras: getLayerCameraStates(scene) };
  };

  /**
   * @param {number} value
   * @returns {number}
   */
  const roundCameraValue = (value) =>
    Math.round(value * (1 / cameraEpsilon)) / (1 / cameraEpsilon);

  /**
   * @param {gdjs.RuntimeScene} scene
   * @returns {{[layerName: string]: {[stateName: string]: number}}}
   */
  const getLayerCameraStates = (scene) => {
    /** @type {{[layerName: string]: {[stateName: string]: number}}} */
    const states = {};
    for (const layerName of layerNames) {
      const layer = scene.getLayer(layerName);
      states[layerName] = {
        x: roundCameraValue(layer.getCameraX()),
        y: roundCameraValue(layer.getCameraY()),
        z: roundCameraValue(layer.getCameraZ(45)),
        rotation: roundCameraValue(layer.getCameraRotation()),
        rotationX: roundCameraValue(layer.getCameraRotationX()),
        rotationY: roundCameraValue(layer.getCameraRotationY()),
        zoom: roundCameraValue(layer.getCameraZoom()),
      };
    }
    return states;
  };

  /**
   * Move the editor camera the 3 ways it can be moved: orbit, pan and zoom.
   * @param {gdjs.InGameEditor} inGameEditor
   */
  const moveEditorCamera = (inGameEditor) => {
    const initialState = inGameEditor.getCameraState();

    // Orbit.
    inGameEditor.restoreCameraState({
      ...initialState,
      rotationAngle: initialState.rotationAngle + 30,
      elevationAngle: initialState.elevationAngle - 15,
    });
    inGameEditor.updateAndRender();

    // Pan.
    const orbitedState = inGameEditor.getCameraState();
    inGameEditor.restoreCameraState({
      ...orbitedState,
      positionX: orbitedState.positionX + 300,
      positionY: orbitedState.positionY + 200,
    });
    inGameEditor.updateAndRender();

    // Zoom.
    const pannedState = inGameEditor.getCameraState();
    inGameEditor.restoreCameraState({
      ...pannedState,
      distance: pannedState.distance * 0.5,
    });
    inGameEditor.updateAndRender();
  };

  it('keeps the cameras of every layer untouched while the editor camera moves', async () => {
    const { inGameEditor, scene, initialCameras } =
      await createEditorWithDistinctLayerCameras();

    // The layers really have different cameras.
    expect(initialCameras[''].x).not.to.be(
      initialCameras['BackgroundObjects'].x
    );
    expect(initialCameras['BackgroundObjects'].zoom).not.to.be(
      initialCameras['ForegroundObjects'].zoom
    );

    moveEditorCamera(inGameEditor);

    // Moving the editor camera is not a request to move the cameras of the
    // layers: none of them must have changed.
    expect(getLayerCameraStates(scene)).to.eql(initialCameras);
  });

  it('gives every layer its own camera back after a Play then Stop round-trip', async () => {
    const { inGameEditor, scene, initialCameras } =
      await createEditorWithDistinctLayerCameras();
    if (!runtimeGame) throw new Error('The game was not created.');

    moveEditorCamera(inGameEditor);

    // Play: the game renderer must use the cameras of the layers.
    runtimeGame.pause(false);
    expect(runtimeGame.isPaused()).to.be(false);
    scene.render();
    expect(getLayerCameraStates(scene)).to.eql(initialCameras);

    // Stop: the editor is shown again, still with the cameras of the layers.
    runtimeGame.pause(true);
    expect(runtimeGame.isPaused()).to.be(true);
    inGameEditor.updateAndRender();
    expect(getLayerCameraStates(scene)).to.eql(initialCameras);
  });
});
