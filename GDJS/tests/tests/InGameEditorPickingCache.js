// @ts-check

describe('Picking result cache of the in-game editor', function () {
  /** @type {gdjs.RuntimeGame | null} */
  let runtimeGame = null;
  /** @type {HTMLDivElement | null} */
  let gameContainer = null;
  /** @type {sinon.SinonSpy | null} */
  let intersectObjectsSpy = null;

  afterEach(() => {
    if (intersectObjectsSpy) intersectObjectsSpy.restore();
    intersectObjectsSpy = null;
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
    name: 'Island',
    mangledName: 'Island',
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
    ],
    // The house stands on the ground, which is 100 pixels high.
    instances: [
      createInstanceData('Ground', 'ground-1', { x: 0, y: 0, z: 0 }),
      createInstanceData('House', 'house-1', { x: 100, y: 100, z: 100 }),
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
   * Show the island with a top-down camera centered on the house, and the
   * cursor in the middle of the screen, so that the house is under the cursor.
   * @returns {Promise<gdjs.InGameEditor>}
   */
  const createInGameEditorWithHouseUnderCursor = async () => {
    const projectData = gdjs.createProjectData({ layouts: [sceneData] });
    runtimeGame = new gdjs.RuntimeGame(projectData, {
      initialRuntimeGameStatus: {
        isPaused: true,
        isInGameEdition: true,
        sceneName: 'Island',
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
      'Island',
      null,
      null,
      null,
      null
    );

    runtimeGame
      .getInputManager()
      .onMouseMove(
        runtimeGame.getGameResolutionWidth() / 2,
        runtimeGame.getGameResolutionHeight() / 2
      );
    inGameEditor.restoreCameraState({
      cameraMode: 'orbit',
      positionX: 100,
      positionY: 100,
      positionZ: 200,
      rotationAngle: 0,
      elevationAngle: 90,
      distance: 1000,
    });
    // The first frame applies the camera to the layers, the second one picks
    // with the camera matrices of the first render: the cache of the second
    // frame is then reusable.
    inGameEditor.updateAndRender();
    inGameEditor.updateAndRender();

    return inGameEditor;
  };

  const startCountingRaycasts = () => {
    intersectObjectsSpy = sinon.spy(
      THREE.Raycaster.prototype,
      'intersectObjects'
    );
  };

  const getRaycastCount = () =>
    intersectObjectsSpy ? intersectObjectsSpy.callCount : 0;

  it('reuses the result while nothing changed', async () => {
    const inGameEditor = await createInGameEditorWithHouseUnderCursor();

    startCountingRaycasts();
    const firstPick = inGameEditor.getObjectUnderCursor();
    const secondPick = inGameEditor.getObjectUnderCursor();

    expect(firstPick).not.to.be(null);
    expect(firstPick && firstPick.getName()).to.be('House');
    expect(secondPick).to.be(firstPick);
    // The result of the last frame was reused: no raycast at all.
    expect(getRaycastCount()).to.be(0);
  });

  it('recomputes the result when the cursor moves', async () => {
    const inGameEditor = await createInGameEditorWithHouseUnderCursor();
    if (!runtimeGame) throw new Error('The game was not created.');

    const pickBeforeMoving = inGameEditor.getObjectUnderCursor();
    expect(pickBeforeMoving && pickBeforeMoving.getName()).to.be('House');

    startCountingRaycasts();
    runtimeGame
      .getInputManager()
      .onMouseMove(
        runtimeGame.getGameResolutionWidth() / 2 + 400,
        runtimeGame.getGameResolutionHeight() / 2
      );
    const pickAfterMoving = inGameEditor.getObjectUnderCursor();

    expect(getRaycastCount()).to.be.greaterThan(0);
    expect(pickAfterMoving).not.to.be(pickBeforeMoving);
  });

  it('recomputes the result when an instance moves', async () => {
    const inGameEditor = await createInGameEditorWithHouseUnderCursor();

    const pickBeforeMoving = inGameEditor.getObjectUnderCursor();
    expect(pickBeforeMoving && pickBeforeMoving.getName()).to.be('House');

    const houseInstance = sceneData.instances.filter(
      (instance) => instance.persistentUuid === 'house-1'
    )[0];
    startCountingRaycasts();
    // Move the house away, leaving the ground under the cursor.
    inGameEditor.reloadInstances([{ ...houseInstance, x: 5000, y: 5000 }]);
    // Like in the editor, the instances are moved by the next frame.
    inGameEditor.updateAndRender();
    const pickAfterMoving = inGameEditor.getObjectUnderCursor();

    expect(getRaycastCount()).to.be.greaterThan(0);
    expect(pickAfterMoving).not.to.be(pickBeforeMoving);
    expect(pickAfterMoving && pickAfterMoving.getName()).to.be('Ground');
  });
});
