// @ts-check
describe('gdjs.TextureQuality3DManager', () => {
  /**
   * Regression tests for the anisotropy settings (see the "3D Texture Quality"
   * project settings and the `SetTextureAnisotropy` action).
   *
   * These tests observe the real WebGL calls of the bundled Three.js renderer:
   * changing `texture.anisotropy` is not enough, the value must reach
   * `texParameterf(TEXTURE_MAX_ANISOTROPY_EXT, ...)` on the GPU side.
   *
   * Skip policy: all the tests need the `EXT_texture_filter_anisotropic`
   * extension. Without it, the whole suite is skipped (reported as pending by
   * mocha, never silently passing).
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
    runtimeGames.splice(0);
  });

  /**
   * Create a texture quality manager with the system enabled and a known
   * anisotropy, and a WebGL renderer recording the anisotropy values that
   * reach the GPU (`texParameterf` with `TEXTURE_MAX_ANISOTROPY_EXT`).
   */
  const makeManagerAndRenderer = (anisotropy) => {
    const runtimeGame = gdjs.getPixiRuntimeGame({
      propertiesOverrides: {
        extensionProperties: [
          {
            extension: gdjs.textureQuality3dPropertiesNamespace,
            property: 'enabled',
            value: 'true',
          },
          {
            extension: gdjs.textureQuality3dPropertiesNamespace,
            property: 'filtering',
            value: 'trilinear',
          },
          {
            extension: gdjs.textureQuality3dPropertiesNamespace,
            property: 'mipmapMode',
            value: 'forceOn',
          },
          {
            extension: gdjs.textureQuality3dPropertiesNamespace,
            property: 'anisotropy',
            value: String(anisotropy),
          },
        ],
      },
    });
    runtimeGames.push(runtimeGame);
    const manager = runtimeGame.getTextureQuality3DManager();

    const renderer = new THREE.WebGLRenderer();
    renderers.push(renderer);
    const gl = renderer.getContext();
    const anisotropicFiltering = gl.getExtension(
      'EXT_texture_filter_anisotropic'
    );
    /** @type {number[]} */
    const gpuAnisotropyValues = [];
    const originalTexParameterf = gl.texParameterf.bind(gl);
    gl.texParameterf = (target, pname, param) => {
      if (
        anisotropicFiltering &&
        pname === anisotropicFiltering.TEXTURE_MAX_ANISOTROPY_EXT
      ) {
        gpuAnisotropyValues.push(param);
      }
      originalTexParameterf(target, pname, param);
    };

    manager.initializeWithRenderer(renderer);
    const capabilities = manager.getCapabilities();
    return {
      manager,
      renderer,
      anisotropicFiltering,
      gpuAnisotropyValues,
      maxAnisotropy: capabilities ? capabilities.maxAnisotropy : 0,
    };
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

  const renderTexture = (renderer, texture) => {
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const geometry = new THREE.PlaneGeometry(2, 2);
    const material = new THREE.MeshBasicMaterial({ map: texture });
    scene.add(new THREE.Mesh(geometry, material));
    renderer.render(scene, camera);
    geometry.dispose();
    material.dispose();
  };

  before(function () {
    // Any renderer is enough to know if anisotropic filtering is supported.
    const probe = new THREE.WebGLRenderer();
    const supported = !!probe
      .getContext()
      .getExtension('EXT_texture_filter_anisotropic');
    probe.dispose();
    probe.forceContextLoss();
    if (!supported) {
      console.warn(
        'Skipping the TextureQuality3DManager tests: ' +
          'EXT_texture_filter_anisotropic is not supported in this environment.'
      );
      this.skip();
    }
  });

  it('uploads increased and decreased anisotropy values to WebGL', function () {
    const { manager, renderer, gpuAnisotropyValues, maxAnisotropy } =
      makeManagerAndRenderer(4);
    expect(maxAnisotropy).to.be.above(3);

    const texture = makeTexture();
    manager.applyToTexture(texture, { label: 'test', kind: 'image' });
    renderTexture(renderer, texture);
    expect(texture.anisotropy).to.be(4);
    expect(gpuAnisotropyValues).to.eql([4]);

    // Increase the anisotropy, without changing any other setting.
    manager.updateSettings({ anisotropy: 8 });
    expect(texture.anisotropy).to.be(8);
    renderTexture(renderer, texture);
    expect(gpuAnisotropyValues).to.eql([4, 8]);

    // Decrease the anisotropy below the already uploaded value.
    manager.updateSettings({ anisotropy: 1 });
    expect(texture.anisotropy).to.be(1);
    renderTexture(renderer, texture);
    expect(gpuAnisotropyValues).to.eql([4, 8, 1]);
  });

  it('sets needsUpdate only when the anisotropy actually changes', function () {
    const { manager, renderer, gpuAnisotropyValues } =
      makeManagerAndRenderer(4);
    const texture = makeTexture();
    manager.applyToTexture(texture, { label: 'test', kind: 'image' });
    renderTexture(renderer, texture);
    expect(gpuAnisotropyValues).to.eql([4]);
    const versionAfterFirstApply = texture.version;

    // Applying the same anisotropy again must not re-upload the texture.
    manager.updateSettings({ anisotropy: 4 });
    expect(texture.version).to.be(versionAfterFirstApply);
    manager.applyToTexture(texture, { label: 'test', kind: 'image' });
    expect(texture.version).to.be(versionAfterFirstApply);
    renderTexture(renderer, texture);
    expect(gpuAnisotropyValues).to.eql([4]);

    // ...but an actual change must re-upload it.
    manager.updateSettings({ anisotropy: 2 });
    expect(texture.version).to.be.above(versionAfterFirstApply);
    renderTexture(renderer, texture);
    expect(gpuAnisotropyValues).to.eql([4, 2]);
  });

  it('clamps the anisotropy to the GPU maximum and uploads the clamped value', function () {
    const { manager, renderer, gpuAnisotropyValues, maxAnisotropy } =
      makeManagerAndRenderer(4);
    const texture = makeTexture();
    manager.applyToTexture(texture, { label: 'test', kind: 'image' });
    renderTexture(renderer, texture);

    manager.updateSettings({ anisotropy: 999 });
    expect(texture.anisotropy).to.be(Math.min(999, maxAnisotropy));
    renderTexture(renderer, texture);
    expect(gpuAnisotropyValues).to.eql([4, Math.min(999, maxAnisotropy)]);
  });

  it('can change the anisotropy of a texture without mipmaps', function () {
    const { manager, renderer } = makeManagerAndRenderer(4);
    manager.updateSettings({ filtering: 'nearest', mipmapMode: 'forceOff' });
    const texture = makeTexture();
    manager.applyToTexture(texture, { label: 'test', kind: 'image' });
    renderTexture(renderer, texture);

    manager.updateSettings({ anisotropy: 8 });
    renderTexture(renderer, texture);
    expect(texture.anisotropy).to.be(8);
    expect(texture.minFilter).to.be(THREE.NearestFilter);
  });
});
