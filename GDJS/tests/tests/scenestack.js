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
      createSene('Scene 1', []),
      createSene('Scene 2', [{ name: 'fake-heavy-resource.png' }]),
    ],
    resources: {
      resources: [
        {
          kind: 'fake-heavy-resource',
          name: 'fake-heavy-resource.png',
          metadata: '',
          file: 'fake-heavy-resource.png',
          userAdded: true,
        },
      ],
    },
  };

  it('can wait for assets to be loaded and change of layout', async () => {
    const mockedResourceManager = new gdjs.MockedResourceManager();
    //@ts-ignore
    const runtimeGame = gdjs.getPixiRuntimeGame(gameSettingsWithHeavyResource);
    runtimeGame._resourcesLoader._resourceManagersMap.set(
      //@ts-ignore
      'fake-heavy-resource',
      mockedResourceManager
    );
    let sceneStack = runtimeGame._sceneStack;

    console.log('start test');

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
    
    await runtimeGame.loadFirstAssetsAsync();

    // Test the stack
    expect(sceneStack.pop()).to.be(null);
    expect(lastLoadedScene).to.be(null);
    expect(firstLoadedScene).to.be(null);
    expect(sceneStack.wasFirstSceneLoaded()).to.be(false);
    expect(runtimeGame.isLayoutAssetsLoaded('Scene 1')).to.be(true);
    expect(runtimeGame.isLayoutAssetsLoaded('Scene 2')).to.be(false);

    sceneStack.push('Scene 1');

    // The 1st layout is loaded
    expect(lastLoadedScene).not.to.be(null);
    expect(firstLoadedScene).not.to.be(null);
    //@ts-ignore
    expect(lastLoadedScene.getName()).to.be('Scene 1');
    //@ts-ignore
    expect(firstLoadedScene.getName()).to.be('Scene 1');
    expect(sceneStack.wasFirstSceneLoaded()).to.be(true);
    expect(runtimeGame.isLayoutAssetsLoaded('Scene 1')).to.be(true);
    expect(runtimeGame.isLayoutAssetsLoaded('Scene 2')).to.be(false);

    // The 2nd layout is not loaded because its assets are still being downloading.
    let scene2 = sceneStack.push('Scene 2');
    expect(scene2).to.be(null);
    //@ts-ignore
    expect(lastPausedScene.getName()).to.be('Scene 1');
    //@ts-ignore
    expect(lastLoadedScene.getName()).to.be('Scene 1');
    expect(runtimeGame.isLayoutAssetsLoaded('Scene 2')).to.be(false);

    mockedResourceManager.markAllPendingResourcesAsLoaded();
    await delay(10);
    sceneStack.step(1000 / 60);

    // The 2nd layout is now loaded.
    expect(runtimeGame.isLayoutAssetsLoaded('Scene 2')).to.be(true);
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
});
