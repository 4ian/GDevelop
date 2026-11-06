// @ts-check
describe('gdjs.TextureQuality3DManager memory accounting', () => {
  /**
   * Regression tests for the GPU memory accounting and reporting (see
   * `TQ-007`).
   *
   * Field semantics (see `TextureQuality3DTextureEntry`):
   * - `memoryBytes`: per-texture estimate of the texture's images at their
   *   current size (mipmaps included); NOT additive over shared sources.
   * - `sourceMemoryBytes`: estimate of the shared source behind `sourceId`.
   * - `uniqueSourceMemoryBytes`: `sourceMemoryBytes` attributed to exactly
   *   one entry per source; additive (its sum is `textureMemoryBytes`).
   * - `sharedSourceCount`: number of tracked textures sharing the source.
   *
   * The aggregate (`getTextureMemoryBytes()` / `textureMemoryBytes`) counts
   * each source once, whatever the number of textures (clones) using it.
   *
   * These tests need no WebGL renderer: the accounting only reads the
   * images of the textures and the manager settings.
   */

  /** @type {gdjs.RuntimeGame[]} */
  const runtimeGames = [];

  afterEach(() => {
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
   * @param {Object<string, string | number | boolean>} [values]
   */
  const makeGame = (values = {}) => {
    const runtimeGame = gdjs.getPixiRuntimeGame({
      propertiesOverrides: {
        extensionProperties: makeExtensionProperties({
          enabled: true,
          ...values,
        }),
      },
    });
    runtimeGames.push(runtimeGame);
    return runtimeGame;
  };

  /**
   * @param {number} size
   */
  const makeImage = (size) => {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const context = /** @type {CanvasRenderingContext2D} */ (
      canvas.getContext('2d')
    );
    context.fillStyle = '#ff0000';
    context.fillRect(0, 0, size, size);
    return canvas;
  };

  /**
   * @param {number} [size]
   */
  const makeTexture = (size = 64) =>
    new THREE.CanvasTexture(makeImage(size));

  /**
   * The estimation formula of the manager, for uncompressed RGBA textures
   * (mipmaps add a third).
   * @param {THREE.Texture} texture
   */
  const expectedMemory = (texture) => {
    const image = /** @type {any} */ (texture.image);
    const faces = Array.isArray(image) ? image : [image];
    let width = 0;
    let height = 0;
    for (const face of faces) {
      if (!face) continue;
      width = Math.max(width, face.naturalWidth || face.width || 0);
      height = Math.max(height, face.naturalHeight || face.height || 0);
    }
    return Math.round(
      faces.length * width * height * 4 * (texture.generateMipmaps ? 4 / 3 : 1)
    );
  };

  it('counts a shared source once in the aggregate totals', () => {
    const runtimeGame = makeGame();
    const manager = runtimeGame.getTextureQuality3DManager();
    const texture = makeTexture(64);
    // A clone shares the image *and* the source (one GPU allocation), like
    // the cloned textures of 3D models (see `Model3DManager`).
    const clone = texture.clone();
    manager.applyToTexture(texture, { label: 'model', kind: 'model' });
    manager.applyToTexture(clone, { label: 'model', kind: 'model' });

    const memory = expectedMemory(texture);
    expect(memory).to.be.above(0);
    expect(manager.getTrackedTextureCount()).to.be(2);
    // The aggregate counts the shared source only once.
    expect(manager.getTextureMemoryBytes()).to.be(memory);

    const report = manager.getReport();
    expect(report.textureCount).to.be(2);
    expect(report.textureMemoryBytes).to.be(memory);
    // The additive field sums up to the aggregate...
    const uniqueSum = report.textures.reduce(
      (sum, entry) => sum + entry.uniqueSourceMemoryBytes,
      0
    );
    expect(uniqueSum).to.be(memory);
    // ...while the per-texture estimates are explicitly not additive.
    const perTextureSum = report.textures.reduce(
      (sum, entry) => sum + entry.memoryBytes,
      0
    );
    expect(perTextureSum).to.be(2 * memory);
    for (const entry of report.textures) {
      expect(entry.sourceId).to.be(texture.source.uuid);
      expect(entry.memoryBytes).to.be(memory);
      expect(entry.sourceMemoryBytes).to.be(memory);
      expect(entry.sharedSourceCount).to.be(2);
    }
    // Exactly one entry carries the unique-source memory.
    const attributed = report.textures.filter(
      (entry) => entry.uniqueSourceMemoryBytes > 0
    );
    expect(attributed.length).to.be(1);
    expect(attributed[0].uniqueSourceMemoryBytes).to.be(memory);
  });

  it('counts independent sources separately', () => {
    const runtimeGame = makeGame();
    const manager = runtimeGame.getTextureQuality3DManager();
    const textureA = makeTexture(64);
    const textureB = makeTexture(32);
    manager.applyToTexture(textureA, { label: 'a', kind: 'image' });
    manager.applyToTexture(textureB, { label: 'b', kind: 'image' });

    const memoryA = expectedMemory(textureA);
    const memoryB = expectedMemory(textureB);
    expect(manager.getTextureMemoryBytes()).to.be(memoryA + memoryB);

    const report = manager.getReport();
    for (const entry of report.textures) {
      // Each texture owns its source: both entries carry their own memory.
      expect(entry.sharedSourceCount).to.be(1);
      expect(entry.uniqueSourceMemoryBytes).to.be(entry.sourceMemoryBytes);
      expect(entry.uniqueSourceMemoryBytes).to.be(entry.memoryBytes);
    }
    const uniqueSum = report.textures.reduce(
      (sum, entry) => sum + entry.uniqueSourceMemoryBytes,
      0
    );
    expect(uniqueSum).to.be(memoryA + memoryB);
  });

  it('counts multiple clones sharing one image once', () => {
    const runtimeGame = makeGame();
    const manager = runtimeGame.getTextureQuality3DManager();
    const texture = makeTexture(64);
    const clones = [texture.clone(), texture.clone(), texture.clone()];
    manager.applyToTexture(texture, { label: 'model', kind: 'model' });
    for (const clone of clones) {
      manager.applyToTexture(clone, { label: 'model', kind: 'model' });
    }

    const memory = expectedMemory(texture);
    expect(manager.getTrackedTextureCount()).to.be(4);
    expect(manager.getTextureMemoryBytes()).to.be(memory);
    const report = manager.getReport();
    expect(report.textures.length).to.be(4);
    for (const entry of report.textures) {
      expect(entry.sourceMemoryBytes).to.be(memory);
      expect(entry.sharedSourceCount).to.be(4);
    }
  });

  it('updates the accounting when a source is resized', () => {
    const runtimeGame = makeGame();
    const manager = runtimeGame.getTextureQuality3DManager();
    const texture = makeTexture(256);
    manager.applyToTexture(texture, { label: 'image', kind: 'image' });
    expect(manager.getTextureMemoryBytes()).to.be(expectedMemory(texture));

    // Downscale to 64x64: the estimates follow the current images.
    manager.setRuntimeOverride('maxTextureResolution', 64);
    expect(texture.image.width).to.be(64);
    expect(manager.getTextureMemoryBytes()).to.be(expectedMemory(texture));
    expect(manager.getTextureMemoryBytes()).to.be(
      Math.round(64 * 64 * 4 * (4 / 3))
    );
    expect(manager.getReport().textures[0].width).to.be(64);

    // Repeated updates must not accumulate errors in the totals.
    for (let i = 0; i < 3; i++) {
      manager.setRuntimeOverride('maxTextureResolution', 64);
    }
    manager.updateSettings({ maxTextureResolution: 64 });
    expect(manager.getTextureMemoryBytes()).to.be(expectedMemory(texture));
    expect(manager.getTrackedTextureCount()).to.be(1);
  });

  it('updates the accounting when a source is restored', () => {
    const runtimeGame = makeGame();
    const manager = runtimeGame.getTextureQuality3DManager();
    const texture = makeTexture(256);
    // Keep the original image, as a restoration feature would do.
    const originalImage = /** @type {any} */ (texture.image);
    manager.applyToTexture(texture, { label: 'image', kind: 'image' });
    const fullMemory = expectedMemory(texture);

    manager.setRuntimeOverride('maxTextureResolution', 64);
    expect(manager.getTextureMemoryBytes()).to.be(expectedMemory(texture));

    // Removing the resolution cap does not upscale the already downscaled
    // image (known limitation, see `TQ-003`): the estimate stays small.
    manager.removeRuntimeOverride('maxTextureResolution');
    expect(/** @type {any} */ (texture.image).width).to.be(64);
    expect(manager.getTextureMemoryBytes()).to.be(expectedMemory(texture));

    // "Restore": the image is replaced back with the original (this is what
    // a restoration of the original image would do) and the texture is
    // applied again: the accounting follows the current image.
    texture.image = originalImage;
    manager.applyToTexture(texture, { label: 'image', kind: 'image' });
    expect(manager.getTextureMemoryBytes()).to.be(fullMemory);
    // Repeated updates stay stable.
    manager.applyToTexture(texture, { label: 'image', kind: 'image' });
    expect(manager.getTextureMemoryBytes()).to.be(fullMemory);
    expect(manager.getTrackedTextureCount()).to.be(1);
  });

  it('keeps the source memory while one of its consumers remains', () => {
    const runtimeGame = makeGame();
    const manager = runtimeGame.getTextureQuality3DManager();
    const texture = makeTexture(64);
    const clone = texture.clone();
    manager.applyToTexture(texture, { label: 'model', kind: 'model' });
    manager.applyToTexture(clone, { label: 'model', kind: 'model' });
    const memory = expectedMemory(texture);

    clone.dispose();
    expect(manager.getTrackedTextureCount()).to.be(1);
    expect(manager.getTextureMemoryBytes()).to.be(memory);
    const report = manager.getReport();
    expect(report.textures.length).to.be(1);
    expect(report.textures[0].sharedSourceCount).to.be(1);
    expect(report.textures[0].uniqueSourceMemoryBytes).to.be(memory);
    expect(report.textures[0].sourceMemoryBytes).to.be(memory);
  });

  it('frees the source memory when the last consumer is disposed', () => {
    const runtimeGame = makeGame();
    const manager = runtimeGame.getTextureQuality3DManager();
    const texture = makeTexture(64);
    const clone = texture.clone();
    manager.applyToTexture(texture, { label: 'model', kind: 'model' });
    manager.applyToTexture(clone, { label: 'model', kind: 'model' });

    texture.dispose();
    expect(manager.getTrackedTextureCount()).to.be(1);
    expect(manager.getTextureMemoryBytes()).to.be.above(0);
    clone.dispose();
    expect(manager.getTrackedTextureCount()).to.be(0);
    expect(manager.getTextureMemoryBytes()).to.be(0);
    expect(manager.getReport().textures).to.eql([]);
    // Disposing again changes nothing.
    clone.dispose();
    expect(manager.getTextureMemoryBytes()).to.be(0);
  });

  it('does not double count when the same texture is tracked repeatedly', () => {
    const runtimeGame = makeGame();
    const manager = runtimeGame.getTextureQuality3DManager();
    const texture = makeTexture(64);
    for (let i = 0; i < 3; i++) {
      manager.applyToTexture(texture, { label: 'image', kind: 'image' });
    }
    expect(manager.getTrackedTextureCount()).to.be(1);
    expect(manager.getTextureMemoryBytes()).to.be(expectedMemory(texture));
  });

  it('keeps stable totals when shared textures disagree about mipmaps', () => {
    const runtimeGame = makeGame();
    const manager = runtimeGame.getTextureQuality3DManager();
    const texture = makeTexture(64);
    const clone = texture.clone();
    // The two textures share one GPU allocation but disagree on mipmaps.
    texture.minFilter = THREE.LinearFilter;
    texture.generateMipmaps = false;
    manager.applyToTexture(texture, { label: 'model', kind: 'model' });
    manager.applyToTexture(clone, { label: 'model', kind: 'model' });

    // The source estimate is the biggest member estimate, whatever the
    // order in which the textures are (re)applied.
    const expected = Math.max(expectedMemory(texture), expectedMemory(clone));
    expect(expected).to.be.above(0);
    expect(manager.getTextureMemoryBytes()).to.be(expected);
    for (let i = 0; i < 3; i++) {
      manager.applyToTexture(clone, { label: 'model', kind: 'model' });
      manager.applyToTexture(texture, { label: 'model', kind: 'model' });
    }
    expect(manager.getTextureMemoryBytes()).to.be(expected);

    // Disposing the biggest consumer shrinks the source estimate.
    clone.dispose();
    expect(manager.getTextureMemoryBytes()).to.be(expectedMemory(texture));
  });
});
