// @ts-check

/**
 * Tests for gdjs.ResourceLoader.
 */
describe('gdjs.ResourceLoader', () => {
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
      }
    };
  };

  /** @type {{layouts?: LayoutData[], resources?: ResourcesData}} */
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
          kind: 'fake-resource-kind-for-testing-only',
          name: 'scene1-resource1.png',
          metadata: '',
          file: 'scene1-resource1.png',
          userAdded: true,
        },
        {
          kind: 'fake-resource-kind-for-testing-only',
          name: 'scene1-resource2.png',
          metadata: '',
          file: 'scene1-resource2.png',
          userAdded: true,
        },
        {
          kind: 'fake-resource-kind-for-testing-only',
          name: 'scene2-resource1.png',
          metadata: '',
          file: 'scene2-resource1.png',
          userAdded: true,
        },
        {
          kind: 'fake-resource-kind-for-testing-only',
          name: 'scene3-resource1.png',
          metadata: '',
          file: 'scene3-resource1.png',
          userAdded: true,
        },
        {
          kind: 'fake-resource-kind-for-testing-only',
          name: 'shared-resource.png',
          metadata: '',
          file: 'shared-resource.png',
          userAdded: true,
        },
      ],
    },
  };

  it('should load first scene resources, then others in background', async () => {
    const mockedResourceManager = new gdjs.MockedResourceManager();
    const runtimeGame = gdjs.getPixiRuntimeGame(gameSettingsWithThreeScenes);
    const resourceLoader = runtimeGame.getResourceLoader();
    resourceLoader.injectMockResourceManagerForTesting(
      'fake-resource-kind-for-testing-only',
      mockedResourceManager
    );

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
    expect(resourceLoader.areSceneAssetsReady('Scene2')).to.be(false);

    // Scene 2 resources can be processed so the scene is fully ready:
    resourceLoader.loadAndProcessSceneResources('Scene2');
    await delay(10);

    expect(resourceLoader.areSceneAssetsLoaded('Scene2')).to.be(true);
    expect(resourceLoader.areSceneAssetsReady('Scene2')).to.be(true);

    // Scene 3 resources are not loaded nor processed yet:
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

    // Scene3 should now be loaded
    expect(resourceLoader.areSceneAssetsLoaded('Scene3')).to.be(true);
    expect(resourceLoader.areSceneAssetsReady('Scene3')).to.be(false);

    // Scene3 resources can be processed so the scene is fully ready:
    resourceLoader.loadAndProcessSceneResources('Scene3');
    await delay(10);

    expect(resourceLoader.areSceneAssetsLoaded('Scene3')).to.be(true);
    expect(resourceLoader.areSceneAssetsReady('Scene3')).to.be(true);
  });

  it('should unload only resources unique to the unloaded scene', async () => {
    const mockedResourceManager = new gdjs.MockedResourceManager();
    const runtimeGame = gdjs.getPixiRuntimeGame(gameSettingsWithThreeScenes);
    const resourceLoader = runtimeGame.getResourceLoader();
    resourceLoader.injectMockResourceManagerForTesting(
      'fake-resource-kind-for-testing-only',
      mockedResourceManager
    );

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
    expect(resourceLoader.areSceneAssetsReady('Scene1')).to.be(true);
    expect(resourceLoader.areSceneAssetsReady('Scene2')).to.be(true);
    expect(resourceLoader.areSceneAssetsReady('Scene3')).to.be(true);

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
    const mockedResourceManager = new gdjs.MockedResourceManager();
    const runtimeGame = gdjs.getPixiRuntimeGame(gameSettingsWithThreeScenes);
    const resourceLoader = runtimeGame.getResourceLoader();
    resourceLoader.injectMockResourceManagerForTesting(
      'fake-resource-kind-for-testing-only',
      mockedResourceManager
    );

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
    const mockedResourceManager = new gdjs.MockedResourceManager();
    const runtimeGame = gdjs.getPixiRuntimeGame(gameSettingsWithThreeScenes);
    const resourceLoader = runtimeGame.getResourceLoader();
    resourceLoader.injectMockResourceManagerForTesting(
      'fake-resource-kind-for-testing-only',
      mockedResourceManager
    );

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
