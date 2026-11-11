// @ts-check
describe('gdjs.SpineManager & gdjs.SpineAtlasManager', () => {
  const createDeferred = () => {
    let resolve = () => {};
    /** @type {Promise<void>} */
    const promise = new Promise((resolvePromise) => {
      resolve = resolvePromise;
    });
    return { promise, resolve };
  };

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

  /** @param {gdjs.ResourceLoader} resourceLoader */
  const unloadSpineResources = async (resourceLoader) => {
    const atlasManager = resourceLoader.getSpineAtlasManager();
    const spineManager = resourceLoader.getSpineManager();
    if (!atlasManager || !spineManager) {
      throw new Error('Spine managers should be registered.');
    }
    const [atlasResource, spineResource] = createSpineResources();
    await Promise.all([
      spineManager.unloadResource(spineResource),
      atlasManager.unloadResource(atlasResource),
    ]);
  };

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
      await unloadSpineResources(resourceLoader);
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
      const initialAliases = spineManager.getSpineAliases('spineboy.json');
      if (!initialAliases) {
        throw new Error('Expected spine aliases to be available.');
      }
      const initialSpine = spine.Spine.from({
        skeleton: initialAliases.skeletonAlias,
        atlas: initialAliases.atlasAlias,
        autoUpdate: false,
      });
      const initialSkeletonData = initialSpine.skeleton.data;
      initialSpine.destroy();

      // Unload Scene1 when switching to Scene2
      resourceLoader.unloadSceneResources({
        unloadedSceneName: 'Scene1',
        newSceneName: 'Scene2',
      });
      expect(spineAtlasManager.isLoaded('spineboy.atlas')).to.be(false);
      expect(spineManager.isSpineLoaded('spineboy.json')).to.be(false);

      await unloadSpineResources(resourceLoader);

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
      expect(spineObject.skeleton.data).not.to.be(initialSkeletonData);
      spineObject.destroy();
    } finally {
      await unloadSpineResources(resourceLoader);
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

      await unloadSpineResources(resourceLoader);

      const sharedTextureAfterUnload =
        imageManager.getPIXITexture('spineboy.png');
      expect(sharedTextureAfterUnload).to.be(sharedTextureBeforeUnload);
      expect(sharedTextureAfterUnload.destroyed).to.be(false);
      expect(sharedTextureAfterUnload.baseTexture).not.to.be(null);

      await resourceLoader.loadAndProcessSceneResources('Scene1');
      expect(spineManager.isSpineLoaded('spineboy.json')).to.be(true);
    } finally {
      await unloadSpineResources(resourceLoader);
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
      await unloadSpineResources(resourceLoader);
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
      await unloadSpineResources(resourceLoader);
      resourceLoader.unloadAllResources();
    }
  });

  for (const loadingStage of ['image', 'atlas']) {
    for (const reloadCount of [0, 1, 2]) {
      it(`unloads an atlas during ${loadingStage} loading with ${reloadCount} queued reloads without destroying its shared image`, async () => {
        const resources = createSpineResources();
        const runtimeGame = gdjs.getPixiRuntimeGame({
          resources: { resources },
        });
        const imageManager = runtimeGame.getImageManager();
        const atlasManager = runtimeGame
          .getResourceLoader()
          .getSpineAtlasManager();
        if (!atlasManager) {
          throw new Error('SpineAtlasManager should be registered.');
        }
        await imageManager.loadResource('spineboy.png');
        const sharedTexture = imageManager.getPIXITexture('spineboy.png');
        const started = createDeferred();
        const gate = createDeferred();
        const originalImageLoad = imageManager.loadResource.bind(imageManager);
        const originalFetch = PIXI.settings.ADAPTER.fetch.bind(
          PIXI.settings.ADAPTER
        );
        const stub =
          loadingStage === 'image'
            ? sinon
                .stub(imageManager, 'loadResource')
                .callsFake(async (name) => {
                  started.resolve();
                  await gate.promise;
                  return originalImageLoad(name);
                })
            : sinon
                .stub(PIXI.settings.ADAPTER, 'fetch')
                .callsFake(async (...args) => {
                  if (String(args[0]).includes('spineboy.atlas')) {
                    started.resolve();
                    await gate.promise;
                  }
                  return originalFetch(...args);
                });

        try {
          const loading = atlasManager.getOrLoad('spineboy.atlas');
          await started.promise;
          const unloading = atlasManager.unloadResource(resources[0]);
          let reloading = null;
          const pendingOperations = [loading, unloading];
          for (let index = 0; index < reloadCount; index++) {
            reloading = atlasManager.getOrLoad('spineboy.atlas');
            pendingOperations.push(reloading);
            if (index < reloadCount - 1) {
              pendingOperations.push(atlasManager.unloadResource(resources[0]));
            }
          }
          gate.resolve();
          const initialAtlas = await loading;
          await Promise.all(pendingOperations);

          if (!reloading) {
            expect(atlasManager.isLoaded('spineboy.atlas')).to.be(false);
            expect(PIXI.Assets.cache.has(resources[0].file)).to.be(false);
          }
          const reloadedAtlas = await (reloading ||
            atlasManager.getOrLoad('spineboy.atlas'));
          expect(reloadedAtlas).not.to.be(initialAtlas);
          expect(atlasManager.getAtlasTexture('spineboy.atlas')).to.be(
            reloadedAtlas
          );
          expect(PIXI.Assets.get(resources[0].file)).to.be(reloadedAtlas);
          expect(sharedTexture.destroyed).to.be(false);
          const atlasTexture = reloadedAtlas.pages[0].texture;
          if (!(atlasTexture instanceof spine.SpineTexture)) {
            throw new Error('Expected the reloaded atlas page texture.');
          }
          expect(atlasTexture.texture).to.be(sharedTexture);
        } finally {
          gate.resolve();
          stub.restore();
          await atlasManager.unloadResource(resources[0]);
          runtimeGame.getResourceLoader().unloadAllResources();
        }
      });
    }
  }

  for (const loadingStage of ['atlas', 'json']) {
    it(`unloads a skeleton during ${loadingStage} fetching without repopulating its cache`, async () => {
      const resources = createSpineResources();
      const runtimeGame = gdjs.getPixiRuntimeGame({
        resources: { resources },
      });
      const resourceLoader = runtimeGame.getResourceLoader();
      const spineManager = resourceLoader.getSpineManager();
      const atlasManager = resourceLoader.getSpineAtlasManager();
      if (!spineManager || !atlasManager) {
        throw new Error('Spine managers should be registered.');
      }
      const started = createDeferred();
      const gate = createDeferred();
      const originalFetch = PIXI.settings.ADAPTER.fetch.bind(
        PIXI.settings.ADAPTER
      );
      const fetchStub = sinon
        .stub(PIXI.settings.ADAPTER, 'fetch')
        .callsFake(async (...args) => {
          if (String(args[0]).includes(`spineboy.${loadingStage}`)) {
            started.resolve();
            await gate.promise;
          }
          return originalFetch(...args);
        });

      try {
        const loading = spineManager.loadResource('spineboy.json');
        await started.promise;
        const unloading = spineManager.unloadResource(resources[1]);
        gate.resolve();
        await loading;
        await unloading;
        expect(spineManager.isSpineLoaded('spineboy.json')).to.be(false);
        expect(PIXI.Assets.cache.has(resources[1].file)).to.be(false);

        await spineManager.loadResource('spineboy.json');
        expect(spineManager.isSpineLoaded('spineboy.json')).to.be(true);
      } finally {
        gate.resolve();
        fetchStub.restore();
        await spineManager.unloadResource(resources[1]);
        await atlasManager.unloadResource(resources[0]);
        resourceLoader.unloadAllResources();
      }
    });
  }

  it('cleans up a failed in-flight atlas load during unload and allows a retry', async () => {
    const resources = createSpineResources();
    const runtimeGame = gdjs.getPixiRuntimeGame({
      resources: { resources },
    });
    const resourceLoader = runtimeGame.getResourceLoader();
    const atlasManager = resourceLoader.getSpineAtlasManager();
    if (!atlasManager) {
      throw new Error('SpineAtlasManager should be registered.');
    }
    const started = createDeferred();
    const gate = createDeferred();
    const originalFetch = PIXI.settings.ADAPTER.fetch.bind(
      PIXI.settings.ADAPTER
    );
    const fetchStub = sinon
      .stub(PIXI.settings.ADAPTER, 'fetch')
      .callsFake(async (...args) => {
        if (String(args[0]).includes('spineboy.atlas')) {
          started.resolve();
          await gate.promise;
          throw new Error('Atlas fetch failed');
        }
        return originalFetch(...args);
      });
    const errorSpy = sinon.spy(gdjs.Logger.prototype, 'error');

    try {
      const loading = atlasManager.getOrLoad('spineboy.atlas').then(
        () => {
          throw new Error('Expected the atlas load to fail.');
        },
        (error) => {
          expect(String(error)).to.contain('Atlas fetch failed');
        }
      );
      await started.promise;
      const unloading = atlasManager.unloadResource(resources[0]);
      gate.resolve();
      await Promise.all([loading, unloading]);
      expect(atlasManager.isLoaded('spineboy.atlas')).to.be(false);
      expect(
        errorSpy.calledWithMatch(
          'Error while unloading spine atlas resource spineboy.atlas:'
        )
      ).to.be(true);

      fetchStub.callsFake(originalFetch);
      await atlasManager.getOrLoad('spineboy.atlas');
      expect(atlasManager.isLoaded('spineboy.atlas')).to.be(true);
    } finally {
      gate.resolve();
      fetchStub.restore();
      errorSpy.restore();
      await unloadSpineResources(resourceLoader);
      resourceLoader.unloadAllResources();
    }
  });
});
