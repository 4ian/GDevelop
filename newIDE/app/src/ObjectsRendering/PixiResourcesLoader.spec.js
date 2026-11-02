// @flow
/**
 * @jest-environment jsdom
 */
import * as PIXI from 'pixi.js-legacy';
import PixiResourcesLoader from './PixiResourcesLoader';
import ResourcesLoader from '../ResourcesLoader';

// $FlowFixMe[cannot-resolve-module]
const fs = require('fs');
// $FlowFixMe[cannot-resolve-module]
const path = require('path');

jest.mock('three/examples/jsm/loaders/GLTFLoader', () => ({
  GLTFLoader: function() {},
}));
jest.mock('three/examples/jsm/loaders/DRACOLoader', () => ({
  DRACOLoader: function() {},
}));
jest.mock('@esotericsoftware/spine-pixi-v7', () => {
  // $FlowFixMe[cannot-resolve-module]
  const fsModule = require('fs');
  // $FlowFixMe[cannot-resolve-module]
  const pathModule = require('path');
  if (typeof global.HTMLImageElement === 'undefined') {
    class MockImage {
      src: string = '';
      crossOrigin: string = '';
      complete: boolean = true;
      width: number = 1024;
      height: number = 256;
      onload: any = null;
      onerror: any = null;
      addEventListener() {}
      removeEventListener() {}
    }
    global.HTMLImageElement = MockImage;
    global.Image = MockImage;
  }
  if (typeof global.location === 'undefined') {
    global.location = {
      protocol: 'http:',
      hostname: 'localhost',
      port: '80',
      origin: 'http://localhost',
    };
  }
  if (typeof global.document === 'undefined') {
    global.document = {
      createElement: () => ({
        href: '',
        protocol: 'http:',
        hostname: 'localhost',
        port: '80',
        getContext: () => ({
          fillRect: () => {},
          getExtension: () => null,
        }),
      }),
      baseURI: 'http://localhost/',
    };
  }
  global.PIXI = require('pixi.js-legacy');
  const spineDir = pathModule.resolve('../../Extensions/Spine/spine-pixi-v7');
  for (const file of [
    'A_spine-pixi-v7-pre.js',
    'B_spine-pixi-v7.js',
    'C_spine-pixi-v7-post.js',
  ]) {
    // eslint-disable-next-line no-new-func
    const fn = new Function(
      fsModule.readFileSync(pathModule.join(spineDir, file), 'utf8') +
        '\n;if (typeof spine !== "undefined") global.spine = spine;'
    );
    fn();
  }
  return global.spine;
});

const gd: libGDevelop = global.gd;

const spineboyAtlasContent = fs.readFileSync(
  path.resolve('../../GDJS/tests/games/capabilities/assets/spineboy.atlas'),
  'utf8'
);
const spineboyJsonContent = fs.readFileSync(
  path.resolve('../../GDJS/tests/games/capabilities/assets/spineboy.json'),
  'utf8'
);

const createTestTexture = (url: string) => {
  const img = new global.HTMLImageElement();
  img.src = url;
  const baseTexture = new PIXI.BaseTexture(img);
  baseTexture.cacheId = url;
  PIXI.BaseTexture.addToCache(baseTexture, url);
  const texture = new PIXI.Texture(baseTexture);
  PIXI.Texture.addToCache(texture, url);
  return texture;
};

