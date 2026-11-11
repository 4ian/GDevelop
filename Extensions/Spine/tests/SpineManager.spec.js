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

  /**
   * @param {{ resources?: ResourceData[], nextSceneResources?: Array<{ name: string }> }} [settings]
   */
  const createTestContext = ({
    resources = createSpineResources(),
    nextSceneResources = [],
  } = {}) => {
    const runtimeGame = gdjs.getPixiRuntimeGame({
      resources: { resources },
      layouts: [
        createSceneData({
          name: 'Scene1',
          usedResources: resources.map(({ name }) => ({ name })),
        }),
        createSceneData({
          name: 'Scene2',
          usedResources: nextSceneResources,
        }),
      ],
    });
    const resourceLoader = runtimeGame.getResourceLoader();
    const spineManager = resourceLoader.getSpineManager();
    const atlasManager = resourceLoader.getSpineAtlasManager();
    if (!spineManager || !atlasManager) {
      throw new Error('Spine managers should be registered.');
    }
    const unloadSpineResources = () =>
      Promise.all(
        resources.map((resource) =>
          resource.kind === 'spine'
            ? spineManager.unloadResource(resource)
            : resource.kind === 'atlas'
              ? atlasManager.unloadResource(resource)
              : Promise.resolve()
        )
      );
    return {
      resources,
      runtimeGame,
      resourceLoader,
      imageManager: runtimeGame.getImageManager(),
      spineManager,
      atlasManager,
      unloadSpineResources,
      cleanup: async () => {
        await unloadSpineResources();
        resourceLoader.unloadAllResources();
      },
    };
  };

  it('awaits imageManager.loadResource instead of calling getOrLoadPIXITexture when loading an atlas', async () => {
    const { imageManager, atlasManager, cleanup } = createTestContext();

    let getOrLoadCalled = false;
    const originalGetOrLoad =
      imageManager.getOrLoadPIXITexture.bind(imageManager);
    imageManager.getOrLoadPIXITexture = (resourceName) => {
      getOrLoadCalled = true;
      return originalGetOrLoad(resourceName);
    };

    try {
      await atlasManager.loadResource('spineboy.atlas');
      expect(getOrLoadCalled).to.be(false);
      expect(atlasManager.isLoaded('spineboy.atlas')).to.be(true);
      const texture = imageManager.getPIXITexture('spineboy.png');
      expect(texture).not.to.be(imageManager.getInvalidPIXITexture());
      expect(texture.valid).to.be(true);
    } finally {
      imageManager.getOrLoadPIXITexture = originalGetOrLoad;
      await cleanup();
    }
  });

  it('reloads Spine resources after scene unload without throwing on destroyed BaseTexture', async () => {
    const {
      resourceLoader,
      spineManager,
      atlasManager,
      unloadSpineResources,
      cleanup,
    } = createTestContext();

    try {
      // First load of Scene1
      await resourceLoader.loadAndProcessSceneResources('Scene1');
      expect(atlasManager.isLoaded('spineboy.atlas')).to.be(true);
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
      expect(atlasManager.isLoaded('spineboy.atlas')).to.be(false);
      expect(spineManager.isSpineLoaded('spineboy.json')).to.be(false);

      await unloadSpineResources();

      await resourceLoader.loadAndProcessSceneResources('Scene1');
      expect(atlasManager.isLoaded('spineboy.atlas')).to.be(true);
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
      await cleanup();
    }
  });

  it('does not destroy PixiImageManager texture when unloading an atlas whose image is shared with another scene', async () => {
    const {
      resourceLoader,
      imageManager,
      spineManager,
      unloadSpineResources,
      cleanup,
    } = createTestContext({
      nextSceneResources: [{ name: 'spineboy.png' }],
    });

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

      await unloadSpineResources();

      const sharedTextureAfterUnload =
        imageManager.getPIXITexture('spineboy.png');
      expect(sharedTextureAfterUnload).to.be(sharedTextureBeforeUnload);
      expect(sharedTextureAfterUnload.destroyed).to.be(false);
      expect(sharedTextureAfterUnload.baseTexture).not.to.be(null);

      await resourceLoader.loadAndProcessSceneResources('Scene1');
      expect(spineManager.isSpineLoaded('spineboy.json')).to.be(true);
    } finally {
      await cleanup();
    }
  });

  it('clears _loadingSpineAtlases when loading fails so subsequent retries succeed', async () => {
    const { atlasManager, cleanup } = createTestContext();

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
        await atlasManager.getOrLoad('spineboy.atlas');
      } catch (err) {
        firstError = err;
      }
      expect(firstError).not.to.be(null);
      expect(atlasManager.isLoaded('spineboy.atlas')).to.be(false);

      // Retry should not return the cached rejected promise
      const atlas = await atlasManager.getOrLoad('spineboy.atlas');
      expect(atlas).to.be.ok();
      expect(atlasManager.isLoaded('spineboy.atlas')).to.be(true);
    } finally {
      PIXI.Assets.load = originalAssetsLoad;
      await cleanup();
    }
  });

  it('handles immediate synchronous reload right after unload without async unload race', async () => {
    const { resourceLoader, spineManager, cleanup } = createTestContext();

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
      await cleanup();
    }
  });

  for (const loadingStage of ['image', 'atlas']) {
    for (const reloadCount of [0, 1, 2]) {
      it(`unloads an atlas during ${loadingStage} loading with ${reloadCount} queued reloads without destroying its shared image`, async () => {
        const { resources, imageManager, atlasManager, cleanup } =
          createTestContext();
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
          await cleanup();
        }
      });
    }
  }

  for (const loadingStage of ['atlas', 'json']) {
    it(`unloads a skeleton during ${loadingStage} fetching without repopulating its cache`, async () => {
      const { resources, spineManager, cleanup } = createTestContext();
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
        await cleanup();
      }
    });
  }

  it('cleans up a failed in-flight atlas load during unload and allows a retry', async () => {
    const { resources, atlasManager, cleanup } = createTestContext();
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
      await cleanup();
    }
  });

  for (const kind of ['spine', 'atlas']) {
    it(`loads a shared ${kind} file concurrently under both resource names`, async () => {
      const resources = createSpineResources();
      const resource = resources[kind === 'spine' ? 1 : 0];
      const duplicate = { ...resource, name: `duplicate-${resource.name}` };
      resources.push(duplicate);
      const { spineManager, atlasManager, cleanup } = createTestContext({
        resources,
      });
      const manager = kind === 'spine' ? spineManager : atlasManager;
      const fetchSpy = sinon.spy(PIXI.settings.ADAPTER, 'fetch');

      try {
        await Promise.all([
          manager.loadResource(resource.name),
          manager.loadResource(duplicate.name),
        ]);
        if (kind === 'spine') {
          expect(spineManager.isSpineLoaded(duplicate.name)).to.be(true);
          expect(spineManager.getSpineAliases(duplicate.name)).to.be(
            spineManager.getSpineAliases(resource.name)
          );
        } else {
          expect(atlasManager.isLoaded(duplicate.name)).to.be(true);
          expect(atlasManager.getAtlasTexture(duplicate.name)).to.be(
            atlasManager.getAtlasTexture(resource.name)
          );
          expect(atlasManager.getAtlasAlias(duplicate.name)).to.be(
            atlasManager.getAtlasAlias(resource.name)
          );
        }
        expect(
          fetchSpy
            .getCalls()
            .filter((call) => String(call.args[0]).includes(resource.file))
            .length
        ).to.be(1);
      } finally {
        fetchSpy.restore();
        await cleanup();
      }
    });

    it(`retries a failed shared ${kind} load through the other resource name`, async () => {
      const resources = createSpineResources();
      const resource = resources[kind === 'spine' ? 1 : 0];
      const duplicate = { ...resource, name: `duplicate-${resource.name}` };
      resources.push(duplicate);
      const { spineManager, atlasManager, cleanup } = createTestContext({
        resources,
      });
      const manager = kind === 'spine' ? spineManager : atlasManager;
      const originalFetch = PIXI.settings.ADAPTER.fetch.bind(
        PIXI.settings.ADAPTER
      );
      const fetchStub = sinon
        .stub(PIXI.settings.ADAPTER, 'fetch')
        .callsFake(async (...args) => {
          if (String(args[0]).includes(resource.file)) {
            throw new Error('Transient fetch failure');
          }
          return originalFetch(...args);
        });

      try {
        await Promise.all(
          [resource, duplicate].map(({ name }) =>
            manager.loadResource(name).then(
              () => {
                throw new Error('Expected the shared load to fail.');
              },
              (error) => {
                expect(String(error)).to.contain('Transient fetch failure');
              }
            )
          )
        );
        fetchStub.callsFake(originalFetch);
        await manager.loadResource(duplicate.name);
        expect(
          kind === 'spine'
            ? spineManager.isSpineLoaded(duplicate.name)
            : atlasManager.isLoaded(duplicate.name)
        ).to.be(true);
      } finally {
        fetchStub.restore();
        await cleanup();
      }
    });

    it(`unloads the registered ${kind} URL when the in-game editor cache token changes`, async () => {
      const { resources, runtimeGame, spineManager, atlasManager, cleanup } =
        createTestContext();
      const resource = resources[kind === 'spine' ? 1 : 0];
      const manager = kind === 'spine' ? spineManager : atlasManager;
      const editorStub = sinon
        .stub(runtimeGame, 'isInGameEdition')
        .returns(true);
      const dateStub = sinon.stub(Date, 'now').returns(100);
      let initialAlias = '';

      try {
        await manager.loadResource(resource.name);
        initialAlias = runtimeGame
          .getResourceLoader()
          .getFullUrl(resource.file);
        expect(PIXI.Assets.cache.has(initialAlias)).to.be(true);
        dateStub.returns(200);
        await manager.unloadResource(resource);
        expect(PIXI.Assets.cache.has(initialAlias)).to.be(false);

        await spineManager.loadResource('spineboy.json');
        dateStub.returns(300);
        const aliases = spineManager.getSpineAliases('spineboy.json');
        if (!aliases) throw new Error('Expected the reloaded Spine aliases.');
        expect(atlasManager.getAtlasAlias('spineboy.atlas')).to.be(
          aliases.atlasAlias
        );
        const spineObject = spine.Spine.from({
          skeleton: aliases.skeletonAlias,
          atlas: aliases.atlasAlias,
          autoUpdate: false,
        });
        expect(spineObject).to.be.a(spine.Spine);
        spineObject.destroy();
      } finally {
        dateStub.returns(100);
        await cleanup();
        if (initialAlias) await PIXI.Assets.unload(initialAlias);
        dateStub.restore();
        editorStub.restore();
      }
    });
  }
});
