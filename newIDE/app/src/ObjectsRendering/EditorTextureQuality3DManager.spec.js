// @flow
import * as THREE from 'three';
import EditorTextureQuality3DManager from './EditorTextureQuality3DManager';

type StringValues = { [key: string]: string };

const makeProject = (values: StringValues): gdProject =>
  (({
    getExtensionProperties: () => ({
      getValue: (_namespace: string, key: string) => values[key] || '',
    }),
  }: any): gdProject);

const makeRenderer = (maximum: number): any => ({
  capabilities: {
    maxTextureSize: 4096,
    getMaxAnisotropy: () => maximum,
  },
  getContext: () => ({
    MAX_CUBE_MAP_TEXTURE_SIZE: 0x851c,
    getParameter: () => 2048,
  }),
});

describe('EditorTextureQuality3DManager', () => {
  let originalDocument;

  beforeEach(() => {
    originalDocument = global.document;
    global.document = {
      createElement: jest.fn(() => {
        const context = {
          imageSmoothingEnabled: true,
          drawImage: jest.fn<Array<any>, void>(),
        };
        return {
          width: 0,
          height: 0,
          getContext: () => context,
        };
      }),
    };
  });

  afterEach(() => {
    global.document = originalDocument;
  });

  it('applies resolution, sampler and clamped anisotropy to editor textures', () => {
    const values = {
      enabled: 'true',
      filtering: 'trilinear',
      mipmapMode: 'forceOn',
      anisotropy: '16',
      maxTextureResolution: '512',
      resamplingQuality: 'high',
    };
    const image = { width: 2048, height: 1024 };
    const texture = new THREE.Texture(image);
    texture.magFilter = THREE.NearestFilter;
    texture.minFilter = THREE.NearestFilter;
    const manager = new EditorTextureQuality3DManager();
    manager.setRenderer(makeProject(values), makeRenderer(4));
    manager.track(texture);

    expect(texture.image).not.toBe(image);
    expect(texture.image.width).toBe(512);
    expect(texture.image.height).toBe(256);
    expect(texture.magFilter).toBe(THREE.LinearFilter);
    expect(texture.minFilter).toBe(THREE.LinearMipmapLinearFilter);
    expect(texture.generateMipmaps).toBe(true);
    expect(texture.anisotropy).toBe(4);
  });

  it('restores the original editor texture when disabled', () => {
    const values = { enabled: 'true', maxTextureResolution: '512' };
    const texture = new THREE.Texture({ width: 1024, height: 512 });
    texture.wrapS = THREE.RepeatWrapping;
    const manager = new EditorTextureQuality3DManager();
    const project = makeProject(values);
    manager.setRenderer(project, makeRenderer(8));
    manager.track(texture);
    values.enabled = 'false';
    manager.setRenderer(project, makeRenderer(8));

    expect(texture.image.width).toBe(1024);
    expect(texture.wrapS).toBe(THREE.RepeatWrapping);
  });

  it('reuses one owned resized image for textures sharing the same source', () => {
    const values = { enabled: 'true', maxTextureResolution: '512' };
    const image = { width: 2048, height: 1024 };
    const firstTexture = new THREE.Texture(image);
    const secondTexture = new THREE.Texture(image);
    const manager = new EditorTextureQuality3DManager();
    manager.setRenderer(makeProject(values), makeRenderer(8));
    manager.track(firstTexture);
    manager.track(secondTexture);

    expect(firstTexture.image).toBe(secondTexture.image);
  });

  it('bounds the resized-image cache and uses high-quality resampling', () => {
    const values = {
      enabled: 'true',
      maxTextureResolution: '512',
      resamplingQuality: 'high',
    };
    const image = { width: 2048, height: 1024 };
    const texture = new THREE.Texture(image);
    const manager = new EditorTextureQuality3DManager();
    const project = makeProject(values);
    manager.setRenderer(project, makeRenderer(8));
    manager.track(texture);
    const firstResizedImage = texture.image;
    [400, 300, 200, 100].forEach(resolution => {
      values.maxTextureResolution = String(resolution);
      manager.refresh();
    });
    values.maxTextureResolution = '512';
    manager.refresh();

    expect(texture.image).not.toBe(firstResizedImage);
    expect(document.createElement).toHaveBeenCalledTimes(6);
    expect(texture.image.getContext().imageSmoothingQuality).toBe('high');
  });

  it('adopts a replacement image, restores it on untrack, and reports shared memory once', () => {
    const values = { enabled: 'true', maxTextureResolution: '512' };
    const oldImage = { width: 1024, height: 512 };
    const replacementImage = { width: 2048, height: 1024 };
    const firstTexture = new THREE.Texture(oldImage);
    const secondTexture = new THREE.Texture(oldImage);
    secondTexture.generateMipmaps = true;
    const manager = new EditorTextureQuality3DManager();
    manager.setRenderer(makeProject(values), makeRenderer(8));
    manager.track(firstTexture, { respectSamplerSettings: true });
    manager.track(secondTexture);
    firstTexture.image = replacementImage;
    manager.track(firstTexture, { respectSamplerSettings: true });

    expect(firstTexture.image.width).toBe(512);
    const report = manager.getReport();
    expect(report.uniqueSourceCount).toBe(2);
    expect(report.estimatedUniqueSourceMemoryBytes).toBeGreaterThan(0);
    manager.untrack(firstTexture);
    expect(firstTexture.image).toBe(replacementImage);
    expect(manager.getReport().trackedTextureCount).toBe(1);
  });

  it('restores on project switching and reports renderer capability limits', () => {
    const enabledProject = makeProject({
      enabled: 'true',
      filtering: 'nearest',
    });
    const disabledProject = makeProject({ enabled: 'false' });
    const texture = new THREE.Texture({ width: 16, height: 16 });
    texture.magFilter = THREE.LinearFilter;
    const manager = new EditorTextureQuality3DManager();
    manager.setRenderer(enabledProject, makeRenderer(2));
    manager.track(texture);
    expect(texture.magFilter).toBe(THREE.NearestFilter);
    manager.setRenderer(disabledProject, makeRenderer(4));

    expect(texture.magFilter).toBe(THREE.LinearFilter);
    expect(manager.getReport().maxAnisotropy).toBe(4);
    expect(manager.getReport().maxCubemapSize).toBe(2048);
  });

  it('clamps wrapping without overriding model sampler filtering by default', () => {
    const values = {
      enabled: 'true',
      forceClampWrapping: 'true',
      filtering: 'nearest',
    };
    const texture = new THREE.Texture({ width: 16, height: 16 });
    texture.magFilter = THREE.LinearFilter;
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    texture.wrapS = THREE.RepeatWrapping;
    const manager = new EditorTextureQuality3DManager();
    manager.setRenderer(makeProject(values), makeRenderer(8));
    manager.track(texture, { respectSamplerSettings: true });

    expect(texture.magFilter).toBe(THREE.LinearFilter);
    expect(texture.minFilter).toBe(THREE.LinearMipmapLinearFilter);
    expect(texture.wrapS).toBe(THREE.ClampToEdgeWrapping);
  });
});
