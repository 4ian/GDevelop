// @ts-check

/**
 * Tests for gdjs.ResourceLoader.
 */
describe.only('gdjs.ResourceLoader', () => {
  const delay = (ms) => new Promise((res) => setTimeout(res, ms));

  /** @returns {LayoutData} */
  const createSceneData = (name, usedResources) => {
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

  /**
   * Enhanced mocked resource manager that tracks disposed resources
   */
  class EnhancedMockedResourceManager {
    loadResourcePromises = new Map();
    loadResourceCallbacks = new Map();
    disposedResources = new Set();
    loadedResources = new Set();
    waitingForProcessing = new Set();
    readyResources = new Set();

    loadResource(resourceName) {
      if (
        this.loadedResources.has(resourceName) ||
        this.waitingForProcessing.has(resourceName)
      ) {
        return Promise.resolve();
      }

      const existingPromise = this.loadResourcePromises.get(resourceName);
      if (existingPromise) {
        return existingPromise;
      }

      const promise = new Promise((resolve) => {
        this.loadResourceCallbacks.set(resourceName, resolve);
      });
      this.loadResourcePromises.set(resourceName, promise);
      return promise;
    }

    async processResource(resourceName) {
      // Mark resource as fully processed
      this.readyResources.add(resourceName);
    }

    /**
     * @param {string} resourceName
     * @returns {boolean}
     */
    isResourceDownloadPending(resourceName) {
      return this.loadResourceCallbacks.has(resourceName);
    }

    /**
     * @param {string} resourceName
     */
    markPendingResourcesAsLoaded(resourceName) {
      const loadResourceCallback = this.loadResourceCallbacks.get(resourceName);
      if (loadResourceCallback) {
        this.loadedResources.add(resourceName);
        loadResourceCallback();
        this.loadResourceCallbacks.delete(resourceName);
        this.loadResourcePromises.delete(resourceName);
      } else {
        throw new Error(
          `Resource ${resourceName} was not being loaded, so cannot be marked as loaded.`
        );
      }
    }

    /**
     * Check if a resource is loaded (but maybe not yet processed)
     */
    isResourceLoaded(resourceName) {
      return this.loadedResources.has(resourceName);
    }

    /**
     * Check if a resource has been disposed
     */
    isResourceDisposed(resourceName) {
      return this.disposedResources.has(resourceName);
    }

    /**
     * Dispose all resources
     */
    dispose() {
      for (const resourceName of this.loadedResources) {
        this.disposedResources.add(resourceName);
      }
      this.loadedResources.clear();
      this.loadResourceCallbacks.clear();
      this.loadResourcePromises.clear();
    }

    /**
     * Dispose specific resources
     */
    disposeByResourcesList(resourcesList) {
      for (const resource of resourcesList) {
        this.disposedResources.add(resource.name);
        this.loadedResources.delete(resource.name);
        this.loadResourceCallbacks.delete(resource.name);
        this.loadResourcePromises.delete(resource.name);
      }
    }

    getResourceKinds() {
      return ['fake-heavy-resource-kind'];
    }
  };

  const gameSettingsWithThreeScenes = {
    layouts: [
      createSceneData('Scene1', [
        { name: 'scene1-resource1.png' },
        { name: 'scene1-resource2.png' },
      ]),
      createSceneData('Scene2', [
        { name: 'scene2-resource1.png' },
        { name: 'shared-resource.png' },
      ]),
      createSceneData('Scene3', [
        { name: 'scene3-resource1.png' },
        { name: 'shared-resource.png' },
      ]),
    ],
    resources: {
      resources: [
        {
          kind: 'fake-heavy-resource-kind',
          name: 'scene1-resource1.png',
          metadata: '',
          file: 'scene1-resource1.png',
          userAdded: true,
        },
        {
          kind: 'fake-heavy-resource-kind',
          name: 'scene1-resource2.png',
          metadata: '',
          file: 'scene1-resource2.png',
          userAdded: true,
        },
        {
          kind: 'fake-heavy-resource-kind',
          name: 'scene2-resource1.png',
          metadata: '',
          file: 'scene2-resource1.png',
          userAdded: true,
        },
        {
          kind: 'fake-heavy-resource-kind',
          name: 'scene3-resource1.png',
          metadata: '',
          file: 'scene3-resource1.png',
          userAdded: true,
        },
        {
          kind: 'fake-heavy-resource-kind',
          name: 'shared-resource.png',
          metadata: '',
          file: 'shared-resource.png',
          userAdded: true,
        },
      ],
    },
  };

  it('should load first scene resources, then others in background', async () => {
    const mockedResourceManager = new EnhancedMockedResourceManager();
    // @ts-ignore
    const runtimeGame = gdjs.getPixiRuntimeGame(gameSettingsWithThreeScenes);
    runtimeGame._resourcesLoader._resourceManagersMap.set(
      // @ts-ignore
      'fake-heavy-resource-kind',
      mockedResourceManager
    );

    const resourceLoader = runtimeGame._resourcesLoader;

    // Initially, no scene assets should be loaded
    expect(resourceLoader.areSceneAssetsLoaded('Scene1')).to.be(false);
    expect(resourceLoader.areSceneAssetsLoaded('Scene2')).to.be(false);
    expect(resourceLoader.areSceneAssetsLoaded('Scene3')).to.be(false);
    expect(resourceLoader.areSceneAssetsReady('Scene1')).to.be(false);
    expect(resourceLoader.areSceneAssetsReady('Scene2')).to.be(false);
    expect(resourceLoader.areSceneAssetsReady('Scene3')).to.be(false);

    // Start loading first scene and background loading
    runtimeGame.loadFirstAssetsAndStartBackgroundLoading('Scene1');

    // Scene1 resources should be pending download
    expect(
      mockedResourceManager.isResourceDownloadPending('scene1-resource1.png')
    ).to.be(true);
    expect(
      mockedResourceManager.isResourceDownloadPending('scene1-resource2.png')
    ).to.be(true);
    expect(resourceLoader.areSceneAssetsReady('Scene1')).to.be(false);

    // Mark Scene1 resources as loaded
    mockedResourceManager.markPendingResourcesAsLoaded('scene1-resource1.png');
    mockedResourceManager.markPendingResourcesAsLoaded('scene1-resource2.png');
    await delay(10);

    // Scene1 should now be ready
    expect(resourceLoader.areSceneAssetsLoaded('Scene1')).to.be(true);
    expect(resourceLoader.areSceneAssetsReady('Scene1')).to.be(true);

    // Background loading should have started for Scene2
    await delay(20); // Wait for background loading to start
    expect(
      mockedResourceManager.isResourceDownloadPending('scene2-resource1.png')
    ).to.be(true);
    expect(
      mockedResourceManager.isResourceDownloadPending('shared-resource.png')
    ).to.be(true);

    // Mark Scene2 resources as loaded
    mockedResourceManager.markPendingResourcesAsLoaded('scene2-resource1.png');
    mockedResourceManager.markPendingResourcesAsLoaded('shared-resource.png');
    await delay(10);

    // Scene2 should now be loaded
    expect(resourceLoader.areSceneAssetsLoaded('Scene2')).to.be(true);
    expect(resourceLoader.areSceneAssetsReady('Scene2')).to.be(true);
    expect(resourceLoader.areSceneAssetsLoaded('Scene3')).to.be(false);
    expect(resourceLoader.areSceneAssetsReady('Scene3')).to.be(false);

    // Background loading should have started for Scene3
    await delay(20); // Wait for background loading to start
    expect(
      mockedResourceManager.isResourceDownloadPending('scene3-resource1.png')
    ).to.be(true);
    expect(
      mockedResourceManager.isResourceDownloadPending('shared-resource.png')
      // shared-resource.png should already be loaded, so not pending:
    ).to.be(false);

    // Mark Scene3 resources as loaded
    mockedResourceManager.markPendingResourcesAsLoaded('scene3-resource1.png');
    await delay(10);

    // All scenes should now be loaded
    expect(resourceLoader.areSceneAssetsLoaded('Scene3')).to.be(true);
    expect(resourceLoader.areSceneAssetsReady('Scene3')).to.be(true);
  });

  it('should unload only resources unique to the unloaded scene', async () => {
    const mockedResourceManager = new EnhancedMockedResourceManager();
    // @ts-ignore
    const runtimeGame = gdjs.getPixiRuntimeGame(gameSettingsWithThreeScenes);
    runtimeGame._resourcesLoader._resourceManagersMap.set(
      // @ts-ignore
      'fake-heavy-resource-kind',
      mockedResourceManager
    );

    const resourceLoader = runtimeGame._resourcesLoader;

    // Load all resources for all scenes
    resourceLoader.loadGlobalAndFirstSceneResources('Scene1', () => {});
    mockedResourceManager.markPendingResourcesAsLoaded('scene1-resource1.png');
    mockedResourceManager.markPendingResourcesAsLoaded('scene1-resource2.png');

    resourceLoader.loadAndProcessSceneResources('Scene2');
    mockedResourceManager.markPendingResourcesAsLoaded('scene2-resource1.png');
    mockedResourceManager.markPendingResourcesAsLoaded('shared-resource.png');
    await delay(10);

    resourceLoader.loadAndProcessSceneResources('Scene3');
    mockedResourceManager.markPendingResourcesAsLoaded('scene3-resource1.png');
    await delay(10);

    // Verify all resources are loaded
    expect(
      mockedResourceManager.isResourceLoaded('scene1-resource1.png')
    ).to.be(true);
    expect(
      mockedResourceManager.isResourceLoaded('scene1-resource2.png')
    ).to.be(true);
    expect(
      mockedResourceManager.isResourceLoaded('scene2-resource1.png')
    ).to.be(true);
    expect(
      mockedResourceManager.isResourceLoaded('scene3-resource1.png')
    ).to.be(true);
    expect(mockedResourceManager.isResourceLoaded('shared-resource.png')).to.be(
      true
    );

    // Verify no resources are disposed initially
    expect(
      mockedResourceManager.isResourceDisposed('scene1-resource1.png')
    ).to.be(false);
    expect(
      mockedResourceManager.isResourceDisposed('scene1-resource2.png')
    ).to.be(false);
    expect(
      mockedResourceManager.isResourceDisposed('scene2-resource1.png')
    ).to.be(false);
    expect(
      mockedResourceManager.isResourceDisposed('scene3-resource1.png')
    ).to.be(false);
    expect(
      mockedResourceManager.isResourceDisposed('shared-resource.png')
    ).to.be(false);

    // Simulate Scene2 and Scene3 being loaded/active by marking Scene1 as unloaded
    // while Scene2 will be the new scene
    resourceLoader.unloadSceneResources({
      unloadedSceneName: 'Scene1',
      newSceneName: 'Scene2',
    });

    // Only Scene1-specific resources should be disposed
    // shared-resource.png should NOT be disposed because it's used in Scene2 and Scene3
    expect(
      mockedResourceManager.isResourceDisposed('scene1-resource1.png')
    ).to.be(true);
    expect(
      mockedResourceManager.isResourceDisposed('scene1-resource2.png')
    ).to.be(true);
    expect(
      mockedResourceManager.isResourceDisposed('scene2-resource1.png')
    ).to.be(false);
    expect(
      mockedResourceManager.isResourceDisposed('scene3-resource1.png')
    ).to.be(false);
    expect(
      mockedResourceManager.isResourceDisposed('shared-resource.png')
    ).to.be(false);

    // Scene1 should be marked as not loaded
    expect(resourceLoader.areSceneAssetsLoaded('Scene1')).to.be(false);
    expect(resourceLoader.areSceneAssetsReady('Scene1')).to.be(false);

    // Other scenes should still be loaded
    expect(resourceLoader.areSceneAssetsLoaded('Scene2')).to.be(true);
    expect(resourceLoader.areSceneAssetsReady('Scene2')).to.be(true);
    expect(resourceLoader.areSceneAssetsLoaded('Scene3')).to.be(true);
    expect(resourceLoader.areSceneAssetsReady('Scene3')).to.be(true);
  });

  it('should unload shared resources only when no other scene uses them', async () => {
    const mockedResourceManager = new EnhancedMockedResourceManager();
    // @ts-ignore
    const runtimeGame = gdjs.getPixiRuntimeGame(gameSettingsWithThreeScenes);
    runtimeGame._resourcesLoader._resourceManagersMap.set(
      // @ts-ignore
      'fake-heavy-resource-kind',
      mockedResourceManager
    );

    const resourceLoader = runtimeGame._resourcesLoader;

    // Load all resources for all scenes
    resourceLoader.loadAllResources(() => {});
    await delay(10);

    // First, unload Scene2 (which shares resources with Scene3)
    resourceLoader.unloadSceneResources({
      unloadedSceneName: 'Scene2',
      newSceneName: 'Scene3',
    });

    // Only Scene2-specific resources should be disposed
    // shared-resource.png should NOT be disposed because it's still used in Scene3
    expect(
      mockedResourceManager.isResourceDisposed('scene2-resource1.png')
    ).to.be(true);
    expect(
      mockedResourceManager.isResourceDisposed('shared-resource.png')
    ).to.be(false);

    // Now unload Scene3 (which also uses shared-resource.png)
    resourceLoader.unloadSceneResources({
      unloadedSceneName: 'Scene3',
      newSceneName: 'Scene1',
    });

    // Now shared-resource.png should be disposed because no loaded scene uses it
    expect(
      mockedResourceManager.isResourceDisposed('scene3-resource1.png')
    ).to.be(true);
    expect(
      mockedResourceManager.isResourceDisposed('shared-resource.png')
    ).to.be(true);

    // Scene1 resources should still be loaded
    expect(
      mockedResourceManager.isResourceDisposed('scene1-resource1.png')
    ).to.be(false);
    expect(
      mockedResourceManager.isResourceDisposed('scene1-resource2.png')
    ).to.be(false);
  });

  it('should handle background scene loading progress correctly', async () => {
    const mockedResourceManager = new EnhancedMockedResourceManager();
    // @ts-ignore
    const runtimeGame = gdjs.getPixiRuntimeGame(gameSettingsWithThreeScenes);
    runtimeGame._resourcesLoader._resourceManagersMap.set(
      // @ts-ignore
      'fake-heavy-resource-kind',
      mockedResourceManager
    );

    const resourceLoader = runtimeGame._resourcesLoader;

    // Initially progress should be 0
    expect(resourceLoader.getSceneLoadingProgress('Scene1')).to.be(0);
    expect(resourceLoader.getSceneLoadingProgress('Scene2')).to.be(0);

    // Start loading first scene
    runtimeGame.loadFirstAssetsAndStartBackgroundLoading('Scene1');
    mockedResourceManager.markPendingResourcesAsLoaded('scene1-resource1.png');
    mockedResourceManager.markPendingResourcesAsLoaded('scene1-resource2.png');
    await delay(10);

    // Progress should still be 0 until resources start loading
    expect(resourceLoader.getSceneLoadingProgress('Scene2')).to.be(0);

    // Mark first resource as loaded
    mockedResourceManager.markPendingResourcesAsLoaded('scene2-resource1.png');
    await delay(10);

    // Progress should be partial (1 out of 2 resources)
    console.log(resourceLoader.getSceneLoadingProgress('Scene2'));
    expect(resourceLoader.getSceneLoadingProgress('Scene2')).to.be(0.5);

    // Mark second resource as loaded
    mockedResourceManager.markPendingResourcesAsLoaded('shared-resource.png');
    await delay(10);

    // Progress should be complete (1.0)
    expect(resourceLoader.getSceneLoadingProgress('Scene2')).to.be(1);
  });
});
