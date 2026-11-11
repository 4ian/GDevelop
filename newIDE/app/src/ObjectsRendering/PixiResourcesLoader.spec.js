/**
 * @jest-environment node
 */
// @flow
import * as PIXI from 'pixi.js-legacy';
import { Spine } from '@esotericsoftware/spine-pixi-v7';
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
  class MockImage {
    src: string = '';
    crossOrigin: string = '';
    complete: boolean = true;
    width: number = 1024;
    height: number = 256;
    onload: (() => void) | null = null;
    onerror: (() => void) | null = null;
    addEventListener() {}
    removeEventListener() {}
  }
  global.HTMLImageElement = MockImage;
  global.Image = MockImage;
  global.location = {
    protocol: 'http:',
    hostname: 'localhost',
    port: '80',
    origin: 'http://localhost',
  };
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
  let imageUrlVersion;
  const imageLoader = {
    name: 'testSpineImageLoader',
    test: (url: string) => url.includes('spineboy.png'),
    load: async (url: string) => createTestTexture(url),
    unload: texture => texture.destroy(true),
  };

  beforeEach(async () => {
    PixiResourcesLoader.burstCache();
    PIXI.Assets.detections.length = 0;
    PIXI.Assets.reset();
    await PIXI.Assets.init({ skipDetections: true });
    PIXI.utils.clearTextureCache();
    PIXI.Assets.loader.parsers.unshift(imageLoader);

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

    imageUrlVersion = 1;
    jest
      .spyOn(ResourcesLoader, 'getResourceFullUrl')
      .mockImplementation((_project, resourceName) => {
        if (resourceName === 'spineboy.png') {
          return `file:///project/spineboy.png?v=${imageUrlVersion}`;
        }
        if (resourceName === 'spineboy.atlas') {
          return 'file:///project/spineboy.atlas';
        }
        if (resourceName === 'spineboy.json') {
          return 'file:///project/spineboy.json';
        }
        return `file:///project/${resourceName}`;
      });
  });

  afterEach(() => {
    PIXI.settings.ADAPTER.fetch = originalFetch;
    PIXI.Assets.loader.parsers.splice(
      PIXI.Assets.loader.parsers.indexOf(imageLoader),
      1
    );
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
      const initialBaseTexture = initialTexture.baseTexture;

      // Load only the atlas (without loading spineData yet), then reload the atlas.
      const firstAtlasResult = await PixiResourcesLoader._getSpineTextureAtlas(
        project,
        'spineboy.atlas'
      );
      expect(firstAtlasResult.loadingError).toBe(null);
      expect(firstAtlasResult.textureAtlas).not.toBe(null);
      if (!firstAtlasResult.textureAtlas) {
        throw new Error('Expected the Spine atlas to be loaded.');
      }

      await PixiResourcesLoader._doReloadResource(project, 'spineboy.atlas');

      expect(firstAtlasResult.textureAtlas.pages[0].texture).toBe(null);
      expect(initialTexture.destroyed).toBe(false);
      expect(initialTexture.baseTexture).not.toBe(null);

      imageUrlVersion++;
      await PixiResourcesLoader._doReloadResource(project, 'spineboy.png');
      expect(initialTexture.destroyed).toBe(true);
      expect(initialBaseTexture.destroyed).toBe(true);

      const reloadedTexture = PixiResourcesLoader.getPIXITexture(
        project,
        'spineboy.png'
      );
      expect(reloadedTexture).not.toBe(initialTexture);
      expect(reloadedTexture.baseTexture).not.toBe(initialBaseTexture);
      expect(reloadedTexture.destroyed).toBe(false);
      expect(reloadedTexture.baseTexture).not.toBe(null);

      const secondAtlasResult = await PixiResourcesLoader._getSpineTextureAtlas(
        project,
        'spineboy.atlas'
      );
      expect(secondAtlasResult.loadingError).toBe(null);
      const reloadedAtlas = secondAtlasResult.textureAtlas;
      if (!reloadedAtlas || !reloadedAtlas.pages[0].texture) {
        throw new Error('Expected the reloaded Spine atlas texture.');
      }
      expect(reloadedAtlas.pages[0].texture.texture.baseTexture).toBe(
        reloadedTexture.baseTexture
      );
    } finally {
      project.delete();
    }
  });

  it('invalidates parsed skeleton data when reloading an atlas', async () => {
    const project = createProjectWithSpineResources();
    const createSpine = async () => {
      const { aliases } = await PixiResourcesLoader.getSpineData(
        project,
        'spineboy.json'
      );
      if (!aliases) throw new Error('Expected the Spine to be loaded.');
      return Spine.from({
        skeleton: aliases.skeletonAlias,
        atlas: aliases.atlasAlias,
        autoUpdate: false,
      });
    };
    try {
      await PixiResourcesLoader.loadTextures(project, ['spineboy.png']);
      const initialSpine = await createSpine();
      const initialSkeletonData = initialSpine.skeleton.data;
      initialSpine.destroy();

      await PixiResourcesLoader._doReloadResource(project, 'spineboy.atlas');
      const reloadedSpine = await createSpine();
      expect(reloadedSpine.skeleton.data).not.toBe(initialSkeletonData);
      expect(
        PixiResourcesLoader.getPIXITexture(project, 'spineboy.png').destroyed
      ).toBe(false);
      reloadedSpine.destroy();
    } finally {
      project.delete();
    }
  });

  it('reports atlas unload failures instead of completing the reload silently', async () => {
    const project = createProjectWithSpineResources();
    try {
      await PixiResourcesLoader.loadTextures(project, ['spineboy.png']);
      await PixiResourcesLoader._getSpineTextureAtlas(
        project,
        'spineboy.atlas'
      );
      const error = new Error('Atlas unload failed');
      jest.spyOn(PIXI.Assets, 'unload').mockRejectedValueOnce(error);
      const errorSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      await expect(
        PixiResourcesLoader._doReloadResource(project, 'spineboy.atlas')
      ).rejects.toBe(error);
      expect(errorSpy).toHaveBeenCalledWith(
        'Error while unloading Spine atlas "spineboy.atlas":',
        error
      );
    } finally {
      project.delete();
    }
  });
});
