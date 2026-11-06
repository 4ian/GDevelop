// @ts-check
describe('gdjs.TextureQuality3DManager runtime overrides', () => {
  /**
   * Regression tests for the runtime overrides of the "3D Texture Quality"
   * settings (see `TQ-005`).
   *
   * Settings changed at runtime (by the actions of the 3D extension or by
   * `setRuntimeOverride`) are *runtime overrides*:
   * - they have priority over the project settings,
   * - they survive the hot-reload of the same running project,
   * - they stay until removed (`removeRuntimeOverride`/`clearRuntimeOverrides`)
   *   and return to the latest project setting when removed,
   * - they are never written into the persisted project settings,
   * - they are cleared for a new runtime session or another project.
   *
   * Effective value: `Runtime Override ?? Project Setting ?? Manager Default`.
   * GPU limits are always enforced on top of the effective settings.
   *
   * These tests need no WebGL renderer, except for the GPU limits test.
   */

  /** @type {gdjs.RuntimeGame[]} */
  const runtimeGames = [];
  /** @type {THREE.WebGLRenderer[]} */
  const renderers = [];

  afterEach(() => {
    renderers.splice(0).forEach((renderer) => {
      renderer.dispose();
      renderer.forceContextLoss();
    });
    for (const runtimeGame of runtimeGames.splice(0)) {
      runtimeGame.dispose(true);
    }
  });

  /**
   * @param {Object<string, string | number | boolean>} values
   */
  const makeExtensionProperties = (values) =>
    Object.keys(values).map((property) => ({
      extension: gdjs.textureQuality3dPropertiesNamespace,
      property,
      value: String(values[property]),
    }));

  /**
   * @param {string} projectUuid
   * @param {Object<string, string | number | boolean>} values
   */
  const makeProjectData = (projectUuid, values) =>
    gdjs.createProjectData({
      propertiesOverrides: {
        projectUuid,
        extensionProperties: makeExtensionProperties(values),
      },
    });

  /**
   * @param {string} [projectUuid]
   * @param {Object<string, string | number | boolean>} [values]
   */
  const makeGame = (projectUuid = 'project-a', values = {}) => {
    const runtimeGame = new gdjs.RuntimeGame(
      makeProjectData(projectUuid, values)
    );
    runtimeGames.push(runtimeGame);
    // Like the generated game bootstrap does (used by the hot-reloader).
    gdjs.projectData = makeProjectData(projectUuid, values);
    return runtimeGame;
  };

  /**
   * Replace the project data of the running game, like the hot-reload of the
   * editor does.
   * @param {gdjs.RuntimeGame} runtimeGame
   * @param {string} projectUuid
   * @param {Object<string, string | number | boolean>} values
   */
  const hotReloadProjectData = (runtimeGame, projectUuid, values) => {
    const projectData = makeProjectData(projectUuid, values);
    gdjs.projectData = projectData;
    runtimeGame.setProjectData(projectData);
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

  it('keeps one runtime override across hot reloads (override wins over project settings)', () => {
    const runtimeGame = makeGame('project-a', {
      enabled: true,
      filtering: 'bilinear',
      mipmapMode: 'forceOff',
    });
    const manager = runtimeGame.getTextureQuality3DManager();
    const texture = makeTexture();
    manager.applyToTexture(texture, { label: 'test', kind: 'image' });

    manager.setRuntimeOverride('filtering', 'nearest');
    expect(manager.getSettings().filtering).to.be('nearest');
    expect(texture.minFilter).to.be(THREE.NearestFilter);

    hotReloadProjectData(runtimeGame, 'project-a', {
      enabled: true,
      filtering: 'trilinear',
      mipmapMode: 'forceOn',
    });

    // The override survived the reload and keeps priority over the *new*
    // project setting. The project settings were refreshed.
    expect(manager.getSettings().filtering).to.be('nearest');
    expect(manager.getProjectSettings().filtering).to.be('trilinear');
    expect(manager.getRuntimeOverrides().filtering).to.be('nearest');
    expect(texture.magFilter).to.be(THREE.NearestFilter);
    // Settings without an override follow the new project values (the
    // "force on" mipmap mode upgrades the min filter to a mipmapped one).
    expect(manager.getSettings().mipmapMode).to.be('forceOn');
    expect(texture.generateMipmaps).to.be(true);
  });

  it('keeps multiple runtime overrides across hot reloads', () => {
    const runtimeGame = makeGame('project-a', {
      enabled: true,
      filtering: 'bilinear',
      mipmapMode: 'forceOff',
      anisotropy: 2,
      maxTextureResolution: 1024,
    });
    const manager = runtimeGame.getTextureQuality3DManager();
    manager.updateSettings({ anisotropy: 8, maxTextureResolution: 512 });
    manager.setRuntimeOverride('mipmapMode', 'forceOn');

    hotReloadProjectData(runtimeGame, 'project-a', {
      enabled: true,
      filtering: 'nearest',
      mipmapMode: 'forceOff',
      anisotropy: 1,
      maxTextureResolution: 2048,
    });

    const settings = manager.getSettings();
    expect(settings.anisotropy).to.be(8);
    expect(settings.maxTextureResolution).to.be(512);
    expect(settings.mipmapMode).to.be('forceOn');
    // The non-overridden setting follows the new project value.
    expect(settings.filtering).to.be('nearest');
    // `updateSettings` marks the preset as "custom" (documented behavior).
    expect(settings.preset).to.be('custom');
    expect(manager.getProjectSettings().anisotropy).to.be(1);
  });

  it('returns to the latest project setting when one override is removed after a hot reload', () => {
    const runtimeGame = makeGame('project-a', {
      enabled: true,
      filtering: 'nearest',
      anisotropy: 2,
    });
    const manager = runtimeGame.getTextureQuality3DManager();
    const texture = makeTexture();
    manager.applyToTexture(texture, { label: 'test', kind: 'image' });
    manager.updateSettings({ filtering: 'bilinear', anisotropy: 8 });

    hotReloadProjectData(runtimeGame, 'project-a', {
      enabled: true,
      filtering: 'nearest',
      anisotropy: 4,
    });

    expect(manager.removeRuntimeOverride('filtering')).to.be(true);
    // Back to the *latest* project setting ("nearest", reloaded above).
    expect(manager.getSettings().filtering).to.be('nearest');
    expect(texture.minFilter).to.be(THREE.NearestFilter);
    // The other override is untouched.
    expect(manager.getSettings().anisotropy).to.be(8);
    // Removing a setting that is not overridden changes nothing.
    expect(manager.removeRuntimeOverride('mipmapMode')).to.be(false);
    expect(manager.getSettings().anisotropy).to.be(8);
  });

  it('returns to the project settings when all overrides are removed', () => {
    const runtimeGame = makeGame('project-a', {
      enabled: true,
      filtering: 'nearest',
    });
    const manager = runtimeGame.getTextureQuality3DManager();
    const texture = makeTexture();
    manager.applyToTexture(texture, { label: 'test', kind: 'image' });
    manager.updateSettings({ filtering: 'bilinear', anisotropy: 8 });

    hotReloadProjectData(runtimeGame, 'project-a', {
      enabled: true,
      filtering: 'trilinear',
      mipmapMode: 'forceOn',
    });
    manager.clearRuntimeOverrides();

    expect(manager.getRuntimeOverrides()).to.eql({});
    expect(manager.getSettings()).to.eql(manager.getProjectSettings());
    expect(manager.getSettings().filtering).to.be('trilinear');
    expect(manager.getSettings().mipmapMode).to.be('forceOn');
    expect(texture.magFilter).to.be(THREE.LinearFilter);
    expect(texture.generateMipmaps).to.be(true);
  });

  it('applies project setting changes while overrides are active', () => {
    const runtimeGame = makeGame('project-a', {
      enabled: true,
      filtering: 'bilinear',
    });
    const manager = runtimeGame.getTextureQuality3DManager();
    manager.setRuntimeOverride('filtering', 'nearest');

    hotReloadProjectData(runtimeGame, 'project-a', {
      enabled: false,
      filtering: 'trilinear',
    });

    // The effective settings mix the refreshed project settings and the
    // preserved overrides.
    expect(manager.getSettings().enabled).to.be(false);
    expect(manager.getSettings().filtering).to.be('nearest');
    expect(manager.getProjectSettings().filtering).to.be('trilinear');
  });

  it('is stable under repeated set and remove operations', () => {
    const runtimeGame = makeGame('project-a', {
      enabled: true,
      filtering: 'bilinear',
      mipmapMode: 'forceOff',
    });
    const manager = runtimeGame.getTextureQuality3DManager();
    const texture = makeTexture();
    manager.applyToTexture(texture, { label: 'test', kind: 'image' });

    manager.setRuntimeOverride('filtering', 'nearest');
    manager.setRuntimeOverride('anisotropy', 4);
    const versionAfterOverrides = texture.version;
    for (let i = 0; i < 3; i++) {
      // Setting the same value again must not re-upload the texture.
      manager.setRuntimeOverride('filtering', 'nearest');
      manager.setRuntimeOverride('anisotropy', 4);
    }
    expect(texture.version).to.be(versionAfterOverrides);

    // Removing and re-setting is an actual change of the effective value.
    expect(manager.removeRuntimeOverride('filtering')).to.be(true);
    expect(manager.removeRuntimeOverride('filtering')).to.be(false);
    expect(manager.getSettings().filtering).to.be('bilinear');
    manager.setRuntimeOverride('filtering', 'nearest');
    expect(manager.getSettings().filtering).to.be('nearest');
    expect(manager.getSettings().anisotropy).to.be(4);
  });

  it('starts a new runtime session without any override', () => {
    const runtimeGame = makeGame('project-a', { filtering: 'bilinear' });
    const manager = runtimeGame.getTextureQuality3DManager();
    manager.updateSettings({ filtering: 'nearest' });
    expect(manager.getRuntimeOverrides().filtering).to.be('nearest');

    // A new runtime session is a new runtime game: it starts clean.
    const newRuntimeGame = makeGame('project-a', { filtering: 'bilinear' });
    const newManager = newRuntimeGame.getTextureQuality3DManager();
    expect(newManager.getRuntimeOverrides()).to.eql({});
    expect(newManager.getSettings().filtering).to.be('bilinear');

    // `clearRuntimeOverrides` is the explicit way to start a fresh session
    // on the same manager.
    manager.clearRuntimeOverrides();
    expect(manager.getRuntimeOverrides()).to.eql({});
    hotReloadProjectData(runtimeGame, 'project-a', { filtering: 'trilinear' });
    expect(manager.getRuntimeOverrides()).to.eql({});
    expect(manager.getSettings().filtering).to.be('trilinear');
  });

  it('does not leak overrides into another project loaded into the same runtime', () => {
    const runtimeGame = makeGame('project-a', {
      enabled: true,
      filtering: 'bilinear',
    });
    const manager = runtimeGame.getTextureQuality3DManager();
    manager.setRuntimeOverride('filtering', 'nearest');
    manager.setRuntimeOverride('anisotropy', 8);

    // Another project is loaded into the same runtime: its runtime session
    // starts without the overrides of the previous project.
    hotReloadProjectData(runtimeGame, 'project-b', {
      enabled: true,
      filtering: 'trilinear',
    });
    expect(manager.getRuntimeOverrides()).to.eql({});
    expect(manager.getSettings().filtering).to.be('trilinear');

    // Reloading the same project preserves the overrides again.
    manager.setRuntimeOverride('filtering', 'nearest');
    hotReloadProjectData(runtimeGame, 'project-b', {
      enabled: true,
      filtering: 'bilinear',
    });
    expect(manager.getRuntimeOverrides().filtering).to.be('nearest');
    expect(manager.getSettings().filtering).to.be('nearest');
    expect(manager.getProjectSettings().filtering).to.be('bilinear');
  });

  it('uses the manager default when neither an override nor a project setting exists', () => {
    const runtimeGame = makeGame('project-a', { enabled: true });
    const manager = runtimeGame.getTextureQuality3DManager();
    // `filtering` is not saved in the project: the manager default is used.
    expect(manager.getSettings().filtering).to.be('keep');

    manager.setRuntimeOverride('filtering', 'nearest');
    expect(manager.getSettings().filtering).to.be('nearest');

    manager.removeRuntimeOverride('filtering');
    expect(manager.getSettings().filtering).to.be('keep');
  });

  it('never lets runtime overrides bypass the GPU limits', () => {
    const runtimeGame = makeGame('project-a', { enabled: true });
    const manager = runtimeGame.getTextureQuality3DManager();
    const renderer = new THREE.WebGLRenderer();
    renderers.push(renderer);
    manager.initializeWithRenderer(renderer);
    const capabilities = manager.getCapabilities();
    if (!capabilities) throw new Error('The capabilities were not detected.');

    // Absurd values must be clamped to the hardware limits.
    manager.setRuntimeOverride('maxTextureResolution', 999999);
    manager.setRuntimeOverride('anisotropy', 999);
    expect(manager.getMaxTextureResolution()).to.be(capabilities.maxTextureSize);
    expect(manager.getMaxTextureResolution('cubemap')).to.be(
      capabilities.maxCubemapSize
    );

    const texture = makeTexture();
    manager.applyToTexture(texture, { label: 'test', kind: 'image' });
    expect(texture.anisotropy).to.be(
      Math.min(999, Math.max(1, capabilities.maxAnisotropy))
    );
  });
});