describe('PixiResourcesLoader (Spine resources)', () => {
  let originalFetch;
  let originalLoad;

  beforeEach(async () => {
    PixiResourcesLoader.burstCache();
    PIXI.Assets.detections.length = 0;
    PIXI.Assets.reset();
    await PIXI.Assets.init({ skipDetections: true });
    PIXI.utils.clearTextureCache();

    originalFetch = PIXI.settings.ADAPTER.fetch;
    PIXI.settings.ADAPTER.fetch = jest.fn(async (url: string) => {
      if (url.includes('.atlas')) {
        return {
          ok: true,
          status: 200,
          statusText: 'OK',
          text: async () => spineboyAtlasContent,
        };
      }
      if (url.includes('.json')) {
        return {
          ok: true,
          status: 200,
          statusText: 'OK',
          json: async () => JSON.parse(spineboyJsonContent),
          text: async () => spineboyJsonContent,
        };
      }
      throw new Error(`Unexpected fetch url: ${url}`);
    });

    let urlCounter = 1;
    // Allow tests to bump urlCounter to simulate modified local files.
    (ResourcesLoader: any).__bumpUrlVersion = () => {
      urlCounter++;
    };
    jest
      .spyOn(ResourcesLoader, 'getResourceFullUrl')
      .mockImplementation((_project, resourceName) => {
        if (resourceName === 'spineboy.png') {
          return `file:///project/spineboy.png?v=${urlCounter}`;
        }
        if (resourceName === 'spineboy.atlas') {
          return 'file:///project/spineboy.atlas';
        }
        if (resourceName === 'spineboy.json') {
          return 'file:///project/spineboy.json';
        }
        return `file:///project/${resourceName}`;
      });

    originalLoad = PIXI.Assets.load.bind(PIXI.Assets);
    jest
      .spyOn(PIXI.Assets, 'load')
      .mockImplementation(async (urls, onProgress) => {
        if (typeof urls === 'string' && urls.includes('spineboy.png')) {
          return createTestTexture(urls);
        }
        return originalLoad(urls, onProgress);
      });
  });

  afterEach(() => {
    PIXI.settings.ADAPTER.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  const createProjectWithSpineResources = () => {
    const project = gd.ProjectHelper.createNewGDJSProject();
    const resourcesManager = project.getResourcesManager();

    const imageResource = new gd.ImageResource();
    imageResource.setName('spineboy.png');
    imageResource.setFile('spineboy.png');
    resourcesManager.addResource(imageResource);
    imageResource.delete();

    const atlasResource = new gd.AtlasResource();
    atlasResource.setName('spineboy.atlas');
    atlasResource.setFile('spineboy.atlas');
    atlasResource.setMetadata(
      JSON.stringify({
        embeddedResourcesMapping: {
          'spineboy.png': 'spineboy.png',
        },
      })
    );
    resourcesManager.addResource(atlasResource);
    atlasResource.delete();

    const spineResource = new gd.SpineResource();
    spineResource.setName('spineboy.json');
    spineResource.setFile('spineboy.json');
    spineResource.setMetadata(
      JSON.stringify({
        embeddedResourcesMapping: {
          'spineboy.atlas': 'spineboy.atlas',
        },
      })
    );
    resourcesManager.addResource(spineResource);
    spineResource.delete();

    return project;
  };

  it('does not destroy the image PIXI.Texture when reloading an atlas resource', async () => {
    const project = createProjectWithSpineResources();
    try {
      await PixiResourcesLoader.loadTextures(project, ['spineboy.png']);
      const initialTexture = PixiResourcesLoader.getPIXITexture(
        project,
        'spineboy.png'
      );
      expect(initialTexture.destroyed).toBe(false);
      expect(initialTexture.baseTexture).not.toBe(null);

      // Load only the atlas (without loading spineData yet), then reload the atlas.
      const firstAtlasResult = await PixiResourcesLoader._getSpineTextureAtlas(
        project,
        'spineboy.atlas'
      );
      expect(firstAtlasResult.loadingError).toBe(null);
      expect(firstAtlasResult.textureAtlas).not.toBe(null);

      await PixiResourcesLoader._doReloadResource(project, 'spineboy.atlas');

      // The shared image texture must NOT have been destroyed by atlas.dispose().
      expect(initialTexture.destroyed).toBe(false);
      expect(initialTexture.baseTexture).not.toBe(null);

      // And reloading the image + atlas after the image URL changes must use the new BaseTexture,
      // not a stale ResolvedAsset from PIXI.Assets.resolver._resolverHash.
      (ResourcesLoader: any).__bumpUrlVersion();
      await PixiResourcesLoader._doReloadResource(project, 'spineboy.png');

      const secondAtlasResult = await PixiResourcesLoader._getSpineTextureAtlas(
        project,
        'spineboy.atlas'
      );
      expect(secondAtlasResult.loadingError).toBe(null);
      expect(secondAtlasResult.textureAtlas).not.toBe(null);
    } finally {
      project.delete();
    }
  });
});

describe('GDJS SpineAtlasManager & SpineManager (runtime)', () => {
  let originalFetch;

  const loadGdjsSpineRuntime = () => {
    const runtimeDir = path.resolve('resources/GDJS/Runtime');
    global.PIXI = PIXI;
    global.gdjs = {
      registerObject: () => {},
    };
    const filesToLoad = [
      'logger.js',
      'ResourceCache.js',
      'Extensions/Spine/spine-pixi-v7/C_spine-pixi-v7-post.js',
      'Extensions/Spine/managers/pixi-spine-atlas-manager.js',
      'Extensions/Spine/managers/pixi-spine-manager.js',
    ];
    for (const relPath of filesToLoad) {
      const code = fs.readFileSync(path.join(runtimeDir, relPath), 'utf8');
      // eslint-disable-next-line no-new-func
      const runScript: any = new Function(
        'gdjs',
        'PIXI',
        'spine',
        `${code}\n;global.gdjs = gdjs;`
      );
      runScript(global.gdjs, PIXI, global.spine);
    }
    return { gdjs: global.gdjs, spine: global.spine };
  };

  beforeEach(async () => {
    PIXI.Assets.detections.length = 0;
    PIXI.Assets.reset();
    await PIXI.Assets.init({ skipDetections: true });
    PIXI.utils.clearTextureCache();

    originalFetch = PIXI.settings.ADAPTER.fetch;
    PIXI.settings.ADAPTER.fetch = jest.fn(async (url: string) => {
      if (url.includes('.atlas')) {
        return {
          ok: true,
          status: 200,
          statusText: 'OK',
          text: async () => spineboyAtlasContent,
        };
      }
      if (url.includes('.json')) {
        return {
          ok: true,
          status: 200,
          statusText: 'OK',
          json: async () => JSON.parse(spineboyJsonContent),
          text: async () => spineboyJsonContent,
        };
      }
      throw new Error(`Unexpected fetch url: ${url}`);
    });
  });

  afterEach(() => {
    PIXI.settings.ADAPTER.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  const createMockHarness = (gdjs: any) => {
    const resources: { [string]: any } = {
      'spineboy.atlas': {
        kind: 'atlas',
        name: 'spineboy.atlas',
        file: 'assets/spineboy.atlas',
      },
      'spineboy.json': {
        kind: 'spine',
        name: 'spineboy.json',
        file: 'assets/spineboy.json',
      },
      'spineboy.png': {
        kind: 'image',
        name: 'spineboy.png',
        file: 'assets/spineboy.png',
      },
    };
    const loadedTextures = new Map<string, any>();
    const invalidTexture = createTestTexture('invalid://texture');

    const imageManager = {
      loadResource: jest.fn(async (resourceName: string) => {
        if (!loadedTextures.has(resourceName)) {
          loadedTextures.set(
            resourceName,
            createTestTexture(`file:///game/${resources[resourceName].file}`)
          );
        }
      }),
      getPIXITexture: jest.fn((resourceName: string) => {
        const tex = loadedTextures.get(resourceName);
        if (!tex || tex.destroyed) return invalidTexture;
        return tex;
      }),
      getOrLoadPIXITexture: jest.fn((resourceName: string) => {
        if (!loadedTextures.has(resourceName)) {
          loadedTextures.set(
            resourceName,
            createTestTexture(`file:///game/${resources[resourceName].file}`)
          );
        }
        return loadedTextures.get(resourceName);
      }),
      unloadResource: (resourceData: any) => {
        const tex = loadedTextures.get(resourceData.name);
        if (tex) {
          tex.destroy(true);
          loadedTextures.delete(resourceData.name);
        }
      },
      getInvalidPIXITexture: () => invalidTexture,
    };

    const runtimeGame = {
      getEmbeddedResourcesNames: (resourceName: string) => {
        if (resourceName === 'spineboy.atlas') return ['spineboy.png'];
        if (resourceName === 'spineboy.json') return ['spineboy.atlas'];
        return [];
      },
      resolveEmbeddedResource: (_main: string, embedded: string) => embedded,
    };

    const resourceLoader = {
      getRuntimeGame: () => runtimeGame,
      getResource: (name: string) => resources[name] || null,
      getFullUrl: (file: string) => `file:///game/${file}`,
      checkIfCredentialsRequired: () => false,
    };

    const spineAtlasManager = new gdjs.SpineAtlasManager(
      resourceLoader,
      imageManager
    );
    const spineManager = new gdjs.SpineManager(
      resourceLoader,
      spineAtlasManager
    );

    return {
      resources,
      imageManager,
      spineAtlasManager,
      spineManager,
    };
  };

  it('reloads Spine resources after scene unload without TypeError on destroyed BaseTexture', async () => {
    const { gdjs, spine } = loadGdjsSpineRuntime();
    const {
      resources,
      imageManager,
      spineAtlasManager,
      spineManager,
    } = createMockHarness(gdjs);

    await spineManager.loadResource('spineboy.json');
    expect(spineAtlasManager.isLoaded('spineboy.atlas')).toBe(true);
    expect(spineManager.isSpineLoaded('spineboy.json')).toBe(true);

    imageManager.unloadResource(resources['spineboy.png']);
    spineAtlasManager.unloadResource(resources['spineboy.atlas']);
    spineManager.unloadResource(resources['spineboy.json']);

    await new Promise(resolve =>
      setTimeout(resolve, 20 /* allow async PIXI.Assets.unload to settle */)
    );

    await spineManager.loadResource('spineboy.json');
    expect(spineAtlasManager.isLoaded('spineboy.atlas')).toBe(true);
    expect(spineManager.isSpineLoaded('spineboy.json')).toBe(true);

    const aliases = spineManager.getSpineAliases('spineboy.json');
    expect(aliases).not.toBe(null);
    const spineInstance = spine.Spine.from({
      skeleton: aliases.skeletonAlias,
      atlas: aliases.atlasAlias,
      autoUpdate: false,
    });
    expect(spineInstance).toBeInstanceOf(spine.Spine);
    spineInstance.destroy();
  });

  it('awaits imageManager.loadResource instead of calling getOrLoadPIXITexture when loading an atlas', async () => {
    const { gdjs } = loadGdjsSpineRuntime();
    const { imageManager, spineAtlasManager } = createMockHarness(gdjs);

    await spineAtlasManager.loadResource('spineboy.atlas');
    expect(imageManager.loadResource).toHaveBeenCalledWith('spineboy.png');
    expect(imageManager.getOrLoadPIXITexture).not.toHaveBeenCalled();
    expect(spineAtlasManager.isLoaded('spineboy.atlas')).toBe(true);
  });

  it('clears _loadingSpineAtlases when loading fails so retries succeed', async () => {
    const { gdjs } = loadGdjsSpineRuntime();
    const { spineAtlasManager } = createMockHarness(gdjs);

    const originalAssetsLoad = PIXI.Assets.load.bind(PIXI.Assets);
    let failOnce = true;
    jest.spyOn(PIXI.Assets, 'load').mockImplementation(async (...args) => {
      if (failOnce) {
        failOnce = false;
        throw new Error('Transient load error');
      }
      return originalAssetsLoad(...args);
    });

    await expect(spineAtlasManager.getOrLoad('spineboy.atlas')).rejects.toThrow(
      'Transient load error'
    );

    const atlas = await spineAtlasManager.getOrLoad('spineboy.atlas');
    expect(atlas).toBeTruthy();
    expect(spineAtlasManager.isLoaded('spineboy.atlas')).toBe(true);
  });

  it('does not destroy PixiImageManager shared PIXI.Texture when unloading an atlas', async () => {
    const { gdjs } = loadGdjsSpineRuntime();
    const {
      resources,
      imageManager,
      spineAtlasManager,
      spineManager,
    } = createMockHarness(gdjs);

    await spineManager.loadResource('spineboy.json');
    const sharedTexture = imageManager.getPIXITexture('spineboy.png');
    expect(sharedTexture.destroyed).toBe(false);
    expect(sharedTexture.baseTexture).not.toBe(null);

    spineAtlasManager.unloadResource(resources['spineboy.atlas']);
    spineManager.unloadResource(resources['spineboy.json']);

    await new Promise(resolve =>
      setTimeout(resolve, 20 /* allow async PIXI.Assets.unload to settle */)
    );

    expect(sharedTexture.destroyed).toBe(false);
    expect(sharedTexture.baseTexture).not.toBe(null);
    expect(imageManager.getPIXITexture('spineboy.png')).toBe(sharedTexture);

    await spineManager.loadResource('spineboy.json');
    expect(spineManager.isSpineLoaded('spineboy.json')).toBe(true);
  });

  it('handles immediate synchronous reload right after unload without async unload race', async () => {
    const { gdjs, spine } = loadGdjsSpineRuntime();
    const {
      resources,
      imageManager,
      spineAtlasManager,
      spineManager,
    } = createMockHarness(gdjs);

    await spineManager.loadResource('spineboy.json');

    imageManager.unloadResource(resources['spineboy.png']);
    spineAtlasManager.unloadResource(resources['spineboy.atlas']);
    spineManager.unloadResource(resources['spineboy.json']);

    await spineManager.loadResource('spineboy.json');
    await new Promise(resolve =>
      setTimeout(resolve, 20 /* allow async PIXI.Assets.unload to settle */)
    );

    const aliases = spineManager.getSpineAliases('spineboy.json');
    expect(aliases).not.toBe(null);
    const reloadedAtlas = PIXI.Assets.get(aliases.atlasAlias);
    expect(reloadedAtlas).toBeTruthy();
    expect(reloadedAtlas.pages[0].texture.texture.baseTexture.destroyed).toBe(
      false
    );

    const spineInstance = spine.Spine.from({
      skeleton: aliases.skeletonAlias,
      atlas: aliases.atlasAlias,
      autoUpdate: false,
    });
    expect(spineInstance).toBeInstanceOf(spine.Spine);
    spineInstance.destroy();
  });
});
