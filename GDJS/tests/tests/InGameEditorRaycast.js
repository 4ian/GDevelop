// @ts-check

describe('gdjs.InGameEditor.raycast', function () {
  /** @type {gdjs.RuntimeGame | null} */
  let runtimeGame = null;
  /** @type {HTMLDivElement | null} */
  let gameContainer = null;

  before(async () => {
    await new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = '/in-game-editor.js';
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  });

  after(() => {
    // The in-game editor replaces the objects of unknown types.
    gdjs.registerObject('', gdjs.RuntimeObject);
  });

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

  /** @returns {Promise<gdjs.InGameEditor>} */
  const createInGameEditorShowingIsland = async () => {
    runtimeGame = new gdjs.RuntimeGame(
      gdjs.createProjectData({ layouts: [sceneData] }),
      {
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
      }
    );
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
    return inGameEditor;
  };

  /**
   * @param {number} x
   * @param {number} y
   * @returns {gdjs.InGameEditorRay}
   */
  const createDownwardRay = (x, y) => ({
    from: [x, y, 10000],
    to: [x, y, -10000],
  });

  /**
   * @param {Partial<gdjs.InGameEditorRaycastRequest>} request
   * @returns {gdjs.InGameEditorRaycastRequest}
   */
  const createRaycastRequest = (request) => ({
    rays: [],
    mode: '3d',
    includedObjectNames: null,
    excludedObjectNames: [],
    excludedInstanceUuids: [],
    ...request,
  });

  /**
   * @param {gdjs.InGameEditorRaycastHit | null} hit
   * @returns {gdjs.InGameEditorRaycastHit | null}
   */
  const roundHit = (hit) =>
    hit && {
      ...hit,
      x: Math.round(hit.x),
      y: Math.round(hit.y),
      z: Math.round(hit.z),
    };

  it('gives the first instance hit by each ray, and the scene shown', async () => {
    const inGameEditor = await createInGameEditorShowingIsland();

    const result = inGameEditor.raycast(
      createRaycastRequest({
        rays: [
          createDownwardRay(150, 150),
          createDownwardRay(500, 500),
          createDownwardRay(2000, 2000),
        ],
      })
    );

    expect(result.editedLocation).to.eql({
      sceneName: 'Island',
      externalLayoutName: null,
      eventsBasedObjectType: null,
      eventsBasedObjectVariantName: null,
    });
    expect(result.hits.map(roundHit)).to.eql([
      { x: 150, y: 150, z: 200, objectName: 'House', instanceUuid: 'house-1' },
      {
        x: 500,
        y: 500,
        z: 100,
        objectName: 'Ground',
        instanceUuid: 'ground-1',
      },
      null,
    ]);
  });

  it('only hits the included objects, and not the excluded ones', async () => {
    const inGameEditor = await createInGameEditorShowingIsland();
    /** @param {Partial<gdjs.InGameEditorRaycastRequest>} filters */
    const getObjectNameHit = (filters) => {
      const [hit] = inGameEditor.raycast(
        createRaycastRequest({
          rays: [createDownwardRay(150, 150)],
          ...filters,
        })
      ).hits;
      return hit ? hit.objectName : null;
    };

    expect(getObjectNameHit({ includedObjectNames: ['Ground'] })).to.be(
      'Ground'
    );
    expect(getObjectNameHit({ excludedObjectNames: ['House'] })).to.be(
      'Ground'
    );
    expect(getObjectNameHit({ excludedInstanceUuids: ['house-1'] })).to.be(
      'Ground'
    );
    expect(
      getObjectNameHit({
        rays: [
          { ...createDownwardRay(150, 150), excludedInstanceUuid: 'house-1' },
        ],
      })
    ).to.be('Ground');
    expect(
      getObjectNameHit({ excludedObjectNames: ['House', 'Ground'] })
    ).to.be(null);
  });

  it('hits instances moved since the last frame', async () => {
    const inGameEditor = await createInGameEditorShowingIsland();
    const container = inGameEditor.getEditedInstanceContainer();
    if (!container) throw new Error('No scene is edited.');
    const [house] = container.getObjects('House') || [];
    house.setX(600);

    const [hit] = inGameEditor.raycast(
      createRaycastRequest({ rays: [createDownwardRay(650, 150)] })
    ).hits;

    expect(hit && hit.objectName).to.be('House');
  });

  it('hits the hitboxes of 2D objects in 2D', async () => {
    const inGameEditor = await createInGameEditorShowingIsland();
    const container = inGameEditor.getEditedInstanceContainer();
    if (!(container instanceof gdjs.RuntimeScene))
      throw new Error('No scene is edited.');
    const platform = new gdjs.TestRuntimeObject(container, {
      name: 'Platform',
      type: '',
      variables: [],
      behaviors: [],
      effects: [],
    });
    platform.setCustomWidthAndHeight(200, 20);
    platform.setPosition(100, 300);
    platform.persistentUuid = 'platform-1';
    container.addObject(platform);

    const { hits } = inGameEditor.raycast(
      createRaycastRequest({
        mode: '2d',
        rays: [
          { from: [150, 0, 0], to: [150, 10000, 0] },
          { from: [400, 0, 0], to: [400, 10000, 0] },
        ],
      })
    );

    expect(hits.map(roundHit)).to.eql([
      {
        x: 150,
        y: 300,
        z: 0,
        objectName: 'Platform',
        instanceUuid: 'platform-1',
      },
      null,
    ]);
  });
});
