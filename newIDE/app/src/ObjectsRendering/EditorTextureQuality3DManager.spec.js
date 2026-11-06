// @flow
import * as THREE from 'three';
import EditorTextureQuality3DManager from './EditorTextureQuality3DManager';

const makeProject = values => ({
  getExtensionProperties: () => ({
    getValue: (_namespace, key) => values[key] || '',
  }),
});

const makeRenderer = maximum => ({
  capabilities: {
    maxTextureSize: 4096,
    getMaxAnisotropy: () => maximum,
  },
});

describe('EditorTextureQuality3DManager', () => {
  let originalDocument;

  beforeEach(() => {
    originalDocument = global.document;
    global.document = {
      createElement: jest.fn(() => ({
        width: 0,
        height: 0,
        getContext: () => ({
          imageSmoothingEnabled: true,
          drawImage: jest.fn(),
        }),
      })),
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
