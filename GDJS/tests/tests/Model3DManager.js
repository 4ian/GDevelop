// @ts-check
describe('gdjs.Model3DManager', () => {
  /** @returns {ResourceData} */
  const makeResource = (name) => ({
    kind: 'model3D',
    name,
    file: 'base/GDJS/tests/tests-utils/assets/' + name,
    metadata: '',
    userAdded: false,
  });

  /** Three triangles: two embed the same red 2x2 PNG, the third a blue one. */
  const resourceNames = [
    'textured-triangle-red-1.glb',
    'textured-triangle-red-2.glb',
    'textured-triangle-blue.glb',
  ];
  /** @type {gdjs.Model3DManager[]} */
  const managers = [];
  /** @type {string[]} */
  const objectUrls = [];
  /** @type {THREE.WebGLRenderer[]} */
  const renderers = [];

  afterEach(() => {
    managers.splice(0).forEach((manager) => manager.dispose());
    renderers.splice(0).forEach((renderer) => {
      renderer.dispose();
      renderer.forceContextLoss();
    });
    objectUrls.splice(0).forEach((url) => URL.revokeObjectURL(url));
  });

  const getMaterial = (model) => {
    /** @type {any} */
    let material = null;
    model.scene.traverse((object) => {
      if (object.material) material = object.material;
    });
    return material;
  };

  /** @returns {THREE.Texture} */
  const getBaseColorTexture = (model) => getMaterial(model).map;

  const createManager = (resources = resourceNames.map(makeResource)) => {
    const runtimeGame = new gdjs.RuntimeGame(
      gdjs.createProjectData({ resources: { resources } })
    );
    const manager = runtimeGame.getResourceLoader().getModel3DManager();
    managers.push(manager);
    return manager;
  };

  const loadModel = async (manager, name) => {
    await manager.loadResource(name);
    await manager.processResource(name);
    return manager.getModel(name);
  };

  const loadModels = async () => {
    const manager = createManager();
    for (const name of resourceNames) await loadModel(manager, name);
    return manager;
  };

  const createRenderer = () => {
    const renderer = new THREE.WebGLRenderer();
    renderers.push(renderer);
    return renderer;
  };

  /**
   * Edit the small GLB fixture in memory, preserving its embedded image and
   * geometry unless the test explicitly changes them.
   * @param {string} name
   * @param {(json: any, binary: Uint8Array) => void} edit
   * @returns {Promise<ResourceData>}
   */
  const makeEditedResource = async (name, edit) => {
    const data = await (
      await fetch(makeResource(resourceNames[0]).file)
    ).arrayBuffer();
    const header = new DataView(data);
    const jsonLength = header.getUint32(12, true);
    const json = JSON.parse(
      new TextDecoder().decode(new Uint8Array(data, 20, jsonLength))
    );
    const binary = new Uint8Array(data.slice(20 + jsonLength + 8));
    edit(json, binary);
    const jsonBytes = new TextEncoder().encode(JSON.stringify(json));
    const paddedLength = Math.ceil(jsonBytes.length / 4) * 4;
    const output = new ArrayBuffer(28 + paddedLength + binary.byteLength);
    const view = new DataView(output);
    view.setUint32(0, 0x46546c67, true);
    view.setUint32(4, 2, true);
    view.setUint32(8, output.byteLength, true);
    view.setUint32(12, paddedLength, true);
    view.setUint32(16, 0x4e4f534a, true);
    const jsonChunk = new Uint8Array(output, 20, paddedLength);
    jsonChunk.fill(32);
    jsonChunk.set(jsonBytes);
    view.setUint32(20 + paddedLength, binary.byteLength, true);
    view.setUint32(24 + paddedLength, 0x004e4942, true);
    new Uint8Array(output, 28 + paddedLength).set(binary);
    const url = URL.createObjectURL(new Blob([output]));
    objectUrls.push(url);
    return { ...makeResource(name), file: url };
  };

  it('shares the image and GPU allocation while keeping separate texture settings', async () => {
    const manager = await loadModels();
    const red1 = getBaseColorTexture(manager.getModel(resourceNames[0]));
    const red2 = getBaseColorTexture(manager.getModel(resourceNames[1]));
    const blue = getBaseColorTexture(manager.getModel(resourceNames[2]));

    expect(red1).to.be.ok();
    expect(red2).not.to.be(red1);
    expect(red2.source).to.be(red1.source);
    expect(blue.source).not.to.be(red1.source);

    const renderer = createRenderer();
    renderer.initTexture(red1);
    renderer.initTexture(red2);
    expect(renderer.info.memory.textures).to.be(1);
    renderer.initTexture(blue);
    expect(renderer.info.memory.textures).to.be(2);
  });

  it('keeps the image and GPU allocation until the last model unloads', async () => {
    const manager = await loadModels();
    const unload = (index) =>
      manager.unloadResource(makeResource(resourceNames[index]));
    const red1 = getBaseColorTexture(manager.getModel(resourceNames[0]));
    const red2 = getBaseColorTexture(manager.getModel(resourceNames[1]));
    const blue = getBaseColorTexture(manager.getModel(resourceNames[2]));
    const renderer = createRenderer();
    [red1, red2, blue].forEach((texture) => renderer.initTexture(texture));

    unload(0);
    expect(renderer.info.memory.textures).to.be(2);
    const reloaded = getBaseColorTexture(
      await loadModel(manager, resourceNames[0])
    );
    expect(reloaded.source).to.be(red1.source);
    renderer.initTexture(reloaded);
    expect(renderer.info.memory.textures).to.be(2);

    unload(0);
    unload(1);
    expect(renderer.info.memory.textures).to.be(1);
    const fresh = getBaseColorTexture(
      await loadModel(manager, resourceNames[0])
    );
    expect(fresh.source).not.to.be(red1.source);
    renderer.initTexture(fresh);
    expect(renderer.info.memory.textures).to.be(2);
    unload(2);
    expect(renderer.info.memory.textures).to.be(1);
    manager.dispose();
    expect(renderer.info.memory.textures).to.be(0);
  });

  [false, true].forEach((colorFirst) => {
    it(`keeps color and roughness maps independent (${colorFirst ? 'color' : 'roughness'} loads first)`, async () => {
      const color = makeResource(resourceNames[0]);
      const roughness = await makeEditedResource('roughness', (json) => {
        json.materials[0].pbrMetallicRoughness = {
          metallicRoughnessTexture: { index: 0 },
        };
      });
      const manager = createManager([color, roughness]);
      for (const resource of colorFirst
        ? [color, roughness]
        : [roughness, color]) {
        await loadModel(manager, resource.name);
      }
      const colorMap = getBaseColorTexture(manager.getModel(color.name));
      const dataMap = getMaterial(
        manager.getModel(roughness.name)
      ).roughnessMap;
      expect(colorMap.colorSpace).to.be(THREE.SRGBColorSpace);
      expect(dataMap.colorSpace).to.be(THREE.NoColorSpace);
      expect(colorMap.source).to.be(dataMap.source);
      const renderer = createRenderer();
      renderer.initTexture(colorMap);
      renderer.initTexture(dataMap);
      // Different color interpretations require separate GPU allocations.
      expect(renderer.info.memory.textures).to.be(2);
    });
  });

  ['transform', 'uv-channel'].forEach((variant) => {
    it(`releases cached images used by ${variant} texture clones`, async () => {
      const resource = await makeEditedResource(variant, (json) => {
        const map = json.materials[0].pbrMetallicRoughness.baseColorTexture;
        if (variant === 'transform') {
          json.extensionsUsed = ['KHR_texture_transform'];
          map.extensions = { KHR_texture_transform: { offset: [0.25, 0] } };
        } else {
          map.texCoord = 1;
          json.meshes[0].primitives[0].attributes.TEXCOORD_1 = 1;
        }
      });
      const manager = createManager([resource]);
      const texture = getBaseColorTexture(
        await loadModel(manager, resource.name)
      );
      expect(
        variant === 'transform' ? texture.offset.x : texture.channel
      ).to.be(variant === 'transform' ? 0.25 : 1);
      manager.unloadResource(resource);
      const fresh = getBaseColorTexture(
        await loadModel(manager, resource.name)
      );
      expect(fresh.source).not.to.be(texture.source);
    });
  });

  it('can dispose after an embedded image fails to decode', async () => {
    const resource = await makeEditedResource('broken', (json, binary) => {
      const image = json.bufferViews[json.images[0].bufferView];
      binary.fill(0, image.byteOffset, image.byteOffset + image.byteLength);
    });
    const manager = createManager([resource]);
    expect(getBaseColorTexture(await loadModel(manager, resource.name))).to.be(
      null
    );
    manager.dispose();
  });

  it('releases every sampler entry when a model uses one image with several samplers', async () => {
    const resource = await makeEditedResource('two-samplers', (json) => {
      json.samplers.push({ wrapS: 33071, wrapT: 33071 });
      json.textures.push({ source: 0, sampler: 1 });
      json.materials.push({
        pbrMetallicRoughness: { baseColorTexture: { index: 1 } },
      });
      json.meshes[0].primitives.push({
        ...json.meshes[0].primitives[0],
        material: 1,
      });
    });
    const manager = createManager([resource]);
    const getTextures = (model) => {
      /** @type {THREE.Texture[]} */
      const textures = [];
      model.scene.traverse((object) => {
        if (object.material) textures.push(object.material.map);
      });
      return textures;
    };
    const textures = getTextures(await loadModel(manager, resource.name));
    expect(textures.length).to.be(2);
    expect(textures[0].wrapS).to.be(THREE.RepeatWrapping);
    expect(textures[1].wrapS).to.be(THREE.ClampToEdgeWrapping);
    expect(textures[0].source).to.be(textures[1].source);
    const renderer = createRenderer();
    textures.forEach((texture) => renderer.initTexture(texture));
    expect(renderer.info.memory.textures).to.be(2);
    manager.unloadResource(resource);
    expect(renderer.info.memory.textures).to.be(0);
    const fresh = getTextures(await loadModel(manager, resource.name));
    expect(fresh[0].source).not.to.be(textures[0].source);
    expect(fresh[1].source).not.to.be(textures[1].source);
  });

  it('retries image loading after an earlier decode failure', async () => {
    const manager = createManager();
    let failNextImage = true;
    const loader = manager._loader;
    if (!loader) throw new Error('Three.js loader is unavailable');
    loader.register((parser) => {
      const original = parser.loadTextureImage.bind(parser);
      parser.loadTextureImage = (...args) => {
        if (!failNextImage) return original(...args);
        failNextImage = false;
        return Promise.resolve(/** @type {any} */ (null));
      };
      return { name: 'test_fail_first_image', beforeRoot: () => null };
    });
    expect(
      getBaseColorTexture(await loadModel(manager, resourceNames[0]))
    ).to.be(null);
    expect(
      getBaseColorTexture(await loadModel(manager, resourceNames[1]))
    ).to.be.ok();
  });

  it('shares images when models load concurrently', async () => {
    const manager = createManager();
    const models = await Promise.all(
      resourceNames.slice(0, 2).map((name) => loadModel(manager, name))
    );
    expect(getBaseColorTexture(models[0]).source).to.be(
      getBaseColorTexture(models[1]).source
    );
  });

  describe('textures stored in separate files', () => {
    const textureFilePath = '../Textures/colormap.png';

    /**
     * A model whose texture is stored in a separate file, associated to the
     * "colormap" image resource (like the editor does when importing it).
     * @returns {Promise<ResourceData>}
     */
    const makeModelWithSeparateTexture = async (name) => ({
      ...(await makeEditedResource(name, (json) => {
        json.images[0] = { uri: textureFilePath };
      })),
      metadata: JSON.stringify({
        embeddedResourcesMapping: { [textureFilePath]: 'colormap' },
      }),
    });

    /** @returns {ResourceData} */
    const makeImageResource = ({ smoothed }) => ({
      kind: 'image',
      name: 'colormap',
      file: 'base/GDJS/tests/tests-utils/assets/64x64.jpg',
      metadata: '',
      smoothed,
      userAdded: false,
    });

    const createManagerWithImages = (resources) => {
      const runtimeGame = new gdjs.RuntimeGame(
        gdjs.createProjectData({ resources: { resources } })
      );
      // Textures of the ImageManager are made from the images loaded by PixiJS.
      runtimeGame
        .getRenderer()
        .createStandardCanvas(document.createElement('div'));
      const manager = runtimeGame.getResourceLoader().getModel3DManager();
      managers.push(manager);
      return {
        manager,
        imageManager: runtimeGame.getImageManager(),
      };
    };

    it('uses the image resources, shared by all the models', async () => {
      const { manager, imageManager } = createManagerWithImages([
        await makeModelWithSeparateTexture('model-1.glb'),
        await makeModelWithSeparateTexture('model-2.glb'),
        makeImageResource({ smoothed: true }),
      ]);

      const texture1 = getBaseColorTexture(
        await loadModel(manager, 'model-1.glb')
      );
      const texture2 = getBaseColorTexture(
        await loadModel(manager, 'model-2.glb')
      );
      const imageTexture = imageManager.getThreeTexture('colormap');

      expect(texture1).to.be.ok();
      // Each model has its own texture, configured by the glTF loader...
      expect(texture1).not.to.be(imageTexture);
      expect(texture2).not.to.be(texture1);
      expect(texture1.flipY).to.be(false);
      expect(imageTexture.flipY).to.be(true);
      // ...but the image itself is shared with the image resource.
      expect(texture1.source).to.be(imageTexture.source);
      expect(texture2.source).to.be(imageTexture.source);
      expect(texture1.magFilter).to.be(THREE.LinearFilter);
    });

    it('applies the smoothing setting of the image resource', async () => {
      const { manager } = createManagerWithImages([
        await makeModelWithSeparateTexture('model-1.glb'),
        makeImageResource({ smoothed: false }),
      ]);

      const texture = getBaseColorTexture(
        await loadModel(manager, 'model-1.glb')
      );

      expect(texture.magFilter).to.be(THREE.NearestFilter);
      expect(texture.minFilter).to.be(THREE.NearestFilter);
    });

    it('keeps the image resource texture usable when a model unloads', async () => {
      const model1Resource = await makeModelWithSeparateTexture('model-1.glb');
      const { manager, imageManager } = createManagerWithImages([
        model1Resource,
        await makeModelWithSeparateTexture('model-2.glb'),
        makeImageResource({ smoothed: true }),
      ]);

      await loadModel(manager, 'model-1.glb');
      const model2 = await loadModel(manager, 'model-2.glb');
      const imageTexture = imageManager.getThreeTexture('colormap');
      manager.unloadResource(model1Resource);

      expect(imageManager.getThreeTexture('colormap')).to.be(imageTexture);
      expect(getBaseColorTexture(model2).source).to.be(imageTexture.source);
    });

    it('still shares the textures embedded in the same models', async () => {
      // One model mixing a texture in a separate file and an embedded one:
      // both kinds of textures must be handled.
      const makeMixedModel = (name) =>
        makeEditedResource(name, (json) => {
          json.images.push({ uri: textureFilePath });
          json.textures.push({ source: json.images.length - 1 });
          json.materials[0].emissiveTexture = {
            index: json.textures.length - 1,
          };
        }).then((resource) => ({
          ...resource,
          metadata: JSON.stringify({
            embeddedResourcesMapping: { [textureFilePath]: 'colormap' },
          }),
        }));
      const { manager, imageManager } = createManagerWithImages([
        await makeMixedModel('mixed-1.glb'),
        await makeMixedModel('mixed-2.glb'),
        makeImageResource({ smoothed: true }),
      ]);

      const model1 = await loadModel(manager, 'mixed-1.glb');
      const model2 = await loadModel(manager, 'mixed-2.glb');

      // The embedded texture is shared between the models...
      expect(getMaterial(model1).map.source).to.be(
        getMaterial(model2).map.source
      );
      // ...and the texture in a separate file comes from the image resource.
      expect(getMaterial(model1).emissiveMap.source).to.be(
        imageManager.getThreeTexture('colormap').source
      );
    });
  });
});
