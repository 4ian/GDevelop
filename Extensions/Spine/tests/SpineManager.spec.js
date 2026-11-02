// @ts-check
describe('gdjs.SpineManager & gdjs.SpineAtlasManager', () => {
  const createSpineResources = () => [
    {
      kind: /** @type {ResourceKind} */ ('atlas'),
      name: 'spineboy.atlas',
      file: 'base/GDJS/tests/games/capabilities/assets/spineboy.atlas',
      metadata: JSON.stringify({
        embeddedResourcesMapping: {
          'spineboy.png': 'spineboy.png',
        },
      }),
      userAdded: true,
    },
    {
      kind: /** @type {ResourceKind} */ ('spine'),
      name: 'spineboy.json',
      file: 'base/GDJS/tests/games/capabilities/assets/spineboy.json',
      metadata: JSON.stringify({
        embeddedResourcesMapping: {
          'spineboy.atlas': 'spineboy.atlas',
        },
      }),
      userAdded: true,
    },
    {
      kind: /** @type {ResourceKind} */ ('image'),
      name: 'spineboy.png',
      file: 'base/GDJS/tests/games/capabilities/assets/spineboy.png',
      metadata: '',
      smoothed: true,
      userAdded: true,
    },
  ];

  /**
   * @param {{ name: string, usedResources: Array<{ name: string }> }} params
   * @returns {LayoutData}
   */
  const createSceneData = ({ name, usedResources }) => ({
    r: 0,
    v: 0,
    b: 0,
    mangledName: name,
    name,
    objects: [],
    objectsGroups: [],
    layers: [
      {
        name: '',
        visibility: true,
        effects: [],
        cameras: [],
        ambientLightColorR: 0,
        ambientLightColorG: 0,
        ambientLightColorB: 0,
        isLightingLayer: false,
        followBaseLayerCamera: true,
      },
    ],
    instances: [],
    behaviorsSharedData: [],
    stopSoundsOnStartup: false,
    title: '',
    renderer3DWorldScale: 100,
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

  it('awaits imageManager.loadResource instead of calling getOrLoadPIXITexture when loading an atlas', async () => {
    const runtimeGame = gdjs.getPixiRuntimeGame({
      resources: { resources: createSpineResources() },
      layouts: [
        createSceneData({
          name: 'Scene1',
          // Alphabetical order as produced by SceneResourcesFinder:
          usedResources: [
            { name: 'spineboy.atlas' },
            { name: 'spineboy.json' },
            { name: 'spineboy.png' },
          ],
        }),
      ],
    });
    const resourceLoader = runtimeGame.getResourceLoader();
    const imageManager = runtimeGame.getImageManager();
    const spineAtlasManager = resourceLoader.getSpineAtlasManager();
    if (!spineAtlasManager) {
      throw new Error('SpineAtlasManager should be registered.');
    }

    let getOrLoadCalled = false;
    const originalGetOrLoad =
      imageManager.getOrLoadPIXITexture.bind(imageManager);
    imageManager.getOrLoadPIXITexture = (resourceName) => {
      getOrLoadCalled = true;
      return originalGetOrLoad(resourceName);
    };

    try {
      await spineAtlasManager.loadResource('spineboy.atlas');
      expect(getOrLoadCalled).to.be(false);
      expect(spineAtlasManager.isLoaded('spineboy.atlas')).to.be(true);
      const texture = imageManager.getPIXITexture('spineboy.png');
      expect(texture).not.to.be(imageManager.getInvalidPIXITexture());
      expect(texture.valid).to.be(true);
    } finally {
      imageManager.getOrLoadPIXITexture = originalGetOrLoad;
      resourceLoader.unloadAllResources();
    }
  });

  it('reloads Spine resources after scene unload without throwing on destroyed BaseTexture', async () => {
    const runtimeGame = gdjs.getPixiRuntimeGame({
      resources: { resources: createSpineResources() },
      layouts: [
        createSceneData({
          name: 'Scene1',
          usedResources: [
            { name: 'spineboy.atlas' },
            { name: 'spineboy.json' },
            { name: 'spineboy.png' },
          ],
        }),
        createSceneData({
          name: 'Scene2',
          usedResources: [],
        }),
      ],
    });
    const resourceLoader = runtimeGame.getResourceLoader();
    const spineManager = resourceLoader.getSpineManager();
    const spineAtlasManager = resourceLoader.getSpineAtlasManager();
    if (!spineManager || !spineAtlasManager) {
      throw new Error('Spine managers should be registered.');
    }

    try {
      // First load of Scene1
      await resourceLoader.loadAndProcessSceneResources('Scene1');
      expect(spineAtlasManager.isLoaded('spineboy.atlas')).to.be(true);
      expect(spineManager.isSpineLoaded('spineboy.json')).to.be(true);

      // Unload Scene1 when switching to Scene2
      resourceLoader.unloadSceneResources({
        unloadedSceneName: 'Scene1',
        newSceneName: 'Scene2',
      });
      expect(spineAtlasManager.isLoaded('spineboy.atlas')).to.be(false);
      expect(spineManager.isSpineLoaded('spineboy.json')).to.be(false);

      await new Promise((resolve) =>
        setTimeout(resolve, 20 /* allow async PIXI.Assets.unload to settle */)
      );

      await resourceLoader.loadAndProcessSceneResources('Scene1');
      expect(spineAtlasManager.isLoaded('spineboy.atlas')).to.be(true);
      expect(spineManager.isSpineLoaded('spineboy.json')).to.be(true);

      const aliases = spineManager.getSpineAliases('spineboy.json');
      if (!aliases) {
        throw new Error('Expected spine aliases to be available.');
      }
      const spineObject = spine.Spine.from({
        skeleton: aliases.skeletonAlias,
        atlas: aliases.atlasAlias,
        autoUpdate: false,
      });
      expect(spineObject).to.be.a(spine.Spine);
      spineObject.destroy();
    } finally {
      resourceLoader.unloadAllResources();
    }
  });

  it('does not destroy PixiImageManager texture when unloading an atlas whose image is shared with another scene', async () => {
    const runtimeGame = gdjs.getPixiRuntimeGame({
      resources: { resources: createSpineResources() },
      layouts: [
        createSceneData({
          name: 'Scene1',
          usedResources: [
            { name: 'spineboy.atlas' },
            { name: 'spineboy.json' },
            { name: 'spineboy.png' },
          ],
        }),
        createSceneData({
          name: 'Scene2',
          usedResources: [{ name: 'spineboy.png' }],
        }),
      ],
    });
    const resourceLoader = runtimeGame.getResourceLoader();
    const imageManager = runtimeGame.getImageManager();
    const spineManager = resourceLoader.getSpineManager();
    if (!spineManager) {
      throw new Error('SpineManager should be registered.');
    }

    try {
      await resourceLoader.loadAndProcessSceneResources('Scene1');
      await resourceLoader.loadAndProcessSceneResources('Scene2');

      const sharedTextureBeforeUnload =
        imageManager.getPIXITexture('spineboy.png');
      expect(sharedTextureBeforeUnload).not.to.be(
        imageManager.getInvalidPIXITexture()
      );
      expect(sharedTextureBeforeUnload.destroyed).to.be(false);

      // Unload Scene1 while Scene2 still uses spineboy.png
      resourceLoader.unloadSceneResources({
        unloadedSceneName: 'Scene1',
        newSceneName: 'Scene2',
      });

      await new Promise((resolve) =>
        setTimeout(resolve, 20 /* allow async PIXI.Assets.unload to settle */)
      );

      const sharedTextureAfterUnload =
        imageManager.getPIXITexture('spineboy.png');
      expect(sharedTextureAfterUnload).to.be(sharedTextureBeforeUnload);
      expect(sharedTextureAfterUnload.destroyed).to.be(false);
      expect(sharedTextureAfterUnload.baseTexture).not.to.be(null);

      await resourceLoader.loadAndProcessSceneResources('Scene1');
      expect(spineManager.isSpineLoaded('spineboy.json')).to.be(true);
    } finally {
      resourceLoader.unloadAllResources();
    }
  });

  it('clears _loadingSpineAtlases when loading fails so subsequent retries succeed', async () => {
    const runtimeGame = gdjs.getPixiRuntimeGame({
      resources: { resources: createSpineResources() },
      layouts: [
        createSceneData({
          name: 'Scene1',
          usedResources: [
            { name: 'spineboy.atlas' },
            { name: 'spineboy.json' },
            { name: 'spineboy.png' },
          ],
        }),
      ],
    });
    const resourceLoader = runtimeGame.getResourceLoader();
    const spineAtlasManager = resourceLoader.getSpineAtlasManager();
    if (!spineAtlasManager) {
      throw new Error('SpineAtlasManager should be registered.');
    }

    const originalAssetsLoad = PIXI.Assets.load.bind(PIXI.Assets);
    let shouldFailNextLoad = true;
    PIXI.Assets.load = /** @type {any} */ (
      async (...args) => {
        if (shouldFailNextLoad) {
          shouldFailNextLoad = false;
          throw new Error('Simulated transient network failure');
        }
        return originalAssetsLoad(...args);
      }
    );

    try {
      let firstError = null;
      try {
        await spineAtlasManager.getOrLoad('spineboy.atlas');
      } catch (err) {
        firstError = err;
      }
      expect(firstError).not.to.be(null);
      expect(spineAtlasManager.isLoaded('spineboy.atlas')).to.be(false);

      // Retry should not return the cached rejected promise
      const atlas = await spineAtlasManager.getOrLoad('spineboy.atlas');
      expect(atlas).to.be.ok();
      expect(spineAtlasManager.isLoaded('spineboy.atlas')).to.be(true);
    } finally {
      PIXI.Assets.load = originalAssetsLoad;
      resourceLoader.unloadAllResources();
    }
  });

  it('handles immediate synchronous reload right after unload without async unload race', async () => {
    const runtimeGame = gdjs.getPixiRuntimeGame({
      resources: { resources: createSpineResources() },
      layouts: [
        createSceneData({
          name: 'Scene1',
          usedResources: [
            { name: 'spineboy.atlas' },
            { name: 'spineboy.json' },
            { name: 'spineboy.png' },
          ],
        }),
        createSceneData({
          name: 'Scene2',
          usedResources: [],
        }),
      ],
    });
    const resourceLoader = runtimeGame.getResourceLoader();
    const spineManager = resourceLoader.getSpineManager();
    if (!spineManager) {
      throw new Error('SpineManager should be registered.');
    }

    try {
      await resourceLoader.loadAndProcessSceneResources('Scene1');

      // Unload and immediately reload in the same tick (before PIXI.Assets.unload microtask finishes)
      resourceLoader.unloadSceneResources({
        unloadedSceneName: 'Scene1',
        newSceneName: 'Scene2',
      });
      await resourceLoader.loadAndProcessSceneResources('Scene1');
      await new Promise((resolve) =>
        setTimeout(resolve, 20 /* allow async PIXI.Assets.unload to settle */)
      );

      const aliases = spineManager.getSpineAliases('spineboy.json');
      if (!aliases) {
        throw new Error('Expected spine aliases to be available.');
      }
      const spineObject = spine.Spine.from({
        skeleton: aliases.skeletonAlias,
        atlas: aliases.atlasAlias,
        autoUpdate: false,
      });
      expect(spineObject).to.be.a(spine.Spine);
      spineObject.destroy();
    } finally {
      resourceLoader.unloadAllResources();
    }
  });
});
