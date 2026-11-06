// @ts-check
describe('gdjs.TextureQuality3DManager cube map limit', () => {
  /**
   * Regression tests for the maximum resolution of cube map faces
   * (see `TQ-008`): cube faces must be capped by `MAX_CUBE_MAP_TEXTURE_SIZE`,
   * which is a different (and possibly smaller) hardware limit than
   * `MAX_TEXTURE_SIZE`, used for 2D and model textures.
   *
   * The two limits are almost always equal on real hardware, so the tests use
   * controlled ("mocked") WebGL capability values to force a split
   * (`MAX_TEXTURE_SIZE = 4096`, `MAX_CUBE_MAP_TEXTURE_SIZE = 1024`). This is
   * [SYNTHETIC] evidence: it verifies the code paths, not a real divergent
   * GPU.
   */

  const MAX_TEXTURE_SIZE = 4096;
  const MAX_CUBE_MAP_TEXTURE_SIZE = 1024;

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
   * Run `callback` with `WebGL2RenderingContext.getParameter` returning the
   * controlled values for the two texture size limits. The values are read by
   * Three.js when the renderer is created (and then stored in
   * `renderer.capabilities`), so the renderer must be created inside the
   * callback.
   * @template T
   * @param {() => T} callback
   * @returns {T}
   */
  const withMockedTextureLimits = (callback) => {
    const glPrototype = /** @type {any} */ (WebGL2RenderingContext.prototype);
    const originalGetParameter = glPrototype.getParameter;
    glPrototype.getParameter = function (/** @type {number} */ pname) {
      if (pname === this.MAX_TEXTURE_SIZE) return MAX_TEXTURE_SIZE;
      if (pname === this.MAX_CUBE_MAP_TEXTURE_SIZE)
        return MAX_CUBE_MAP_TEXTURE_SIZE;
      return originalGetParameter.call(this, pname);
    };
    try {
      return callback();
    } finally {
      glPrototype.getParameter = originalGetParameter;
    }
  };

  /**
   * @param {Object<string, string | number | boolean>} [values]
   * @param {{mockedLimits?: boolean}} [options]
   */
  const makeManagerAndRenderer = (values, options) => {
    const mockedLimits = !options || options.mockedLimits !== false;
    const runtimeGame = gdjs.getPixiRuntimeGame({
      propertiesOverrides: {
        extensionProperties: [
          {
            extension: gdjs.textureQuality3dPropertiesNamespace,
            property: 'enabled',
            value: 'true',
          },
          ...Object.keys(values || {}).map((property) => ({
            extension: gdjs.textureQuality3dPropertiesNamespace,
            property,
            value: String(/** @type {any} */ (values)[property]),
          })),
        ],
      },
    });
    runtimeGames.push(runtimeGame);
    const manager = runtimeGame.getTextureQuality3DManager();
    const renderer = mockedLimits
      ? withMockedTextureLimits(() => new THREE.WebGLRenderer())
      : new THREE.WebGLRenderer();
    renderers.push(renderer);
    manager.initializeWithRenderer(renderer);
    return { runtimeGame, manager, renderer };
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
   * A cube texture with 6 distinct faces of `size` x `size` pixels.
   * @param {number} size
   */
  const makeCubeTexture = (size) => {
    const faces = [];
    for (let i = 0; i < 6; i++) faces.push(makeImage(size));
    return new THREE.CubeTexture(faces);
  };

  /**
   * @param {THREE.Texture} texture
   * @returns {Array<[number, number]>}
   */
  const getImageSizes = (texture) => {
    const image = /** @type {any} */ (texture.image);
    const faces = Array.isArray(image) ? image : [image];
    return faces.map((/** @type {any} */ face) => [
      face.naturalWidth || face.width || 0,
      face.naturalHeight || face.height || 0,
    ]);
  };

  it('detects the cube map limit from MAX_CUBE_MAP_TEXTURE_SIZE', () => {
    // Use the real (not mocked) WebGL context: this checks that Three.js
    // r185 builds `capabilities.maxCubemapSize` from the dedicated
    // `MAX_CUBE_MAP_TEXTURE_SIZE` parameter, and `capabilities.maxTextureSize`
    // from `MAX_TEXTURE_SIZE` (the two parameters can differ on some
    // hardware; they are equal on this one).
    const { manager, renderer } = makeManagerAndRenderer(
      {},
      { mockedLimits: false }
    );
    const gl = /** @type {WebGL2RenderingContext} */ (renderer.getContext());
    const capabilities = manager.getCapabilities();
    if (!capabilities) throw new Error('The capabilities were not detected.');
    expect(capabilities.maxTextureSize).to.be(
      gl.getParameter(gl.MAX_TEXTURE_SIZE)
    );
    expect(capabilities.maxCubemapSize).to.be(
      gl.getParameter(gl.MAX_CUBE_MAP_TEXTURE_SIZE)
    );
  });

  it('caps cube map faces with MAX_CUBE_MAP_TEXTURE_SIZE instead of MAX_TEXTURE_SIZE', () => {
    const { manager } = makeManagerAndRenderer({});
    const capabilities = manager.getCapabilities();
    if (!capabilities) throw new Error('The capabilities were not detected.');
    expect(capabilities.maxTextureSize).to.be(MAX_TEXTURE_SIZE);
    expect(capabilities.maxCubemapSize).to.be(MAX_CUBE_MAP_TEXTURE_SIZE);

    const cubeTexture = makeCubeTexture(2048);
    manager.applyToTexture(cubeTexture, { label: 'cube', kind: 'cubemap' });

    // The faces must be downscaled to the *cube map* limit (1024), even
    // though they are smaller than the 2D limit (4096).
    const sizes = getImageSizes(cubeTexture);
    expect(sizes.length).to.be(6);
    for (const [width, height] of sizes) {
      expect(width).to.be(MAX_CUBE_MAP_TEXTURE_SIZE);
      expect(height).to.be(MAX_CUBE_MAP_TEXTURE_SIZE);
    }
  });

  it('leaves 2D and model textures capped by MAX_TEXTURE_SIZE only', () => {
    const { manager } = makeManagerAndRenderer({});
    const capabilities = manager.getCapabilities();
    if (!capabilities) throw new Error('The capabilities were not detected.');
    expect(capabilities.maxTextureSize).to.be(MAX_TEXTURE_SIZE);
    expect(capabilities.maxCubemapSize).to.be(MAX_CUBE_MAP_TEXTURE_SIZE);

    // 2048 is above the cube map limit (1024) but below the 2D limit (4096):
    // 2D and model textures must not be touched.
    const imageTexture = new THREE.CanvasTexture(makeImage(2048));
    manager.applyToTexture(imageTexture, { label: 'image', kind: 'image' });
    expect(getImageSizes(imageTexture)).to.eql([[2048, 2048]]);

    const modelTexture = new THREE.CanvasTexture(makeImage(2048));
    manager.applyToTexture(modelTexture, {
      label: 'model',
      kind: 'model',
      respectSamplerSettings: true,
    });
    expect(getImageSizes(modelTexture)).to.eql([[2048, 2048]]);

    // The reported caps are kind-aware.
    expect(manager.getMaxTextureResolution()).to.be(MAX_TEXTURE_SIZE);
    expect(manager.getMaxTextureResolution('cubemap')).to.be(
      MAX_CUBE_MAP_TEXTURE_SIZE
    );
  });

  it('takes the smallest of the resolution setting and the device limit', () => {
    // The `maxTextureResolution` project setting must still be respected when
    // it is below the device limits.
    const { manager } = makeManagerAndRenderer({ maxTextureResolution: 512 });
    const cubeTexture = makeCubeTexture(1024);
    manager.applyToTexture(cubeTexture, { label: 'cube', kind: 'cubemap' });
    for (const [width, height] of getImageSizes(cubeTexture)) {
      expect(width).to.be(512);
      expect(height).to.be(512);
    }

    const imageTexture = new THREE.CanvasTexture(makeImage(1024));
    manager.applyToTexture(imageTexture, { label: 'image', kind: 'image' });
    expect(getImageSizes(imageTexture)).to.eql([[512, 512]]);

    // ...and the device limit wins when it is smaller than the setting.
    expect(manager.getMaxTextureResolution()).to.be(512);
    expect(manager.getMaxTextureResolution('cubemap')).to.be(512);
  });

  it('shows that Three.js r185 clamps cube faces with MAX_CUBE_MAP_TEXTURE_SIZE at upload, but not 2D textures', function () {
    const { renderer } = makeManagerAndRenderer({});
    const gl = /** @type {WebGL2RenderingContext} */ (renderer.getContext());

    // Three.js r185 uploads canvas-backed textures with `texStorage2D` and
    // `texSubImage2D` (immutable textures), and `texImage2D` in the other
    // cases: observe the uploaded size on all of them.
    /** @type {number[]} */
    const uploadedWidths = [];
    const originalTexImage2D = gl.texImage2D.bind(gl);
    const originalTexSubImage2D = gl.texSubImage2D.bind(gl);
    const originalTexStorage2D = gl.texStorage2D.bind(gl);
    /** @param {any[]} args */
    const recordSourceWidth = (args) => {
      const source = args[args.length - 1];
      uploadedWidths.push(
        source ? source.naturalWidth || source.width || 0 : 0
      );
    };
    gl.texImage2D = function (...args) {
      if (args.length >= 9) {
        // texImage2D(target, level, internalFormat, width, ...).
        uploadedWidths.push(args[3]);
      } else {
        recordSourceWidth(args);
      }
      return originalTexImage2D(...args);
    };
    gl.texSubImage2D = function (...args) {
      if (args.length >= 9) {
        // texSubImage2D(target, level, x, y, width, ...).
        uploadedWidths.push(args[4]);
      } else {
        recordSourceWidth(args);
      }
      return originalTexSubImage2D(...args);
    };
    gl.texStorage2D = function (...args) {
      // texStorage2D(target, levels, internalFormat, width, height).
      uploadedWidths.push(args[3]);
      return originalTexStorage2D(...args);
    };

    try {
      const camera = new THREE.PerspectiveCamera(70, 1, 0.1, 100);
      camera.position.z = 5;

      // An unmanaged cube texture (the manager is not involved): only
      // Three.js itself resizes the 2048x2048 faces before upload.
      const cubeTexture = makeCubeTexture(2048);
      cubeTexture.needsUpdate = true;
      const cubeScene = new THREE.Scene();
      cubeScene.add(
        new THREE.Mesh(
          new THREE.BoxGeometry(1, 1, 1),
          new THREE.MeshBasicMaterial({ envMap: cubeTexture })
        )
      );
      uploadedWidths.length = 0;
      renderer.render(cubeScene, camera);
      expect(uploadedWidths.length).to.be.above(0);
      for (const width of uploadedWidths) {
        expect(width).to.be(MAX_CUBE_MAP_TEXTURE_SIZE);
      }

      // An unmanaged 2D texture of the same size is *not* clamped to the
      // cube map limit: it is only clamped to MAX_TEXTURE_SIZE (4096).
      const imageTexture = new THREE.CanvasTexture(makeImage(2048));
      imageTexture.needsUpdate = true;
      const imageScene = new THREE.Scene();
      imageScene.add(
        new THREE.Mesh(
          new THREE.PlaneGeometry(2, 2),
          new THREE.MeshBasicMaterial({ map: imageTexture })
        )
      );
      uploadedWidths.length = 0;
      renderer.render(imageScene, camera);
      expect(uploadedWidths.length).to.be.above(0);
      for (const width of uploadedWidths) {
        expect(width).to.be(2048);
      }
    } finally {
      gl.texImage2D = originalTexImage2D;
      gl.texSubImage2D = originalTexSubImage2D;
      gl.texStorage2D = originalTexStorage2D;
    }
  });
});
