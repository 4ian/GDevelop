// @ts-check
describe('gdjs.TextureQuality3DManager', () => {
  /** @type {gdjs.RuntimeGame[]} */
  const runtimeGames = [];
  /** @type {THREE.WebGLRenderer[]} */
  const renderers = [];

  afterEach(() => {
    runtimeGames.splice(0).forEach((runtimeGame) => runtimeGame.dispose());
    renderers.splice(0).forEach((renderer) => {
      renderer.dispose();
      renderer.forceContextLoss();
    });
  });

  /**
   * Create a manager backed by a fake runtime game, so that the lifecycle can
   * be tested without a renderer or a resource loader.
   * @param {Partial<gdjs.TextureQuality3DSettings>=} properties
   * @returns {gdjs.TextureQuality3DManager}
   */
  const makeManager = (properties = {}) => {
    /** @type {any} */
    const runtimeGame = {
      getExtensionProperty: (namespace, key) =>
        properties[key] === undefined ? null : String(properties[key]),
    };
    return new gdjs.TextureQuality3DManager(runtimeGame);
  };

  /**
   * Give the manager GPU capabilities without needing a WebGL context, so that
   * anisotropy and resolution caps behave like on a real device.
   * @param {gdjs.TextureQuality3DManager} manager
   */
  const setCapabilities = (
    manager,
    { maxTextureSize = 16384, maxAnisotropy = 16 } = {}
  ) => {
    /** @type {any} */
    const gl = {
      MAX_3D_TEXTURE_SIZE: 32883,
      RENDERER: 7937,
      getSupportedExtensions: () => [],
      getExtension: () => null,
      getParameter: () => maxTextureSize,
    };
    /** @type {any} */
    const renderer = {
      getContext: () => gl,
      capabilities: {
        isWebGL2: true,
        maxTextureSize,
        maxCubemapSize: maxTextureSize,
        maxSamples: 4,
        precision: 'highp',
        getMaxAnisotropy: () => maxAnisotropy,
      },
    };
    manager.initializeWithRenderer(renderer);
  };

  /** @returns {HTMLCanvasElement} */
  const makeCanvas = (width, height) => {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');
    if (context) {
      context.fillStyle = '#336699';
      context.fillRect(0, 0, width, height);
    }
    return canvas;
  };

  /**
   * Create a texture with explicit sampler settings, so that the tests do not
   * depend on the Three.js defaults.
   * @param {any} image
   * @returns {THREE.Texture}
   */
  const makeTexture = (image) => {
    const texture = new THREE.Texture(image);
    texture.magFilter = THREE.LinearFilter;
    texture.minFilter = THREE.LinearFilter;
    texture.generateMipmaps = false;
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.anisotropy = 1;
    texture.needsUpdate = true;
    return texture;
  };

  const getImageWidth = (image) => image.naturalWidth || image.width;
  const getImageHeight = (image) => image.naturalHeight || image.height;

  describe('restoration (TQ-002)', () => {
    it('restores the original sampler settings when disabled', () => {
      const manager = makeManager();
      setCapabilities(manager);
      manager.updateSettings({
        enabled: true,
        filtering: 'trilinear',
        mipmapMode: 'forceOn',
        forceClampWrapping: true,
        anisotropy: 8,
      });

      const texture = makeTexture(makeCanvas(64, 64));
      texture.anisotropy = 2;
      texture.wrapT = THREE.MirroredRepeatWrapping;
      manager.applyToTexture(texture);

      expect(texture.magFilter).to.be(THREE.LinearFilter);
      expect(texture.minFilter).to.be(THREE.LinearMipmapLinearFilter);
      expect(texture.generateMipmaps).to.be(true);
      expect(texture.wrapS).to.be(THREE.ClampToEdgeWrapping);
      expect(texture.wrapT).to.be(THREE.ClampToEdgeWrapping);
      expect(texture.anisotropy).to.be(8);

      const versionBeforeRestore = texture.version;
      manager.updateSettings({ enabled: false });

      expect(texture.magFilter).to.be(THREE.LinearFilter);
      expect(texture.minFilter).to.be(THREE.LinearFilter);
      expect(texture.generateMipmaps).to.be(false);
      expect(texture.wrapS).to.be(THREE.RepeatWrapping);
      expect(texture.wrapT).to.be(THREE.MirroredRepeatWrapping);
      expect(texture.anisotropy).to.be(2);
      // Three.js only uploads a texture when its version changes.
      expect(texture.version).to.be.greaterThan(versionBeforeRestore);
    });

    it('keeps the first snapshot across repeated apply cycles', () => {
      const manager = makeManager();
      setCapabilities(manager);
      manager.updateSettings({ enabled: true, anisotropy: 8 });

      const texture = makeTexture(makeCanvas(64, 64));
      texture.anisotropy = 2;
      manager.applyToTexture(texture);

      manager.updateSettings({ anisotropy: 4 });
      expect(texture.anisotropy).to.be(4);
      manager.updateSettings({ anisotropy: 16 });
      expect(texture.anisotropy).to.be(16);

      manager.updateSettings({ enabled: false });
      expect(texture.anisotropy).to.be(2);
    });

    it('restores the original settings when switching to the classic preset', () => {
      const manager = makeManager();
      setCapabilities(manager);
      manager.setPreset('quality');

      const texture = makeTexture(makeCanvas(64, 64));
      texture.wrapS = THREE.ClampToEdgeWrapping;
      manager.applyToTexture(texture);
      expect(texture.minFilter).to.be(THREE.LinearMipmapLinearFilter);
      expect(texture.anisotropy).to.be(8);

      manager.setPreset('classic');
      expect(texture.magFilter).to.be(THREE.LinearFilter);
      expect(texture.minFilter).to.be(THREE.LinearFilter);
      expect(texture.generateMipmaps).to.be(false);
      expect(texture.wrapS).to.be(THREE.ClampToEdgeWrapping);
      expect(texture.wrapT).to.be(THREE.RepeatWrapping);
      expect(texture.anisotropy).to.be(1);
    });

    it('survives repeated disable and enable cycles', () => {
      const manager = makeManager();
      setCapabilities(manager);
      manager.updateSettings({ enabled: true, anisotropy: 8 });

      const texture = makeTexture(makeCanvas(64, 64));
      texture.anisotropy = 2;
      manager.applyToTexture(texture);

      manager.updateSettings({ enabled: false });
      expect(texture.anisotropy).to.be(2);

      manager.updateSettings({ enabled: true, anisotropy: 4 });
      expect(texture.anisotropy).to.be(4);

      manager.updateSettings({ enabled: false });
      expect(texture.anisotropy).to.be(2);
    });

    it('does not change a texture that was never modified', () => {
      const manager = makeManager();
      setCapabilities(manager);

      const image = makeCanvas(64, 64);
      const texture = makeTexture(image);
      const versionBeforeApply = texture.version;
      manager.applyToTexture(texture);

      expect(texture.image).to.be(image);
      expect(texture.magFilter).to.be(THREE.LinearFilter);
      expect(texture.minFilter).to.be(THREE.LinearFilter);
      expect(texture.generateMipmaps).to.be(false);
      expect(texture.wrapS).to.be(THREE.RepeatWrapping);
      expect(texture.wrapT).to.be(THREE.RepeatWrapping);
      expect(texture.anisotropy).to.be(1);
      expect(texture.version).to.be(versionBeforeApply);

      manager.updateSettings({ enabled: false });
      expect(texture.version).to.be(versionBeforeApply);
    });

    it('restores shared-source clones independently', () => {
      const manager = makeManager();
      setCapabilities(manager);
      manager.updateSettings({
        enabled: true,
        maxTextureResolution: 512,
        filtering: 'nearest',
        forceClampWrapping: true,
      });

      const originalImage = makeCanvas(1024, 768);
      const baseTexture = makeTexture(originalImage);
      const clonedTexture = baseTexture.clone();
      clonedTexture.wrapS = THREE.ClampToEdgeWrapping;

      manager.applyToTexture(baseTexture);
      manager.applyToTexture(clonedTexture);

      // Clones share their image data through the Three.js source.
      expect(baseTexture.image).to.be(clonedTexture.image);
      expect(getImageWidth(baseTexture.image)).to.be(512);
      expect(getImageWidth(clonedTexture.image)).to.be(512);

      manager.updateSettings({ enabled: false });
      expect(baseTexture.image).to.be(originalImage);
      expect(clonedTexture.image).to.be(originalImage);
      expect(baseTexture.wrapS).to.be(THREE.RepeatWrapping);
      expect(clonedTexture.wrapS).to.be(THREE.ClampToEdgeWrapping);
      expect(baseTexture.magFilter).to.be(THREE.LinearFilter);
      expect(clonedTexture.magFilter).to.be(THREE.LinearFilter);
    });

    it('restores the remaining clone when another one is disposed', () => {
      const manager = makeManager();
      setCapabilities(manager);
      manager.updateSettings({ enabled: true, maxTextureResolution: 512 });

      const originalImage = makeCanvas(1024, 768);
      const baseTexture = makeTexture(originalImage);
      const clonedTexture = baseTexture.clone();
      manager.applyToTexture(baseTexture);
      manager.applyToTexture(clonedTexture);

      clonedTexture.dispose();
      expect(manager.getTrackedTextureCount()).to.be(1);

      manager.updateSettings({ enabled: false });
      expect(baseTexture.image).to.be(originalImage);

      baseTexture.dispose();
      expect(manager.getTrackedTextureCount()).to.be(0);
      expect(manager.getTextureMemoryBytes()).to.be(0);
    });
  });

  describe('original image preservation (TQ-003)', () => {
    it('restores the original image when the maximum resolution is raised', () => {
      const manager = makeManager();
      setCapabilities(manager);
      manager.updateSettings({ enabled: true, maxTextureResolution: 512 });

      const originalImage = makeCanvas(1024, 768);
      const texture = makeTexture(originalImage);
      manager.applyToTexture(texture);

      expect(texture.image).not.to.be(originalImage);
      expect(getImageWidth(texture.image)).to.be(512);
      expect(getImageHeight(texture.image)).to.be(384);

      manager.updateSettings({ maxTextureResolution: 4096 });
      expect(texture.image).to.be(originalImage);
      expect(getImageWidth(texture.image)).to.be(1024);
      expect(getImageHeight(texture.image)).to.be(768);

      // Lowering the cap again must work from the original image.
      manager.updateSettings({ maxTextureResolution: 512 });
      expect(getImageWidth(texture.image)).to.be(512);
      expect(getImageHeight(texture.image)).to.be(384);

      // "No limit" must also restore an already downscaled image.
      manager.updateSettings({ maxTextureResolution: 0 });
      expect(texture.image).to.be(originalImage);
    });

    it('restores the original image when the system is disabled', () => {
      const manager = makeManager();
      setCapabilities(manager);
      manager.updateSettings({ enabled: true, maxTextureResolution: 256 });

      const originalImage = makeCanvas(1024, 1024);
      const texture = makeTexture(originalImage);
      manager.applyToTexture(texture);
      expect(getImageWidth(texture.image)).to.be(256);

      manager.updateSettings({ enabled: false });
      expect(texture.image).to.be(originalImage);
    });

    it('restores every face of a cube texture', () => {
      const manager = makeManager();
      setCapabilities(manager);
      manager.updateSettings({ enabled: true, maxTextureResolution: 256 });

      const faces = [
        makeCanvas(512, 256),
        makeCanvas(512, 256),
        makeCanvas(512, 256),
        makeCanvas(512, 256),
        makeCanvas(512, 256),
        makeCanvas(512, 256),
      ];
      const cubeTexture = new THREE.CubeTexture(faces);
      cubeTexture.needsUpdate = true;
      manager.applyToTexture(cubeTexture, { kind: 'cubemap' });

      expect(cubeTexture.images.length).to.be(6);
      expect(cubeTexture.images[0]).not.to.be(faces[0]);
      expect(getImageWidth(cubeTexture.images[0])).to.be(256);
      expect(getImageHeight(cubeTexture.images[0])).to.be(128);

      manager.updateSettings({ maxTextureResolution: 1024 });
      expect(cubeTexture.images).to.be(faces);
    });

    it('updates the memory estimation when the resolution changes', () => {
      const manager = makeManager();
      setCapabilities(manager);
      manager.updateSettings({ enabled: true, maxTextureResolution: 512 });

      const texture = makeTexture(makeCanvas(1024, 768));
      manager.applyToTexture(texture);
      expect(manager.getTextureMemoryBytes()).to.be(512 * 384 * 4);

      manager.updateSettings({ maxTextureResolution: 4096 });
      expect(manager.getTextureMemoryBytes()).to.be(1024 * 768 * 4);
    });

    it('releases the original image when the last texture is disposed', () => {
      const manager = makeManager();
      setCapabilities(manager);
      manager.updateSettings({ enabled: true, maxTextureResolution: 256 });

      const originalImage = makeCanvas(1024, 768);
      const texture = makeTexture(originalImage);
      manager.applyToTexture(texture);
      expect(getImageWidth(texture.image)).to.be(256);

      texture.dispose();
      expect(manager.getTrackedTextureCount()).to.be(0);
      expect(texture.source.data).to.be(originalImage);
    });

    it('uploads the downscaled dimensions and then the restored ones', () => {
      const renderer = new THREE.WebGLRenderer();
      renderers.push(renderer);
      const gl = /** @type {WebGL2RenderingContext} */ (renderer.getContext());

      /** @type {Array<{ width: number, height: number }>} */
      const uploads = [];
      const originalTexStorage2D = gl.texStorage2D.bind(gl);
      gl.texStorage2D = (target, levels, internalFormat, width, height) => {
        uploads.push({ width, height });
        return originalTexStorage2D(
          target,
          levels,
          internalFormat,
          width,
          height
        );
      };
      // The overloads of `texImage2D` cannot be expressed by one function, so
      // the spy is typed as `any`.
      const originalTexImage2D = /** @type {any} */ (gl.texImage2D.bind(gl));
      gl.texImage2D = /** @type {any} */ (
        function (
          target,
          level,
          internalFormat,
          width,
          height,
          border,
          format,
          type,
          source
        ) {
          if (level === 0) uploads.push({ width, height });
          return originalTexImage2D(
            target,
            level,
            internalFormat,
            width,
            height,
            border,
            format,
            type,
            source
          );
        }
      );

      const manager = makeManager();
      manager.initializeWithRenderer(renderer);
      const texture = makeTexture(makeCanvas(256, 256));
      manager.updateSettings({ enabled: true, maxTextureResolution: 64 });
      manager.applyToTexture(texture);

      renderer.initTexture(texture);
      expect(uploads.length).to.be.greaterThan(0);
      expect(uploads[0]).to.eql({ width: 64, height: 64 });

      uploads.length = 0;
      manager.updateSettings({ maxTextureResolution: 1024 });
      renderer.initTexture(texture);
      expect(uploads.length).to.be.greaterThan(0);
      expect(uploads[0]).to.eql({ width: 256, height: 256 });
    });

    it('restores the image of an image resource loaded by the image manager', async () => {
      const runtimeGame = gdjs.getPixiRuntimeGame({
        resources: {
          resources: [
            {
              kind: 'image',
              name: 'Image',
              metadata: '',
              file: 'base/GDJS/tests/tests-utils/assets/64x64.jpg',
              userAdded: true,
            },
          ],
        },
        propertiesOverrides: {
          extensionProperties: [
            {
              extension: 'AdvancedTextureQuality3D',
              property: 'enabled',
              value: 'true',
            },
            {
              extension: 'AdvancedTextureQuality3D',
              property: 'maxTextureResolution',
              value: '32',
            },
          ],
        },
      });
      runtimeGames.push(runtimeGame);

      // The Pixi and Three.js renderers are created on demand, and
      // `getThreeTexture` needs the Pixi renderer to read the image resource.
      const canvasParent = document.createElement('div');
      document.body.appendChild(canvasParent);
      runtimeGame.getRenderer().createStandardCanvas(canvasParent);

      const imageManager = runtimeGame.getImageManager();
      await imageManager.loadResource('Image');
      const texture = imageManager.getThreeTexture('Image');
      expect(getImageWidth(texture.image)).to.be(32);
      expect(getImageHeight(texture.image)).to.be(32);

      runtimeGame
        .getTextureQuality3DManager()
        .updateSettings({ maxTextureResolution: 4096 });
      expect(texture.image).to.be.an(HTMLImageElement);
      expect(getImageWidth(texture.image)).to.be(64);

      canvasParent.remove();
    });
  });
});
