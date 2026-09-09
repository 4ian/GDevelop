// @ts-check

/**
 * Tests for the state of the resources reported to the debugger
 * (gdjs.ResourceLoader.getResourcesDebugState and gdjs.ResourceLoadTracker).
 */
describe('gdjs.ResourceLoader debug state', () => {
  const delay = (ms) => new Promise((res) => setTimeout(res, ms));

  /**
   * @param {string} name
   * @returns {ResourceData}
   */
  const makeResourceData = (name) => ({
    kind: 'fake-resource-kind-for-testing-only',
    name,
    metadata: '',
    file: name,
    userAdded: true,
  });

  /**
   * @param {{name: string, usedResources: Array<ResourceReference>, objects?: Array<{name: string, usedResources: Array<ResourceReference>}>}} props
   * @returns {LayoutData}
   */
  const createSceneData = ({ name, usedResources, objects }) => ({
    r: 0,
    v: 0,
    b: 0,
    mangledName: name,
    name,
    objects: (objects || []).map((object) => ({
      ...object,
      type: '',
      variables: [],
      behaviors: [],
      effects: [],
    })),
    objectsGroups: [],
    layers: [],
    instances: [],
    behaviorsSharedData: [],
    stopSoundsOnStartup: false,
    title: '',
    variables: [],
    usedResources,
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

  const gameSettings = {
    layouts: [
      createSceneData({
        name: 'Scene1',
        usedResources: [
          { name: 'scene1.png' },
          { name: 'scene1-only.png' },
          { name: 'shared.png' },
        ],
        objects: [
          { name: 'Object1', usedResources: [{ name: 'object1.png' }] },
        ],
      }),
      createSceneData({
        name: 'Scene2',
        usedResources: [{ name: 'scene2.png' }, { name: 'shared.png' }],
      }),
    ],
    resources: {
      resources: [
        makeResourceData('scene1.png'),
        makeResourceData('scene1-only.png'),
        makeResourceData('shared.png'),
        makeResourceData('object1.png'),
        makeResourceData('scene2.png'),
      ],
    },
  };

  /**
   * @param {gdjs.ResourcesDebugState} state
   * @param {string} name
   */
  const findResource = (state, name) => {
    const resource = state.resources.find((resource) => resource.name === name);
    if (!resource) throw new Error(`Resource ${name} not found in the state.`);
    return resource;
  };

  it('reports the status, the origin and the requesters of each resource', async () => {
    const mockedResourceManager = new gdjs.MockedResourceManager();
    const runtimeGame = gdjs.getPixiRuntimeGame(gameSettings);
    const resourceLoader = runtimeGame.getResourceLoader();
    resourceLoader.injectMockResourceManagerForTesting(
      'fake-resource-kind-for-testing-only',
      mockedResourceManager
    );

    // Nothing is loaded yet, but every resource is known.
    let state = resourceLoader.getResourcesDebugState();
    expect(state.resources.length).to.be(5);
    expect(state.totals.byStatus['not-loaded']).to.be(5);
    expect(state.totals.byKind['fake-resource-kind-for-testing-only']).to.be(5);
    expect(state.totals.estimatedMemoryBytes).to.be(0);
    expect(findResource(state, 'shared.png').requesters).to.eql([
      { type: 'scene', sceneName: 'Scene1', foreground: false },
      { type: 'scene', sceneName: 'Scene2', foreground: false },
    ]);
    expect(findResource(state, 'shared.png').origin).to.be(null);
    expect(findResource(state, 'scene1.png').status).to.be('not-loaded');

    // The first scene is loading.
    runtimeGame.loadFirstAssetsAndStartBackgroundLoading('Scene1');
    state = resourceLoader.getResourcesDebugState();
    const loadingResource = findResource(state, 'scene1.png');
    expect(loadingResource.status).to.be('loading');
    expect(loadingResource.origin).to.eql({
      type: 'startup',
      sceneName: 'Scene1',
    });
    expect(loadingResource.attempts).to.be(1);
    expect(typeof loadingResource.loadStartedAtMs).to.be('number');
    expect(loadingResource.loadedAtMs).to.be(undefined);

    mockedResourceManager.markPendingResourcesAsLoaded('scene1.png');
    mockedResourceManager.markPendingResourcesAsLoaded('scene1-only.png');
    mockedResourceManager.markPendingResourcesAsLoaded('shared.png');
    await delay(10);

    state = resourceLoader.getResourcesDebugState();
    const readyResource = findResource(state, 'scene1.png');
    expect(readyResource.status).to.be('ready');
    expect(typeof readyResource.loadedAtMs).to.be('number');
    expect(typeof readyResource.readyAtMs).to.be('number');
    // @ts-ignore - checked above.
    expect(readyResource.readyAtMs >= readyResource.loadStartedAtMs).to.be(
      true
    );
    // The metrics of the manager are reported, and count in the totals.
    expect(readyResource.metrics).to.eql({
      estimatedMemoryBytes: 1024,
      extra: { mocked: true },
    });
    expect(readyResource.estimatedMemoryBytes).to.be(1024);
    expect(state.totals.estimatedMemoryBytes).to.be(3072);
    expect(state.totals.byStatus['ready']).to.be(3);

    // The second scene is loading in background.
    await delay(20);
    state = resourceLoader.getResourcesDebugState();
    const backgroundResource = findResource(state, 'scene2.png');
    expect(backgroundResource.status).to.be('loading');
    // The origin tells which scene asked for it (the foreground flag is
    // an internal detail of the queue, not asserted here).
    expect(backgroundResource.origin && backgroundResource.origin.type).to.be(
      'scene'
    );
    expect(
      backgroundResource.origin && backgroundResource.origin.type === 'scene'
        ? backgroundResource.origin.sceneName
        : null
    ).to.be('Scene2');

    // The state can be sent to the editor as is.
    expect(JSON.parse(JSON.stringify(state))).to.eql(state);
  });

  it('reports errors, retries and unloads', async () => {
    const mockedResourceManager = new gdjs.MockedResourceManager();
    const runtimeGame = gdjs.getPixiRuntimeGame(gameSettings);
    const resourceLoader = runtimeGame.getResourceLoader();
    resourceLoader.injectMockResourceManagerForTesting(
      'fake-resource-kind-for-testing-only',
      mockedResourceManager
    );

    runtimeGame.loadFirstAssetsAndStartBackgroundLoading('Scene1');
    mockedResourceManager.failPendingResource('scene1.png', 'HTTP 404');
    mockedResourceManager.markPendingResourcesAsLoaded('scene1-only.png');
    mockedResourceManager.markPendingResourcesAsLoaded('shared.png');
    await delay(10);

    let state = resourceLoader.getResourcesDebugState();
    const failedResource = findResource(state, 'scene1.png');
    // The loader retried: the download is pending again.
    expect(mockedResourceManager.isResourceDownloadPending('scene1.png')).to.be(
      true
    );
    expect(failedResource.status).to.be('loading');
    expect(failedResource.attempts).to.be(2);

    mockedResourceManager.failPendingResource('scene1.png', 'HTTP 404');
    await delay(10);
    mockedResourceManager.failPendingResource('scene1.png', 'HTTP 404 again');
    await delay(10);

    state = resourceLoader.getResourcesDebugState();
    const stillFailedResource = findResource(state, 'scene1.png');
    expect(stillFailedResource.status).to.be('error');
    expect(stillFailedResource.errorMessage).to.be('HTTP 404 again');
    expect(stillFailedResource.attempts).to.be(3);
    expect(state.totals.byStatus['error']).to.be(1);

    // Unloading a scene (without a new one to keep shared resources for)
    // puts its resources back to not loaded, and remembers it.
    resourceLoader.unloadSceneResources({
      unloadedSceneName: 'Scene1',
      newSceneName: null,
    });
    state = resourceLoader.getResourcesDebugState();
    expect(findResource(state, 'shared.png').status).to.be('not-loaded');
    const unloadedResource = findResource(state, 'scene1-only.png');
    expect(unloadedResource.status).to.be('not-loaded');
    expect(unloadedResource.unloadHistory.length).to.be(1);
    expect(typeof unloadedResource.unloadHistory[0].unloadedAtMs).to.be(
      'number'
    );
  });
});
