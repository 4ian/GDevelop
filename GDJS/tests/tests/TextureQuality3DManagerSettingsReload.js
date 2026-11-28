// @ts-check
describe('gdjs.TextureQuality3DManager settings reload', () => {
  /**
   * Regression tests for the reload of the "3D Texture Quality" project
   * settings when the project data is replaced (see `TQ-005`).
   *
   * Replacing the project data of a running game is what the editor
   * hot-reload does: the debugger client receives a `hotReload` command and
   * calls `gdjs.HotReloader.hotReload`, which ends up calling
   * `gdjs.RuntimeGame.setProjectData` on the running game (see
   * `GDJS/Runtime/debugger-client/hot-reloader.ts`).
   *
   * These tests need no WebGL renderer: the settings are applied to the
   * tracked textures as soon as they are loaded (capabilities are only used
   * to clamp anisotropy and resolutions to the device limits).
   */

  /** @type {gdjs.RuntimeGame[]} */
  const runtimeGames = [];

  afterEach(() => {
    for (const runtimeGame of runtimeGames.splice(0)) {
      runtimeGame.dispose(true);
    }
  });

  /**
   * Build the "extension properties" saved in the project for the texture
   * quality settings (like the editor does).
   * @param {Object<string, string | number | boolean>} values
   */
  const makeExtensionProperties = (values) =>
    Object.keys(values).map((property) => ({
      extension: gdjs.textureQuality3dPropertiesNamespace,
      property,
      value: String(values[property]),
    }));

  /**
   * @param {Object<string, string | number | boolean>} [values]
   * @returns {gdjs.RuntimeGame}
   */
  const makeGame = (values) => {
    const runtimeGame = gdjs.getPixiRuntimeGame({
      propertiesOverrides: {
        extensionProperties: makeExtensionProperties(values || {}),
      },
    });
    runtimeGames.push(runtimeGame);
    return runtimeGame;
  };

  /**
   * Replace the whole project data of a running game, like the hot-reload of
   * the editor does.
   * @param {gdjs.RuntimeGame} runtimeGame
   * @param {Object<string, string | number | boolean>} values
   */
  const hotReloadProjectData = (runtimeGame, values) => {
    runtimeGame.setProjectData(
      gdjs.createProjectData({
        propertiesOverrides: {
          extensionProperties: makeExtensionProperties(values),
        },
      })
    );
  };

  const makeTexture = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 8;
    canvas.height = 8;
    const context = /** @type {CanvasRenderingContext2D} */ (
      canvas.getContext('2d')
    );
    context.fillStyle = '#ff0000';
    context.fillRect(0, 0, 8, 8);
    return new THREE.CanvasTexture(canvas);
  };

  it('reloads the project settings when the project data is replaced', () => {
    const runtimeGame = makeGame({
      enabled: true,
      preset: 'custom',
      filtering: 'nearest',
      mipmapMode: 'forceOff',
      maxTextureResolution: 1024,
    });
    const manager = runtimeGame.getTextureQuality3DManager();
    expect(manager.getSettings().filtering).to.be('nearest');
    expect(manager.getSettings().maxTextureResolution).to.be(1024);

    hotReloadProjectData(runtimeGame, {
      enabled: true,
      preset: 'custom',
      filtering: 'bilinear',
      mipmapMode: 'forceOn',
      maxTextureResolution: 512,
    });

    const settings = manager.getSettings();
    expect(settings.filtering).to.be('bilinear');
    expect(settings.mipmapMode).to.be('forceOn');
    expect(settings.maxTextureResolution).to.be(512);
  });

  it('applies the reloaded settings to the already tracked textures', () => {
    const runtimeGame = makeGame({
      enabled: true,
      filtering: 'nearest',
      mipmapMode: 'forceOff',
    });
    const manager = runtimeGame.getTextureQuality3DManager();
    const texture = makeTexture();
    manager.applyToTexture(texture, { label: 'test', kind: 'image' });
    expect(texture.magFilter).to.be(THREE.NearestFilter);
    expect(texture.minFilter).to.be(THREE.NearestFilter);
    expect(texture.generateMipmaps).to.be(false);
    const versionAfterApply = texture.version;

    hotReloadProjectData(runtimeGame, {
      enabled: true,
      filtering: 'trilinear',
      mipmapMode: 'forceOn',
    });

    expect(texture.magFilter).to.be(THREE.LinearFilter);
    expect(texture.minFilter).to.be(THREE.LinearMipmapLinearFilter);
    expect(texture.generateMipmaps).to.be(true);
    // The texture must be re-uploaded to the GPU for the new filters to
    // reach `texParameteri`.
    expect(texture.version).to.be.above(versionAfterApply);
  });

  it('takes into account a change from disabled to enabled', () => {
    const runtimeGame = makeGame({});
    const manager = runtimeGame.getTextureQuality3DManager();
    expect(manager.getSettings().enabled).to.be(false);

    const texture = makeTexture();
    manager.applyToTexture(texture, { label: 'test', kind: 'image' });
    // The system is disabled: the texture is left untouched.
    expect(texture.magFilter).to.be(THREE.LinearFilter);

    hotReloadProjectData(runtimeGame, {
      enabled: true,
      filtering: 'nearest',
      mipmapMode: 'forceOff',
    });

    expect(manager.getSettings().enabled).to.be(true);
    expect(texture.magFilter).to.be(THREE.NearestFilter);
    expect(texture.minFilter).to.be(THREE.NearestFilter);
  });

  it('takes into account a change from enabled to disabled', () => {
    const runtimeGame = makeGame({
      enabled: true,
      filtering: 'nearest',
      mipmapMode: 'forceOff',
    });
    const manager = runtimeGame.getTextureQuality3DManager();
    const texture = makeTexture();
    manager.applyToTexture(texture, { label: 'test', kind: 'image' });
    expect(texture.magFilter).to.be(THREE.NearestFilter);
    const versionAfterApply = texture.version;

    hotReloadProjectData(runtimeGame, { enabled: false });

    expect(manager.getSettings().enabled).to.be(false);
    // The tracked texture is not modified again (its original filters are
    // *not* restored: restoring them is the separate `TQ-002` finding).
    expect(texture.version).to.be(versionAfterApply);

    // Newly loaded textures are left untouched again.
    const newTexture = makeTexture();
    manager.applyToTexture(newTexture, { label: 'new', kind: 'image' });
    expect(newTexture.magFilter).to.be(THREE.LinearFilter);
  });

  it('is idempotent when the project data is replaced repeatedly', () => {
    const runtimeGame = makeGame({
      enabled: true,
      filtering: 'bilinear',
      mipmapMode: 'forceOff',
      maxTextureResolution: 4,
    });
    const manager = runtimeGame.getTextureQuality3DManager();
    const texture = makeTexture();
    manager.applyToTexture(texture, { label: 'test', kind: 'image' });
    const versionAfterApply = texture.version;
    const memoryAfterApply = manager.getTextureMemoryBytes();

    const values = {
      enabled: true,
      filtering: 'bilinear',
      mipmapMode: 'forceOff',
      maxTextureResolution: 4,
    };
    hotReloadProjectData(runtimeGame, values);
    hotReloadProjectData(runtimeGame, values);

    // No duplicate tracking entries, no redundant re-uploads and a stable
    // memory estimation.
    expect(manager.getTrackedTextureCount()).to.be(1);
    expect(texture.version).to.be(versionAfterApply);
    expect(manager.getTextureMemoryBytes()).to.be(memoryAfterApply);
    expect(manager.getSettings().filtering).to.be('bilinear');
    expect(manager.getSettings().maxTextureResolution).to.be(4);
  });

  it('makes runtime changes survive the reload and take precedence over the project settings', () => {
    const runtimeGame = makeGame({
      enabled: true,
      filtering: 'bilinear',
      mipmapMode: 'forceOff',
    });
    const manager = runtimeGame.getTextureQuality3DManager();
    const texture = makeTexture();
    manager.applyToTexture(texture, { label: 'test', kind: 'image' });

    // A runtime action changes the settings while the game is running.
    manager.updateSettings({ filtering: 'nearest' });
    expect(texture.minFilter).to.be(THREE.NearestFilter);

    // The runtime change survives the hot-reload and wins over the new
    // project value (runtime overrides have priority over project settings).
    hotReloadProjectData(runtimeGame, {
      enabled: true,
      filtering: 'bilinear',
      mipmapMode: 'forceOff',
    });
    expect(manager.getSettings().filtering).to.be('nearest');
    expect(manager.getProjectSettings().filtering).to.be('bilinear');
    expect(texture.minFilter).to.be(THREE.NearestFilter);

    // Removing the override returns to the latest project setting.
    manager.removeRuntimeOverride('filtering');
    expect(manager.getSettings().filtering).to.be('bilinear');
    expect(texture.minFilter).to.be(THREE.LinearFilter);
    expect(texture.magFilter).to.be(THREE.LinearFilter);
  });

  it('does not reload the settings if the manager was disposed', () => {
    const runtimeGame = makeGame({
      enabled: true,
      filtering: 'nearest',
      mipmapMode: 'forceOff',
    });
    const manager = runtimeGame.getTextureQuality3DManager();
    const texture = makeTexture();
    manager.applyToTexture(texture, { label: 'test', kind: 'image' });
    manager.dispose();

    hotReloadProjectData(runtimeGame, {
      enabled: true,
      filtering: 'bilinear',
      mipmapMode: 'forceOn',
    });

    expect(manager.getSettings().filtering).to.be('nearest');
    expect(manager.getTrackedTextureCount()).to.be(0);
    expect(manager.getTextureMemoryBytes()).to.be(0);
  });

  it('reloads the settings through the hot-reload pipeline used by the editor preview', async () => {
    // A minimal project with one scene, like `gdjs.SceneStack` tests use.
    const createSceneData = (name) => ({
      r: 0,
      v: 0,
      b: 0,
      mangledName: name,
      name,
      objects: [],
      objectsGroups: [],
      layers: [],
      instances: [],
      behaviorsSharedData: [],
      stopSoundsOnStartup: false,
      title: '',
      renderer3DWorldScale: 100,
      variables: [],
      usedResources: [],
      uiSettings: {
        grid: false,
        gridType: /** @type {"rectangular"} */ ('rectangular'),
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
    const sceneData = createSceneData('Scene 1');

    const initialProjectData = gdjs.createProjectData({
      layouts: [sceneData],
      propertiesOverrides: {
        extensionProperties: makeExtensionProperties({
          enabled: true,
          filtering: 'nearest',
          mipmapMode: 'forceOff',
        }),
      },
    });
    const runtimeGame = new gdjs.RuntimeGame(initialProjectData);
    runtimeGames.push(runtimeGame);
    const manager = runtimeGame.getTextureQuality3DManager();

    // Start the scene, like a running preview.
    const renderer = new THREE.WebGLRenderer();
    manager.initializeWithRenderer(renderer);
    const capabilitiesBeforeReload = manager.getCapabilities();
    // `gdjs.projectData` is set by the generated game bootstrap when a game
    // starts (the hot-reloader diffs it against the new project data).
    const previousProjectData = gdjs.projectData;
    gdjs.projectData = initialProjectData;
    try {
      await runtimeGame.getResourceLoader().loadAllResources(() => {});
      runtimeGame.getSceneStack().push('Scene 1');

      const texture = makeTexture();
      manager.applyToTexture(texture, { label: 'test', kind: 'image' });
      expect(texture.magFilter).to.be(THREE.NearestFilter);

      // Do exactly what the debugger client does when the editor sends a
      // `hotReload` command (see `abstract-debugger-client.ts`).
      const hotReloader = new gdjs.HotReloader(runtimeGame);
      await hotReloader.hotReload({
        projectData: gdjs.createProjectData({
          layouts: [createSceneData('Scene 1')],
          propertiesOverrides: {
            extensionProperties: makeExtensionProperties({
              enabled: true,
              filtering: 'bilinear',
              mipmapMode: 'forceOn',
            }),
          },
        }),
        runtimeGameOptions: {},
        shouldReloadResources: false,
      });

      expect(manager.getSettings().filtering).to.be('bilinear');
      expect(manager.getSettings().mipmapMode).to.be('forceOn');
      expect(texture.magFilter).to.be(THREE.LinearFilter);
      expect(texture.minFilter).to.be(THREE.LinearMipmapLinearFilter);
      // The GPU capabilities are not re-detected on hot-reload.
      expect(manager.getCapabilities()).to.be(capabilitiesBeforeReload);
    } finally {
      gdjs.projectData = previousProjectData;
      renderer.dispose();
      renderer.forceContextLoss();
    }
  });
});
