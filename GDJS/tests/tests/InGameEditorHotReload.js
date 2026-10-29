// @ts-check

describe('Hot-reload of objects in the in-game editor', function () {
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

  /** @type {LayerData} */
  const baseLayer = {
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

  /** @type {InstancesEditorSettings} */
  const editionSettings = {
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
  };

  /**
   * @param {string} name
   * @param {string} persistentUuid
   * @returns {InstanceData}
   */
  const createInstanceData = (name, persistentUuid) => ({
    name,
    persistentUuid,
    x: 0,
    y: 0,
    angle: 0,
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

  /**
   * @param {string} name
   * @param {string} type
   * @param {Object} content
   * @returns {ObjectData & gdjs.CustomObjectConfiguration}
   */
  const createCustomObjectData = (name, type, content) => ({
    name,
    type,
    variant: '',
    variables: [],
    behaviors: [],
    effects: [],
    content,
    isInnerAreaFollowingParentSize: false,
  });

  /**
   * The mocked generated custom object (see `MockedCustomObject.js`), as a
   * child of `MyParentCustomObject`.
   * @param {number} myProperty
   * @returns {ObjectData & gdjs.CustomObjectConfiguration}
   */
  const createNestedCustomObjectData = (myProperty) =>
    createCustomObjectData(
      'MyNestedCustomObject',
      'MyExtension::MyCustomObject',
      { MyProperty: myProperty }
    );

  /**
   * @param {{name: string, instances: InstanceData[], objects: ObjectData[]}} data
   * @returns {EventsBasedObjectData}
   */
  const createEventsBasedObjectData = ({ name, instances, objects }) => ({
    name,
    variables: [],
    instances,
    objects,
    objectsGroups: [],
    layers: [baseLayer],
    areaMinX: 0,
    areaMinY: 0,
    areaMinZ: 0,
    areaMaxX: 100,
    areaMaxY: 100,
    areaMaxZ: 100,
    _initialInnerArea: null,
    isInnerAreaFollowingParentSize: false,
    variants: [],
    usedResources: [],
    editionSettings,
  });

  /**
   * A scene with a `MyGrandParentCustomObject`, which has a
   * `MyParentCustomObject` as child, which has a `MyNestedCustomObject` as
   * child.
   * @returns {ProjectData}
   */
  const createProjectData = () => {
    const projectData = gdjs.createProjectData({
      layouts: [
        {
          name: 'Scene',
          mangledName: 'Scene',
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
          layers: [baseLayer],
          objects: [
            createCustomObjectData(
              'MyGrandParentCustomObject',
              'MyExtension::MyGrandParentCustomObject',
              {}
            ),
          ],
          instances: [
            createInstanceData('MyGrandParentCustomObject', 'grand-parent-1'),
          ],
          uiSettings: editionSettings,
        },
      ],
    });
    projectData.eventsFunctionsExtensions.push({
      name: 'MyExtension',
      eventsBasedObjects: [
        createEventsBasedObjectData({
          name: 'MyCustomObject',
          instances: [],
          objects: [],
        }),
        createEventsBasedObjectData({
          name: 'MyParentCustomObject',
          instances: [createInstanceData('MyNestedCustomObject', 'nested-1')],
          objects: [createNestedCustomObjectData(1)],
        }),
        createEventsBasedObjectData({
          name: 'MyGrandParentCustomObject',
          instances: [createInstanceData('MyParentCustomObject', 'parent-1')],
          objects: [
            createCustomObjectData(
              'MyParentCustomObject',
              'MyExtension::MyParentCustomObject',
              {}
            ),
          ],
        }),
      ],
      globalVariables: [],
      sceneVariables: [],
    });
    return projectData;
  };

  /** @returns {Promise<gdjs.InGameEditor>} */
  const createInGameEditor = async () => {
    runtimeGame = new gdjs.RuntimeGame(createProjectData(), {
      initialRuntimeGameStatus: {
        isPaused: true,
        isInGameEdition: true,
        sceneName: 'Scene',
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
    return inGameEditor;
  };

  /**
   * @param {gdjs.InGameEditor} inGameEditor
   * @returns {Promise<gdjs.RuntimeInstanceContainer>} The children of the variant.
   */
  const switchToParentCustomObjectVariant = async (inGameEditor) => {
    await inGameEditor.switchToSceneOrVariant(
      'variant-editor',
      null,
      null,
      'MyExtension::MyParentCustomObject',
      '',
      null
    );
    const instanceContainer = inGameEditor.getEditedInstanceContainer();
    if (!instanceContainer) throw new Error('No variant is edited.');
    return instanceContainer;
  };

  /**
   * @param {gdjs.InGameEditor} inGameEditor
   * @returns {Promise<gdjs.RuntimeInstanceContainer>}
   */
  const switchToScene = async (inGameEditor) => {
    await inGameEditor.switchToSceneOrVariant(
      'scene-editor',
      'Scene',
      null,
      null,
      null,
      null
    );
    const instanceContainer = inGameEditor.getEditedInstanceContainer();
    if (!instanceContainer) throw new Error('No scene is edited.');
    return instanceContainer;
  };

  /**
   * @param {gdjs.RuntimeInstanceContainer} instanceContainer
   * @param {string} objectName
   * @returns {gdjs.RuntimeInstanceContainer} The children of the custom object instance.
   */
  const getCustomObjectChildren = (instanceContainer, objectName) => {
    const instances = instanceContainer.getInstancesOf(objectName);
    expect(instances.length).to.be(1);
    const instance = instances[0];
    if (!(instance instanceof gdjs.CustomRuntimeObject)) {
      throw new Error("Couldn't instantiate a custom object for testing.");
    }
    return instance.getChildrenContainer();
  };

  /**
   * @param {gdjs.RuntimeInstanceContainer} instanceContainer
   * @returns {number} The property of the nested custom object instance.
   */
  const getNestedCustomObjectProperty = (instanceContainer) => {
    const instances = instanceContainer.getInstancesOf('MyNestedCustomObject');
    expect(instances.length).to.be(1);
    const instance = instances[0];
    if (
      !(
        instance instanceof
        gdjs.evtsExt__MyExtension__MyCustomObject.MyCustomObject
      )
    ) {
      throw new Error("Couldn't instantiate a custom object for testing.");
    }
    return instance._getMyProperty();
  };

  it('keeps the changes of a custom object edited several times in a variant, in scenes using it in another custom object', async () => {
    gdjs.registerObject(
      'MyExtension::MyParentCustomObject',
      gdjs.CustomRuntimeObject2D
    );
    gdjs.registerObject(
      'MyExtension::MyGrandParentCustomObject',
      gdjs.CustomRuntimeObject2D
    );
    const inGameEditor = await createInGameEditor();
    const variantInstanceContainer =
      await switchToParentCustomObjectVariant(inGameEditor);
    expect(getNestedCustomObjectProperty(variantInstanceContainer)).to.be(1);

    // Like the debugger client does when the editor sends `hotReloadObjects`.
    const hotReloader = new gdjs.HotReloader(inGameEditor.getRuntimeGame());
    hotReloader.hotReloadRuntimeSceneObjects(
      [createNestedCustomObjectData(2)],
      variantInstanceContainer
    );
    hotReloader.hotReloadRuntimeSceneObjects(
      [createNestedCustomObjectData(3)],
      variantInstanceContainer
    );
    expect(getNestedCustomObjectProperty(variantInstanceContainer)).to.be(3);

    const sceneInstanceContainer = await switchToScene(inGameEditor);
    expect(
      getNestedCustomObjectProperty(
        getCustomObjectChildren(
          getCustomObjectChildren(
            sceneInstanceContainer,
            'MyGrandParentCustomObject'
          ),
          'MyParentCustomObject'
        )
      )
    ).to.be(3);

    const reloadedVariantInstanceContainer =
      await switchToParentCustomObjectVariant(inGameEditor);
    expect(
      getNestedCustomObjectProperty(reloadedVariantInstanceContainer)
    ).to.be(3);
  });
});
