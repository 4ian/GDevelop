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
   * @param {Record<string, string>=} properties
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
  const makeCanvas = (width, height, color = '#336699') => {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');
    if (context) {
      context.fillStyle = color;
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

  /**
   * Record the texture allocations and uploads reaching the GPU context.
   * @param {THREE.WebGLRenderer} renderer
   */
  const spyTextureUploads = (renderer) => {
    const gl = /** @type {WebGL2RenderingContext} */ (renderer.getContext());
    /** @type {Array<{ kind: string, width: number, height: number, source?: any }>} */
    const uploads = [];

    const texStorage2D = gl.texStorage2D.bind(gl);
    gl.texStorage2D = (target, levels, internalFormat, width, height) => {
      uploads.push({ kind: 'storage', width, height });
      return texStorage2D(target, levels, internalFormat, width, height);
    };

    // The overloads of `texSubImage2D` and `texImage2D` cannot be expressed by
    // one function, so the spies are typed as `any`.
    const texSubImage2D = /** @type {any} */ (gl.texSubImage2D.bind(gl));
    gl.texSubImage2D = /** @type {any} */ (
      function () {
        const args = arguments;
        if (args.length === 7) {
          // (target, level, xoffset, yoffset, format, type, source)
          const source = args[6];
          uploads.push({
            kind: 'sub',
            width: source ? source.naturalWidth || source.width || 0 : 0,
            height: source ? source.naturalHeight || source.height || 0 : 0,
            source,
          });
        } else {
          // (target, level, xoffset, yoffset, width, height, format, type, pixels)
          uploads.push({
            kind: 'sub',
            width: args[4],
            height: args[5],
            source: args[8],
          });
        }
        return texSubImage2D.apply(gl, args);
      }
    );

    const texImage2D = /** @type {any} */ (gl.texImage2D.bind(gl));
    gl.texImage2D = /** @type {any} */ (
      function () {
        const args = arguments;
        if (args.length >= 9) {
          uploads.push({
            kind: 'image',
            width: args[3],
            height: args[4],
            source: args[8],
          });
        } else if (args.length === 6) {
          const source = args[5];
          uploads.push({
            kind: 'image',
            width: source ? source.naturalWidth || source.width || 0 : 0,
            height: source ? source.naturalHeight || source.height || 0 : 0,
            source,
          });
        }
        return texImage2D.apply(gl, args);
      }
    );

    return uploads;
  };

  /**
   * Render a texture on a full-screen quad and read one GPU pixel back.
   * @param {THREE.WebGLRenderer} renderer
   * @param {THREE.Texture} texture
   * @returns {Uint8ClampedArray | Uint8Array}
   */
  const renderTexturePixel = (renderer, texture) => {
    const target = new THREE.WebGLRenderTarget(1, 1);
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
    camera.position.z = 1;
    const geometry = new THREE.PlaneGeometry(2, 2);
    const material = new THREE.MeshBasicMaterial({ map: texture });
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    const previousRenderTarget = renderer.getRenderTarget();
    renderer.setRenderTarget(target);
    renderer.render(scene, camera);
    const pixel = new Uint8Array(4);
    renderer.readRenderTargetPixels(target, 0, 0, 1, 1, pixel);
    renderer.setRenderTarget(previousRenderTarget);

    geometry.dispose();
    material.dispose();
    target.dispose();
    return pixel;
  };

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

    it('uses the original image as the baseline of a clone created after a downscale', () => {
      const manager = makeManager();
      setCapabilities(manager);
      manager.updateSettings({
        enabled: true,
        filtering: 'nearest',
        mipmapMode: 'forceOff',
        forceClampWrapping: true,
        anisotropy: 4,
        maxTextureResolution: 512,
      });

      const originalImage = makeCanvas(1024, 768);
      const baseTexture = makeTexture(originalImage);
      manager.applyToTexture(baseTexture);
      expect(baseTexture.magFilter).to.be(THREE.NearestFilter);
      expect(baseTexture.wrapS).to.be(THREE.ClampToEdgeWrapping);
      expect(baseTexture.anisotropy).to.be(4);
      expect(getImageWidth(baseTexture.image)).to.be(512);

      // The clone is created after the source was downscaled and after the
      // prototype was modified. Three.js copies the prototype's current
      // sampler values, so this inherited state is the clone's baseline.
      const lateClone = baseTexture.clone();
      manager.applyToTexture(lateClone);
      expect(lateClone.image).to.be(baseTexture.image);
      expect(lateClone.magFilter).to.be(THREE.NearestFilter);
      expect(lateClone.wrapS).to.be(THREE.ClampToEdgeWrapping);
      expect(lateClone.anisotropy).to.be(4);

      // Lowering again must be computed from the original image, not from the
      // already downscaled 512x384 image.
      manager.updateSettings({ maxTextureResolution: 256 });
      expect(getImageWidth(lateClone.image)).to.be(256);
      expect(getImageHeight(lateClone.image)).to.be(192);
      expect(getImageWidth(baseTexture.image)).to.be(256);

      manager.updateSettings({ maxTextureResolution: 4096 });
      expect(baseTexture.image).to.be(originalImage);
      expect(lateClone.image).to.be(originalImage);

      manager.updateSettings({ enabled: false });
      // The base gets its pre-manager sampler settings back.
      expect(baseTexture.magFilter).to.be(THREE.LinearFilter);
      expect(baseTexture.wrapS).to.be(THREE.RepeatWrapping);
      expect(baseTexture.anisotropy).to.be(1);
      // The late clone did not exist before the manager: its baseline is the
      // sampler state it inherited when it was cloned.
      expect(lateClone.magFilter).to.be(THREE.NearestFilter);
      expect(lateClone.wrapS).to.be(THREE.ClampToEdgeWrapping);
      expect(lateClone.anisotropy).to.be(4);
      expect(baseTexture.image).to.be(originalImage);
      expect(lateClone.image).to.be(originalImage);
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

    it('keeps the original source image when the last texture is disposed', () => {
      const manager = makeManager();
      setCapabilities(manager);
      manager.updateSettings({ enabled: true, maxTextureResolution: 256 });

      const originalImage = makeCanvas(1024, 768);
      const texture = makeTexture(originalImage);
      const originalSource = texture.source;
      manager.applyToTexture(texture);
      expect(getImageWidth(texture.image)).to.be(256);
      expect(texture.source).not.to.be(originalSource);

      texture.dispose();
      expect(manager.getTrackedTextureCount()).to.be(0);
      expect(manager.getTextureMemoryBytes()).to.be(0);
      // The manager owns a separate downscaled source, so the original source
      // is left untouched for any other consumer.
      expect(originalSource.data).to.be(originalImage);
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

    it('re-uploads a same-dimension content replacement', () => {
      const renderer = new THREE.WebGLRenderer();
      renderers.push(renderer);
      const gl = /** @type {WebGL2RenderingContext} */ (renderer.getContext());
      const uploads = spyTextureUploads(renderer);

      const manager = makeManager();
      manager.initializeWithRenderer(renderer);
      manager.updateSettings({ enabled: true, maxTextureResolution: 128 });

      const originalImage = makeCanvas(256, 256, '#ff0000');
      const texture = makeTexture(originalImage);
      manager.applyToTexture(texture);
      renderer.initTexture(texture);
      expect(texture.image).not.to.be(originalImage);
      expect(getImageWidth(texture.image)).to.be(128);
      expect(
        uploads.some(
          (upload) => upload.kind === 'storage' && upload.width === 128
        )
      ).to.be(true);

      const redPixel = renderTexturePixel(renderer, texture);
      expect(redPixel[0]).to.be.greaterThan(200);
      expect(redPixel[2]).to.be.lessThan(100);

      // Change the content of the original image without changing dimensions,
      // then change the resampling quality so the manager regenerates the
      // downscaled canvas. The dimensions stay 128x128, so the manager reuses
      // its owned source and must mark the textures for re-upload.
      const originalContext = originalImage.getContext('2d');
      if (!originalContext) throw new Error('Unable to get a 2D context.');
      originalContext.fillStyle = '#0000ff';
      originalContext.fillRect(0, 0, 256, 256);
      const managedSourceBefore = texture.source;
      const versionBefore = texture.version;

      uploads.length = 0;
      manager.updateSettings({ resamplingQuality: 'low' });
      expect(texture.source).to.be(managedSourceBefore);
      expect(texture.version).to.be.greaterThan(versionBefore);
      expect(getImageWidth(texture.image)).to.be(128);

      renderer.initTexture(texture);
      const replacementUpload = uploads.find(
        (upload) => upload.source === texture.image
      );
      expect(replacementUpload).to.be.ok();
      expect(replacementUpload && replacementUpload.width).to.be(128);
      expect(replacementUpload && replacementUpload.height).to.be(128);

      const bluePixel = renderTexturePixel(renderer, texture);
      expect(bluePixel[2]).to.be.greaterThan(200);
      expect(bluePixel[0]).to.be.lessThan(100);
      expect(gl.getError()).to.be(0);
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

  describe('safe manager disposal (TQ-002/TQ-003-A)', () => {
    it('restores the original image and sampler when disposed while a texture is alive', () => {
      const manager = makeManager();
      setCapabilities(manager);
      manager.updateSettings({
        enabled: true,
        filtering: 'nearest',
        forceClampWrapping: true,
        anisotropy: 8,
        maxTextureResolution: 256,
      });

      const originalImage = makeCanvas(1024, 768);
      const texture = makeTexture(originalImage);
      const originalSource = texture.source;
      manager.applyToTexture(texture);
      expect(getImageWidth(texture.image)).to.be(256);
      expect(texture.source).not.to.be(originalSource);
      expect(texture.magFilter).to.be(THREE.NearestFilter);

      manager.dispose();
      expect(manager.getTrackedTextureCount()).to.be(0);
      expect(manager.getTextureMemoryBytes()).to.be(0);
      expect(texture.image).to.be(originalImage);
      expect(texture.source).to.be(originalSource);
      expect(texture.magFilter).to.be(THREE.LinearFilter);
      expect(texture.wrapS).to.be(THREE.RepeatWrapping);
      expect(texture.anisotropy).to.be(1);
      expect(originalSource.data).to.be(originalImage);
    });

    it('can be managed again by a new manager after disposal', () => {
      const manager = makeManager();
      setCapabilities(manager);
      manager.updateSettings({ enabled: true, maxTextureResolution: 256 });
      const originalImage = makeCanvas(1024, 768);
      const texture = makeTexture(originalImage);
      manager.applyToTexture(texture);
      manager.dispose();

      const newManager = makeManager();
      setCapabilities(newManager);
      newManager.updateSettings({ enabled: true, maxTextureResolution: 256 });
      newManager.applyToTexture(texture);
      expect(texture.image).not.to.be(originalImage);
      expect(getImageWidth(texture.image)).to.be(256);

      newManager.updateSettings({ maxTextureResolution: 4096 });
      expect(texture.image).to.be(originalImage);
    });

    it('restores every texture sharing a source when disposed', () => {
      const manager = makeManager();
      setCapabilities(manager);
      manager.updateSettings({ enabled: true, maxTextureResolution: 512 });
      const originalImage = makeCanvas(1024, 768);
      const baseTexture = makeTexture(originalImage);
      const clonedTexture = baseTexture.clone();
      const originalSource = baseTexture.source;
      manager.applyToTexture(baseTexture);
      manager.applyToTexture(clonedTexture);
      expect(clonedTexture.source).to.be(baseTexture.source);
      expect(getImageWidth(clonedTexture.image)).to.be(512);

      manager.dispose();
      expect(manager.getTrackedTextureCount()).to.be(0);
      expect(manager.getTextureMemoryBytes()).to.be(0);
      expect(baseTexture.image).to.be(originalImage);
      expect(clonedTexture.image).to.be(originalImage);
      expect(baseTexture.source).to.be(originalSource);
      expect(clonedTexture.source).to.be(originalSource);
      expect(originalSource.data).to.be(originalImage);
    });

    it('supports repeated disposal without corrupting state', () => {
      const manager = makeManager();
      setCapabilities(manager);
      manager.updateSettings({ enabled: true, maxTextureResolution: 128 });
      const originalImage = makeCanvas(512, 512);
      const texture = makeTexture(originalImage);
      manager.applyToTexture(texture);

      manager.dispose();
      manager.dispose();
      expect(manager.getTrackedTextureCount()).to.be(0);
      expect(manager.getTextureMemoryBytes()).to.be(0);
      expect(texture.image).to.be(originalImage);
    });

    it('reallocates the original dimensions on the GPU after disposal', () => {
      const renderer = new THREE.WebGLRenderer();
      renderers.push(renderer);
      const gl = /** @type {WebGL2RenderingContext} */ (renderer.getContext());
      const uploads = spyTextureUploads(renderer);
      const manager = makeManager();
      manager.initializeWithRenderer(renderer);
      manager.updateSettings({ enabled: true, maxTextureResolution: 128 });

      const originalImage = makeCanvas(512, 512);
      const texture = makeTexture(originalImage);
      manager.applyToTexture(texture);
      renderer.initTexture(texture);
      expect(
        uploads.some(
          (upload) => upload.kind === 'storage' && upload.width === 128
        )
      ).to.be(true);

      manager.dispose();
      expect(texture.image).to.be(originalImage);
      uploads.length = 0;
      renderer.initTexture(texture);
      expect(
        uploads.some(
          (upload) => upload.kind === 'storage' && upload.width === 512
        )
      ).to.be(true);
      expect(gl.getError()).to.be(0);
    });
  });

  describe('external consumers sharing a source (TQ-002/TQ-003-B)', () => {
    it('isolates an untracked texture sharing the original source', () => {
      const renderer = new THREE.WebGLRenderer();
      renderers.push(renderer);
      const gl = /** @type {WebGL2RenderingContext} */ (renderer.getContext());
      const uploads = spyTextureUploads(renderer);
      const manager = makeManager();
      manager.initializeWithRenderer(renderer);

      const originalImage = makeCanvas(512, 512, '#ff0000');
      const trackedTexture = makeTexture(originalImage);
      const originalSource = trackedTexture.source;
      const externalTexture = trackedTexture.clone();
      externalTexture.needsUpdate = true;

      manager.updateSettings({ enabled: true, maxTextureResolution: 128 });
      manager.applyToTexture(trackedTexture);
      expect(trackedTexture.source).not.to.be(originalSource);
      expect(externalTexture.source).to.be(originalSource);
      expect(externalTexture.image).to.be(originalImage);
      expect(originalSource.data).to.be(originalImage);

      // The external consumer is uploaded at its own (original) size even
      // after the manager downscaled the tracked texture. If the manager had
      // mutated the shared source, this allocation would be 128x128.
      uploads.length = 0;
      renderer.initTexture(externalTexture);
      expect(
        uploads.some(
          (upload) => upload.kind === 'storage' && upload.width === 512
        )
      ).to.be(true);
      expect(gl.getError()).to.be(0);

      uploads.length = 0;
      renderer.initTexture(trackedTexture);
      expect(
        uploads.some(
          (upload) => upload.kind === 'storage' && upload.width === 128
        )
      ).to.be(true);
      expect(gl.getError()).to.be(0);

      // Raising the cap moves the tracked texture back to the original source.
      uploads.length = 0;
      manager.updateSettings({ maxTextureResolution: 4096 });
      expect(trackedTexture.source).to.be(originalSource);
      expect(trackedTexture.image).to.be(originalImage);
      renderer.initTexture(trackedTexture);
      expect(uploads.some((upload) => upload.width === 512)).to.be(true);
      expect(uploads.some((upload) => upload.width === 128)).to.be(false);
      expect(gl.getError()).to.be(0);

      // The external consumer can still be uploaded without a size mismatch.
      externalTexture.needsUpdate = true;
      uploads.length = 0;
      renderer.initTexture(externalTexture);
      expect(gl.getError()).to.be(0);
    });

    it('leaves an external consumer valid when the manager is disposed', () => {
      const renderer = new THREE.WebGLRenderer();
      renderers.push(renderer);
      const gl = /** @type {WebGL2RenderingContext} */ (renderer.getContext());
      const uploads = spyTextureUploads(renderer);
      const manager = makeManager();
      manager.initializeWithRenderer(renderer);

      const originalImage = makeCanvas(512, 512);
      const trackedTexture = makeTexture(originalImage);
      const originalSource = trackedTexture.source;
      const externalTexture = trackedTexture.clone();
      externalTexture.wrapT = THREE.ClampToEdgeWrapping;
      externalTexture.needsUpdate = true;

      manager.updateSettings({ enabled: true, maxTextureResolution: 128 });
      manager.applyToTexture(trackedTexture);
      renderer.initTexture(externalTexture);
      expect(gl.getError()).to.be(0);

      manager.dispose();
      expect(trackedTexture.source).to.be(originalSource);
      expect(trackedTexture.image).to.be(originalImage);
      expect(externalTexture.source).to.be(originalSource);
      expect(externalTexture.image).to.be(originalImage);

      uploads.length = 0;
      renderer.initTexture(trackedTexture);
      expect(
        uploads.some(
          (upload) => upload.kind === 'storage' && upload.width === 512
        )
      ).to.be(true);

      externalTexture.needsUpdate = true;
      renderer.initTexture(externalTexture);
      expect(gl.getError()).to.be(0);
    });
  });

  describe('glTF wrapping precedence (TQ-006)', () => {
    it('clamps a glTF texture whose sampler settings are respected', () => {
      const manager = makeManager();
      setCapabilities(manager);
      manager.updateSettings({
        enabled: true,
        filtering: 'trilinear',
        mipmapMode: 'forceOn',
        overrideModelSamplers: false,
        forceClampWrapping: true,
        anisotropy: 8,
      });

      const texture = makeTexture(makeCanvas(64, 64));
      texture.wrapS = THREE.MirroredRepeatWrapping;
      manager.applyToTexture(texture, {
        kind: 'model',
        respectSamplerSettings: true,
      });

      expect(texture.wrapS).to.be(THREE.ClampToEdgeWrapping);
      expect(texture.wrapT).to.be(THREE.ClampToEdgeWrapping);
      // Only the wrapping is overridden: the imported filtering/mipmap
      // settings are still respected.
      expect(texture.magFilter).to.be(THREE.LinearFilter);
      expect(texture.minFilter).to.be(THREE.LinearFilter);
      expect(texture.generateMipmaps).to.be(false);
      expect(texture.anisotropy).to.be(8);
    });

    it('clamps a glTF texture when model samplers are overridden', () => {
      const manager = makeManager();
      setCapabilities(manager);
      manager.updateSettings({
        enabled: true,
        filtering: 'nearest',
        mipmapMode: 'forceOff',
        overrideModelSamplers: true,
        forceClampWrapping: true,
      });

      const texture = makeTexture(makeCanvas(64, 64));
      manager.applyToTexture(texture, {
        kind: 'model',
        respectSamplerSettings: true,
      });

      expect(texture.wrapS).to.be(THREE.ClampToEdgeWrapping);
      expect(texture.wrapT).to.be(THREE.ClampToEdgeWrapping);
      expect(texture.magFilter).to.be(THREE.NearestFilter);
      expect(texture.minFilter).to.be(THREE.NearestFilter);
    });

    it('clamps a glTF texture without respected samplers', () => {
      const manager = makeManager();
      setCapabilities(manager);
      manager.updateSettings({
        enabled: true,
        filtering: 'bilinear',
        overrideModelSamplers: false,
        forceClampWrapping: true,
      });

      const texture = makeTexture(makeCanvas(64, 64));
      manager.applyToTexture(texture, {
        kind: 'model',
        respectSamplerSettings: false,
      });

      expect(texture.wrapS).to.be(THREE.ClampToEdgeWrapping);
      expect(texture.wrapT).to.be(THREE.ClampToEdgeWrapping);
      expect(texture.magFilter).to.be(THREE.LinearFilter);
      expect(texture.minFilter).to.be(THREE.LinearFilter);
    });

    it('preserves the imported wrapping of a glTF texture when disabled', () => {
      const manager = makeManager();
      setCapabilities(manager);
      manager.updateSettings({
        enabled: true,
        filtering: 'trilinear',
        mipmapMode: 'forceOn',
        overrideModelSamplers: false,
        forceClampWrapping: false,
      });

      const texture = makeTexture(makeCanvas(64, 64));
      texture.wrapS = THREE.MirroredRepeatWrapping;
      manager.applyToTexture(texture, {
        kind: 'model',
        respectSamplerSettings: true,
      });

      expect(texture.wrapS).to.be(THREE.MirroredRepeatWrapping);
      expect(texture.wrapT).to.be(THREE.RepeatWrapping);
      expect(texture.magFilter).to.be(THREE.LinearFilter);
      expect(texture.minFilter).to.be(THREE.LinearFilter);
      expect(texture.generateMipmaps).to.be(false);
    });

    it('keeps clamping non-glTF textures', () => {
      const manager = makeManager();
      setCapabilities(manager);
      manager.updateSettings({
        enabled: true,
        filtering: 'nearest',
        forceClampWrapping: true,
      });

      const texture = makeTexture(makeCanvas(64, 64));
      manager.applyToTexture(texture);

      expect(texture.wrapS).to.be(THREE.ClampToEdgeWrapping);
      expect(texture.wrapT).to.be(THREE.ClampToEdgeWrapping);
      expect(texture.magFilter).to.be(THREE.NearestFilter);
      expect(texture.minFilter).to.be(THREE.NearestFilter);
    });

    it('restores the imported wrapping when clamping is turned off', () => {
      const manager = makeManager();
      setCapabilities(manager);
      manager.updateSettings({
        enabled: true,
        filtering: 'trilinear',
        mipmapMode: 'forceOn',
        overrideModelSamplers: false,
        forceClampWrapping: true,
      });

      const texture = makeTexture(makeCanvas(64, 64));
      texture.wrapS = THREE.MirroredRepeatWrapping;
      manager.applyToTexture(texture, {
        kind: 'model',
        respectSamplerSettings: true,
      });
      expect(texture.wrapS).to.be(THREE.ClampToEdgeWrapping);

      manager.updateSettings({ forceClampWrapping: false });
      expect(texture.wrapS).to.be(THREE.MirroredRepeatWrapping);
      expect(texture.wrapT).to.be(THREE.RepeatWrapping);
      // Filtering/mipmaps were respected and are still untouched.
      expect(texture.magFilter).to.be(THREE.LinearFilter);
      expect(texture.minFilter).to.be(THREE.LinearFilter);
      expect(texture.generateMipmaps).to.be(false);
    });

    it('reapplies clamping when turned on again', () => {
      const manager = makeManager();
      setCapabilities(manager);
      manager.updateSettings({
        enabled: true,
        filtering: 'trilinear',
        overrideModelSamplers: false,
        forceClampWrapping: false,
      });

      const texture = makeTexture(makeCanvas(64, 64));
      texture.wrapS = THREE.MirroredRepeatWrapping;
      manager.applyToTexture(texture, {
        kind: 'model',
        respectSamplerSettings: true,
      });
      expect(texture.wrapS).to.be(THREE.MirroredRepeatWrapping);

      manager.updateSettings({ forceClampWrapping: true });
      expect(texture.wrapS).to.be(THREE.ClampToEdgeWrapping);
      expect(texture.wrapT).to.be(THREE.ClampToEdgeWrapping);

      manager.updateSettings({ forceClampWrapping: false });
      expect(texture.wrapS).to.be(THREE.MirroredRepeatWrapping);
      expect(texture.wrapT).to.be(THREE.RepeatWrapping);
    });

    it('keeps the precedence when settings are reapplied and presets change', () => {
      const manager = makeManager();
      setCapabilities(manager);
      manager.updateSettings({
        enabled: true,
        overrideModelSamplers: false,
        forceClampWrapping: true,
      });

      const texture = makeTexture(makeCanvas(64, 64));
      texture.wrapS = THREE.MirroredRepeatWrapping;
      manager.applyToTexture(texture, {
        kind: 'model',
        respectSamplerSettings: true,
      });
      expect(texture.wrapS).to.be(THREE.ClampToEdgeWrapping);

      // Reapplication through a settings update and through applyToTexture.
      manager.updateSettings({ anisotropy: 4 });
      expect(texture.wrapS).to.be(THREE.ClampToEdgeWrapping);
      manager.applyToTexture(texture, {
        kind: 'model',
        respectSamplerSettings: true,
      });
      expect(texture.wrapS).to.be(THREE.ClampToEdgeWrapping);

      // Presets do not enable forceClampWrapping: importing their settings
      // restores the original wrapping.
      manager.setPreset('balanced');
      expect(texture.wrapS).to.be(THREE.MirroredRepeatWrapping);
      manager.setPreset('quality');
      expect(texture.wrapS).to.be(THREE.MirroredRepeatWrapping);

      // Turning it back on clamps again, and disabling the system restores it.
      manager.updateSettings({ forceClampWrapping: true });
      expect(texture.wrapS).to.be(THREE.ClampToEdgeWrapping);
      manager.updateSettings({ enabled: false });
      expect(texture.wrapS).to.be(THREE.MirroredRepeatWrapping);
      manager.updateSettings({
        enabled: true,
        forceClampWrapping: true,
      });
      expect(texture.wrapS).to.be(THREE.ClampToEdgeWrapping);
    });

    it('clamps and restores wrapR when the texture supports it', () => {
      const manager = makeManager();
      setCapabilities(manager);
      manager.updateSettings({ enabled: true, forceClampWrapping: true });

      const texture = makeTexture(makeCanvas(64, 64));
      /** @type {any} */
      const textureWithWrapR = texture;
      textureWithWrapR.wrapR = THREE.RepeatWrapping;
      manager.applyToTexture(texture, {
        kind: 'model',
        respectSamplerSettings: true,
      });

      expect(textureWithWrapR.wrapR).to.be(THREE.ClampToEdgeWrapping);
      manager.updateSettings({ forceClampWrapping: false });
      expect(textureWithWrapR.wrapR).to.be(THREE.RepeatWrapping);
    });

    it('applies forceClampWrapping loaded from the project settings', () => {
      const manager = makeManager({
        enabled: 'true',
        forceClampWrapping: 'true',
      });
      const texture = makeTexture(makeCanvas(64, 64));

      manager.applyToTexture(texture, {
        kind: 'model',
        respectSamplerSettings: true,
      });
      expect(texture.wrapS).to.be(THREE.ClampToEdgeWrapping);
      expect(texture.wrapT).to.be(THREE.ClampToEdgeWrapping);
    });
  });
});
