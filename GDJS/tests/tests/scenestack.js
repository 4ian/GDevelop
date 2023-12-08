// @ts-check

/**
 * Tests for gdjs.SceneStack.
 */
describe('gdjs.SceneStack', () => {
  const delay = (ms) => new Promise((res) => setTimeout(res, ms));

  const createSene = (name, usedResources) => {
    return {
      r: 0,
      v: 0,
      b: 0,
      mangledName: name,
      name,
      objects: [],
      layers: [],
      instances: [],
      behaviorsSharedData: [],
      stopSoundsOnStartup: false,
      title: '',
      variables: [],
      usedResources,
    };
  };

  const gameSettings = {
    layouts: [
      createSene('Scene 1', []),
      createSene('Scene 2', [{ name: 'base/tests-utils/assets/64x64.jpg' }]),
    ],
    resources: {
      resources: [
        {
          kind: 'image',
          name: 'base/tests-utils/assets/64x64.jpg',
          metadata: '',
          file: 'base/tests-utils/assets/64x64.jpg',
          userAdded: true,
        },
      ],
    },
  };

  it('should support pushing, replacing and popping scenes', async () => {
    //@ts-ignore
    const runtimeGame = gdjs.getPixiRuntimeGame(gameSettings);
    let sceneStack = runtimeGame._sceneStack;
    // Async asset loading is not tested here.
    await runtimeGame._resourcesLoader.loadAllResources(() => {});

    // Set up some scene callbacks.
    /** @type gdjs.RuntimeScene | null  */
    let firstLoadedScene = null;
    /** @type gdjs.RuntimeScene | null  */
    let lastLoadedScene = null;
    /** @type gdjs.RuntimeScene | null  */
    let lastUnloadedScene = null;
    /** @type gdjs.RuntimeScene | null  */
    let lastPausedScene = null;
    /** @type gdjs.RuntimeScene | null  */
    let lastResumedScene = null;

    const onFirstRuntimeSceneLoaded = (runtimeScene) => {
      firstLoadedScene = runtimeScene;
    };
    const onRuntimeSceneLoaded = (runtimeScene) => {
      lastLoadedScene = runtimeScene;
    };
    const onRuntimeSceneUnloaded = (runtimeScene) => {
      lastUnloadedScene = runtimeScene;
    };
    const onRuntimeScenePaused = (runtimeScene) => {
      lastPausedScene = runtimeScene;
    };
    const onRuntimeSceneResumed = (runtimeScene) => {
      lastResumedScene = runtimeScene;
    };

    gdjs.registerFirstRuntimeSceneLoadedCallback(onFirstRuntimeSceneLoaded);
    gdjs.registerRuntimeSceneLoadedCallback(onRuntimeSceneLoaded);
    gdjs.registerRuntimeSceneUnloadedCallback(onRuntimeSceneUnloaded);
    gdjs.registerRuntimeScenePausedCallback(onRuntimeScenePaused);
    gdjs.registerRuntimeSceneResumedCallback(onRuntimeSceneResumed);

    // Test the stack
    expect(sceneStack.pop()).to.be(null);
    expect(lastLoadedScene).to.be(null);
    expect(firstLoadedScene).to.be(null);
    expect(sceneStack.wasFirstSceneLoaded()).to.be(false);

    let scene1 = sceneStack.push('Scene 1');
    expect(lastLoadedScene).to.be(scene1);
    expect(firstLoadedScene).to.be(scene1);
    expect(sceneStack.wasFirstSceneLoaded()).to.be(true);

    let scene2 = sceneStack.push('Scene 2');
    expect(lastPausedScene).to.be(scene1);
    expect(lastLoadedScene).to.be(scene2);
    expect(firstLoadedScene).to.be(scene1); // Not changed

    let scene3 = sceneStack.push('Scene 1');
    expect(lastPausedScene).to.be(scene2);
    expect(lastLoadedScene).to.be(scene3);
    expect(firstLoadedScene).to.be(scene1); // Not changed

    let scene4 = sceneStack.replace('Scene 1');
    expect(lastPausedScene).to.be(scene2); // Not changed
    expect(lastUnloadedScene).to.be(scene3);
    expect(lastLoadedScene).to.be(scene4);
    expect(firstLoadedScene).to.be(scene1); // Not changed

    expect(sceneStack.pop()).to.be(scene4);
    expect(lastUnloadedScene).to.be(scene4);
    expect(lastResumedScene).to.be(scene2);
    expect(lastPausedScene).to.be(scene2); // Not changed
    expect(firstLoadedScene).to.be(scene1); // Not changed

    expect(sceneStack.pop()).to.be(scene2);
    expect(lastUnloadedScene).to.be(scene2);
    expect(lastResumedScene).to.be(scene1);
    expect(lastPausedScene).to.be(scene2); // Not changed
    expect(firstLoadedScene).to.be(scene1); // Not changed

    let scene5 = sceneStack.replace('Scene 2', true);
    expect(lastLoadedScene).to.be(scene5);
    expect(lastUnloadedScene).to.be(scene1);
    expect(lastPausedScene).to.be(scene2); // Not changed
    expect(lastResumedScene).to.be(scene1); // Not changed
    expect(firstLoadedScene).to.be(scene1); // Not changed

    expect(sceneStack.pop()).to.be(null);
    expect(lastLoadedScene).to.be(scene5); // Not changed
    expect(lastUnloadedScene).to.be(scene1); // Not changed
    expect(lastPausedScene).to.be(scene2); // Not changed
    expect(lastResumedScene).to.be(scene1); // Not changed
    expect(firstLoadedScene).to.be(scene1); // Not changed

    expect(sceneStack.wasFirstSceneLoaded()).to.be(true);

    // Remove all the global callbacks
    gdjs._unregisterCallback(onFirstRuntimeSceneLoaded);
    gdjs._unregisterCallback(onRuntimeSceneLoaded);
    gdjs._unregisterCallback(onRuntimeSceneUnloaded);
    gdjs._unregisterCallback(onRuntimeScenePaused);
    gdjs._unregisterCallback(onRuntimeSceneResumed);
  });

  const gameSettingsWithHeavyResource = {
    layouts: [
      createSene('Scene 1', [{ name: 'fake-heavy-resource1.png' }]),
      createSene('Scene 2', [{ name: 'fake-heavy-resource2.png' }]),
      createSene('Scene 3', [{ name: 'fake-heavy-resource3.png' }]),
      createSene('Scene 4', [{ name: 'fake-heavy-resource4.png' }]),
    ],
    resources: {
      resources: [
        {
          kind: 'fake-heavy-resource',
          name: 'fake-heavy-resource1.png',
          metadata: '',
          file: 'fake-heavy-resource1.png',
          userAdded: true,
        },
        {
          kind: 'fake-heavy-resource',
          name: 'fake-heavy-resource2.png',
          metadata: '',
          file: 'fake-heavy-resource2.png',
          userAdded: true,
        },
        {
          kind: 'fake-heavy-resource',
          name: 'fake-heavy-resource3.png',
          metadata: '',
          file: 'fake-heavy-resource3.png',
          userAdded: true,
        },
        {
          kind: 'fake-heavy-resource',
          name: 'fake-heavy-resource4.png',
          metadata: '',
          file: 'fake-heavy-resource4.png',
          userAdded: true,
        },
      ],
    },
  };

  it('can start a layout when all its assets are already downloaded', async () => {
    const mockedResourceManager = new gdjs.MockedResourceManager();
    //@ts-ignore
    const runtimeGame = gdjs.getPixiRuntimeGame(gameSettingsWithHeavyResource);
    runtimeGame._resourcesLoader._resourceManagersMap.set(
      //@ts-ignore
      'fake-heavy-resource',
      mockedResourceManager
    );
    let sceneStack = runtimeGame._sceneStack;

    // Set up some scene callbacks.
    /** @type gdjs.RuntimeScene | null  */
    let firstLoadedScene = null;
    /** @type gdjs.RuntimeScene | null  */
    let lastLoadedScene = null;
    /** @type gdjs.RuntimeScene | null  */
    let lastPausedScene = null;

    const onFirstRuntimeSceneLoaded = (runtimeScene) => {
      firstLoadedScene = runtimeScene;
    };
    const onRuntimeSceneLoaded = (runtimeScene) => {
      lastLoadedScene = runtimeScene;
    };
    const onRuntimeScenePaused = (runtimeScene) => {
      lastPausedScene = runtimeScene;
    };

    gdjs.registerFirstRuntimeSceneLoadedCallback(onFirstRuntimeSceneLoaded);
    gdjs.registerRuntimeSceneLoadedCallback(onRuntimeSceneLoaded);
    gdjs.registerRuntimeScenePausedCallback(onRuntimeScenePaused);

    // The test do not await because test test will unblock
    // `loadFirstAssetsAsync` with `markPendingResourcesAsLoaded`.
    runtimeGame.loadFirstAssetsAndStartBackgroundLoading('Scene 1');
    expect(
      mockedResourceManager.isResourceDownloadPending(
        'fake-heavy-resource1.png'
      )
    ).to.be(true);

    // No layout has loaded.
    expect(lastLoadedScene).to.be(null);
    expect(firstLoadedScene).to.be(null);
    expect(sceneStack.wasFirstSceneLoaded()).to.be(false);
    expect(runtimeGame.areSceneAssetsReady('Scene 1')).to.be(false);
    expect(runtimeGame.areSceneAssetsReady('Scene 2')).to.be(false);

    // Assets of the 1st layout are downloaded before the layout is pushed.
    mockedResourceManager.markPendingResourcesAsLoaded(
      'fake-heavy-resource1.png'
    );
    await delay(10);
    sceneStack.push('Scene 1');

    // The 1st layout is loaded
    expect(lastLoadedScene).not.to.be(null);
    expect(firstLoadedScene).not.to.be(null);
    //@ts-ignore
    expect(lastLoadedScene.getName()).to.be('Scene 1');
    //@ts-ignore
    expect(firstLoadedScene.getName()).to.be('Scene 1');
    expect(sceneStack.wasFirstSceneLoaded()).to.be(true);
    expect(runtimeGame.areSceneAssetsLoaded('Scene 1')).to.be(true);
    expect(runtimeGame.areSceneAssetsReady('Scene 1')).to.be(true);
    expect(runtimeGame.areSceneAssetsLoaded('Scene 2')).to.be(false);
    expect(runtimeGame.areSceneAssetsReady('Scene 2')).to.be(false);

    // "Scene 2" is loading in background.
    expect(
      mockedResourceManager.isResourceDownloadPending(
        'fake-heavy-resource2.png'
      )
    ).to.be(true);
    expect(runtimeGame.areSceneAssetsReady('Scene 2')).to.be(false);

    // Finish to load "Scene 2" assets.
    mockedResourceManager.markPendingResourcesAsLoaded(
      'fake-heavy-resource2.png'
    );
    await delay(10);
    expect(runtimeGame.areSceneAssetsLoaded('Scene 2')).to.be(true);

    // The player triggers "Scene 2" to start.
    sceneStack.push('Scene 2');
    // "Scene 2" is loaded for the 1st time, assets are processed
    // asynchronously.
    await delay(10);
    expect(lastPausedScene).not.to.be(null);
    //@ts-ignore
    expect(lastPausedScene.getName()).to.be('Scene 1');
    //@ts-ignore
    expect(lastLoadedScene.getName()).to.be('Scene 2');

    // The player triggers "Scene 1" to start.
    sceneStack.push('Scene 1');
    // "Scene 1" has already been shown the scene change is done synchronously.
    expect(lastPausedScene).not.to.be(null);
    //@ts-ignore
    expect(lastPausedScene.getName()).to.be('Scene 2');
    //@ts-ignore
    expect(lastLoadedScene.getName()).to.be('Scene 1');

    // Remove all the global callbacks
    gdjs._unregisterCallback(onFirstRuntimeSceneLoaded);
    gdjs._unregisterCallback(onRuntimeSceneLoaded);
    gdjs._unregisterCallback(onRuntimeScenePaused);
  });

  it('can start a layout while assets loading and wait them to finish', async () => {
    const mockedResourceManager = new gdjs.MockedResourceManager();
    //@ts-ignore
    const runtimeGame = gdjs.getPixiRuntimeGame(gameSettingsWithHeavyResource);
    runtimeGame._resourcesLoader._resourceManagersMap.set(
      //@ts-ignore
      'fake-heavy-resource',
      mockedResourceManager
    );
    let sceneStack = runtimeGame._sceneStack;

    // Set up some scene callbacks.
    /** @type gdjs.RuntimeScene | null  */
    let firstLoadedScene = null;
    /** @type gdjs.RuntimeScene | null  */
    let lastLoadedScene = null;
    /** @type gdjs.RuntimeScene | null  */
    let lastPausedScene = null;

    const onFirstRuntimeSceneLoaded = (runtimeScene) => {
      firstLoadedScene = runtimeScene;
    };
    const onRuntimeSceneLoaded = (runtimeScene) => {
      lastLoadedScene = runtimeScene;
    };
    const onRuntimeScenePaused = (runtimeScene) => {
      lastPausedScene = runtimeScene;
    };

    gdjs.registerFirstRuntimeSceneLoadedCallback(onFirstRuntimeSceneLoaded);
    gdjs.registerRuntimeSceneLoadedCallback(onRuntimeSceneLoaded);
    gdjs.registerRuntimeScenePausedCallback(onRuntimeScenePaused);

    // The test do not await because test test will unblock
    // `loadFirstAssetsAsync` with `markPendingResourcesAsLoaded`.
    runtimeGame.loadFirstAssetsAndStartBackgroundLoading('Scene 1');
    expect(
      mockedResourceManager.isResourceDownloadPending(
        'fake-heavy-resource1.png'
      )
    ).to.be(true);

    // No layout has loaded.
    expect(lastLoadedScene).to.be(null);
    expect(firstLoadedScene).to.be(null);
    expect(sceneStack.wasFirstSceneLoaded()).to.be(false);
    expect(runtimeGame.areSceneAssetsReady('Scene 1')).to.be(false);
    expect(runtimeGame.areSceneAssetsReady('Scene 2')).to.be(false);

    // Assets of the 1st layout are downloaded before the layout is pushed.
    mockedResourceManager.markPendingResourcesAsLoaded(
      'fake-heavy-resource1.png'
    );
    await delay(10);
    sceneStack.push('Scene 1');

    // The 1st layout is loaded
    expect(lastLoadedScene).not.to.be(null);
    expect(firstLoadedScene).not.to.be(null);
    //@ts-ignore
    expect(lastLoadedScene.getName()).to.be('Scene 1');
    //@ts-ignore
    expect(firstLoadedScene.getName()).to.be('Scene 1');
    expect(sceneStack.wasFirstSceneLoaded()).to.be(true);
    expect(runtimeGame.areSceneAssetsReady('Scene 1')).to.be(true);
    expect(runtimeGame.areSceneAssetsReady('Scene 2')).to.be(false);

    // The 2nd layout is loading in background.
    expect(
      mockedResourceManager.isResourceDownloadPending(
        'fake-heavy-resource2.png'
      )
    ).to.be(true);

    // The player triggers "Scene 2" to load.
    let scene2 = sceneStack.push('Scene 2');
    expect(scene2).to.be(null);
    await delay(10);

    // The 2nd layout is not loaded because its assets are still being downloaded.
    //@ts-ignore
    expect(lastPausedScene.getName()).to.be('Scene 1');
    //@ts-ignore
    expect(lastLoadedScene.getName()).to.be('Scene 1');
    expect(runtimeGame.areSceneAssetsReady('Scene 2')).to.be(false);

    mockedResourceManager.markPendingResourcesAsLoaded(
      'fake-heavy-resource2.png'
    );
    await delay(10);

    // The 2nd layout is now loaded.
    expect(runtimeGame.areSceneAssetsReady('Scene 2')).to.be(true);
    expect(lastPausedScene).not.to.be(null);
    //@ts-ignore
    expect(lastPausedScene.getName()).to.be('Scene 1');
    //@ts-ignore
    expect(lastLoadedScene.getName()).to.be('Scene 2');

    // Remove all the global callbacks
    gdjs._unregisterCallback(onFirstRuntimeSceneLoaded);
    gdjs._unregisterCallback(onRuntimeSceneLoaded);
    gdjs._unregisterCallback(onRuntimeScenePaused);
  });

  it('can start a layout which assets loading didn\'t stated yet and wait them to finish', async () => {
    const mockedResourceManager = new gdjs.MockedResourceManager();
    //@ts-ignore
    const runtimeGame = gdjs.getPixiRuntimeGame(gameSettingsWithHeavyResource);
    runtimeGame._resourcesLoader._resourceManagersMap.set(
      //@ts-ignore
      'fake-heavy-resource',
      mockedResourceManager
    );
    let sceneStack = runtimeGame._sceneStack;

    // Set up some scene callbacks.
    /** @type gdjs.RuntimeScene | null  */
    let firstLoadedScene = null;
    /** @type gdjs.RuntimeScene | null  */
    let lastLoadedScene = null;
    /** @type gdjs.RuntimeScene | null  */
    let lastPausedScene = null;

    const onFirstRuntimeSceneLoaded = (runtimeScene) => {
      firstLoadedScene = runtimeScene;
    };
    const onRuntimeSceneLoaded = (runtimeScene) => {
      lastLoadedScene = runtimeScene;
    };
    const onRuntimeScenePaused = (runtimeScene) => {
      lastPausedScene = runtimeScene;
    };

    gdjs.registerFirstRuntimeSceneLoadedCallback(onFirstRuntimeSceneLoaded);
    gdjs.registerRuntimeSceneLoadedCallback(onRuntimeSceneLoaded);
    gdjs.registerRuntimeScenePausedCallback(onRuntimeScenePaused);

    // The test do not await because test test will unblock
    // `loadFirstAssetsAsync` with `markPendingResourcesAsLoaded`.
    runtimeGame.loadFirstAssetsAndStartBackgroundLoading('Scene 1');
    expect(
      mockedResourceManager.isResourceDownloadPending(
        'fake-heavy-resource1.png'
      )
    ).to.be(true);

    // No layout has loaded.
    expect(lastLoadedScene).to.be(null);
    expect(firstLoadedScene).to.be(null);
    expect(sceneStack.wasFirstSceneLoaded()).to.be(false);
    expect(runtimeGame.areSceneAssetsReady('Scene 1')).to.be(false);
    expect(runtimeGame.areSceneAssetsReady('Scene 2')).to.be(false);

    // Assets of the 1st layout are downloaded before the layout is pushed.
    mockedResourceManager.markPendingResourcesAsLoaded(
      'fake-heavy-resource1.png'
    );
    await delay(10);
    sceneStack.push('Scene 1');

    // The 1st layout is loaded
    expect(lastLoadedScene).not.to.be(null);
    expect(firstLoadedScene).not.to.be(null);
    //@ts-ignore
    expect(lastLoadedScene.getName()).to.be('Scene 1');
    //@ts-ignore
    expect(firstLoadedScene.getName()).to.be('Scene 1');
    expect(sceneStack.wasFirstSceneLoaded()).to.be(true);
    expect(runtimeGame.areSceneAssetsLoaded('Scene 1')).to.be(true);
    expect(runtimeGame.areSceneAssetsLoaded('Scene 2')).to.be(false);

    // "Scene 2" is loaded on background but is blocked because
    // 'fake-heavy-resource2.png' take a lot of time to load.
    expect(
      mockedResourceManager.isResourceDownloadPending(
        'fake-heavy-resource2.png'
      )
    ).to.be(true);
    expect(runtimeGame.areSceneAssetsLoaded('Scene 2')).to.be(false);

    // The player triggers "Scene 4" to load.
    let scene4 = sceneStack.push('Scene 4');
    expect(scene4).to.be(null);
    await delay(10);
    // "Scene 4" loading doesn't start yet as assets are currently downloading
    // for "Scene 2".
    expect(
      mockedResourceManager.isResourceDownloadPending(
        'fake-heavy-resource4.png'
      )
    ).to.be(false);
    expect(runtimeGame.areSceneAssetsLoaded('Scene 2')).to.be(false);
    expect(runtimeGame.areSceneAssetsLoaded('Scene 4')).to.be(false);

    // Finish to download "Scene 2" assets.
    mockedResourceManager.markPendingResourcesAsLoaded(
      'fake-heavy-resource2.png'
    );
    await delay(10);

    // "Scene 4" assets are now downloading.
    expect(
      mockedResourceManager.isResourceDownloadPending(
        'fake-heavy-resource4.png'
      )
    ).to.be(true);

    // "Scene 4" is not loaded because its assets are still being downloading.
    //@ts-ignore
    expect(lastPausedScene.getName()).to.be('Scene 1');
    //@ts-ignore
    expect(lastLoadedScene.getName()).to.be('Scene 1');
    expect(runtimeGame.areSceneAssetsLoaded('Scene 2')).to.be(true);
    expect(runtimeGame.areSceneAssetsLoaded('Scene 4')).to.be(false);

    mockedResourceManager.markPendingResourcesAsLoaded(
      'fake-heavy-resource4.png'
    );
    await delay(10);

    // "Scene 4" is now loaded.
    expect(runtimeGame.areSceneAssetsReady('Scene 4')).to.be(true);
    expect(lastPausedScene).not.to.be(null);
    //@ts-ignore
    expect(lastPausedScene.getName()).to.be('Scene 1');
    //@ts-ignore
    expect(lastLoadedScene.getName()).to.be('Scene 4');

    // Remove all the global callbacks
    gdjs._unregisterCallback(onFirstRuntimeSceneLoaded);
    gdjs._unregisterCallback(onRuntimeSceneLoaded);
    gdjs._unregisterCallback(onRuntimeScenePaused);
  });
});
