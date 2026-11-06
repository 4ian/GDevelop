// @flow
import * as THREE from 'three';
import {
  loadSettings,
  type TextureQuality3DSettings,
} from '../TextureQuality3DEditor/settings';

type TextureOptions = {|
  respectSamplerSettings?: boolean,
  keepNearestFilter?: boolean,
|};

type OriginalState = {|
  image: any,
  magFilter: any,
  minFilter: any,
  generateMipmaps: boolean,
  wrapS: any,
  wrapT: any,
  wrapR: any,
  anisotropy: number,
|};

const MAX_RESIZED_IMAGES_PER_SOURCE = 4;

export type EditorTextureQualityReport = {|
  settings: TextureQuality3DSettings | null,
  trackedTextureCount: number,
  resizedTextureCount: number,
  uniqueSourceCount: number,
  estimatedTextureMemoryBytes: number,
  estimatedUniqueSourceMemoryBytes: number,
  maxAnisotropy: number,
  maxTextureSize: number,
  maxCubemapSize: number,
|};

/**
 * Editor-only counterpart of the runtime texture-quality manager.
 *
 * The scene editor has no RuntimeGame: it owns a separate Three.js renderer
 * and texture cache. Keeping this adapter here makes that boundary explicit.
 * It never changes project resources; resized images are private canvases
 * attached only to editor Three.js textures.
 */
export default class EditorTextureQuality3DManager {
  // $FlowFixMe[value-as-type] - `three` is an untyped module.
  _renderer: THREE.WebGLRenderer | null = null;
  _project: gdProject | null = null;
  _trackedTextures: Set<any> = new Set();
  _originalStates: WeakMap<any, OriginalState> = new WeakMap();
  _options: WeakMap<any, TextureOptions> = new WeakMap();
  _resizedImages: WeakMap<any, Map<string, any>> = new WeakMap();
  _managedImages: WeakSet<any> = new WeakSet();
  _lastSettingsKey: string = '';

  // $FlowFixMe[value-as-type] - `three` is an untyped module.
  setRenderer(project: gdProject, renderer: THREE.WebGLRenderer | null) {
    const changedProject = this._project !== project;
    const changedRenderer = this._renderer !== renderer;
    if (changedProject) this._lastSettingsKey = '';
    this._project = project;
    this._renderer = renderer;
    // This method is called from the render loop. Reapplying every frame would
    // turn a quality setting into needless CPU work and texture uploads. A
    // Project Properties edit calls refresh() explicitly instead.
    if (changedProject || changedRenderer) this.refresh();
  }

  isForProject(project: gdProject): boolean {
    return this._project === project;
  }

  track(texture: any, options?: TextureOptions) {
    if (!texture) return;
    if (!this._originalStates.has(texture)) {
      this._originalStates.set(texture, {
        image: texture.image,
        magFilter: texture.magFilter,
        minFilter: texture.minFilter,
        generateMipmaps: texture.generateMipmaps,
        wrapS: texture.wrapS,
        wrapT: texture.wrapT,
        wrapR: texture.wrapR,
        anisotropy: texture.anisotropy,
      });
    }
    this._options.set(texture, options || {});
    this._trackedTextures.add(texture);
    this._apply(texture);
  }

  untrack(texture: any) {
    this._restore(texture);
    this._trackedTextures.delete(texture);
    this._originalStates.delete(texture);
    this._options.delete(texture);
  }

  dispose() {
    this._trackedTextures.forEach(texture => this._restore(texture));
    this._trackedTextures.clear();
    this._resizedImages = new WeakMap();
    this._managedImages = new WeakSet();
    this._project = null;
    this._renderer = null;
    this._lastSettingsKey = '';
  }

  refresh() {
    if (!this._project) return;
    const settings = loadSettings(this._project);
    const settingsKey = JSON.stringify(settings);
    if (settingsKey === this._lastSettingsKey) return;
    this._lastSettingsKey = settingsKey;
    this._trackedTextures.forEach(texture => this._apply(texture, settings));
  }

  getReport(): EditorTextureQualityReport {
    const settings = this._project ? loadSettings(this._project) : null;
    const sourceMemoryBytes: Map<any, number> = new Map();
    let estimatedTextureMemoryBytes = 0;
    let estimatedUniqueSourceMemoryBytes = 0;
    let resizedTextureCount = 0;
    this._trackedTextures.forEach(texture => {
      const original = this._originalStates.get(texture);
      const image = texture.image;
      const width =
        (image && (image.naturalWidth || image.videoWidth || image.width)) || 0;
      const height =
        (image && (image.naturalHeight || image.videoHeight || image.height)) ||
        0;
      const bytes = width * height * 4 * (texture.generateMipmaps ? 4 / 3 : 1);
      estimatedTextureMemoryBytes += bytes;
      const source = original ? original.image : image;
      const previousBytes = sourceMemoryBytes.get(source) || 0;
      if (bytes > previousBytes) sourceMemoryBytes.set(source, bytes);
      if (original && texture.image !== original.image) resizedTextureCount++;
    });
    sourceMemoryBytes.forEach(bytes => {
      estimatedUniqueSourceMemoryBytes += bytes;
    });
    // Use a local copy of the field: refinements of `this._renderer` are lost
    // after calling a method on it (which could have changed the field).
    const renderer = this._renderer;
    return {
      settings,
      trackedTextureCount: this._trackedTextures.size,
      resizedTextureCount,
      uniqueSourceCount: sourceMemoryBytes.size,
      estimatedTextureMemoryBytes,
      estimatedUniqueSourceMemoryBytes,
      maxAnisotropy: renderer ? renderer.capabilities.getMaxAnisotropy() : 0,
      maxTextureSize: renderer ? renderer.capabilities.maxTextureSize : 0,
      maxCubemapSize: renderer
        ? renderer
            .getContext()
            .getParameter(renderer.getContext().MAX_CUBE_MAP_TEXTURE_SIZE)
        : 0,
    };
  }

  _apply(texture: any, providedSettings?: any) {
    if (!this._project) return;
    const settings = providedSettings || loadSettings(this._project);
    const original = this._originalStates.get(texture);
    if (!original) return;
    // Resource reloads or a model editor can replace a texture image while
    // keeping the Texture object. Adopt that new external image as the source
    // of truth, but never mistake our own private canvas for an external one.
    if (
      texture.image &&
      texture.image !== original.image &&
      !this._managedImages.has(texture.image)
    ) {
      original.image = texture.image;
    }
    if (!settings.enabled) {
      this._restore(texture);
      return;
    }

    const options = this._options.get(texture) || {};
    const canChangeSampler =
      !options.respectSamplerSettings || settings.overrideModelSamplers;
    let changed = this._fitResolution(texture, original, settings);

    if (canChangeSampler) {
      if (options.keepNearestFilter || settings.filtering === 'nearest') {
        changed =
          this._set(texture, 'magFilter', THREE.NearestFilter) || changed;
        changed =
          this._set(texture, 'minFilter', THREE.NearestFilter) || changed;
      } else if (settings.filtering === 'bilinear') {
        changed =
          this._set(texture, 'magFilter', THREE.LinearFilter) || changed;
        changed =
          this._set(texture, 'minFilter', THREE.LinearFilter) || changed;
      } else if (settings.filtering === 'trilinear') {
        changed =
          this._set(texture, 'magFilter', THREE.LinearFilter) || changed;
        changed =
          this._set(texture, 'minFilter', THREE.LinearMipmapLinearFilter) ||
          changed;
      }
      if (options.keepNearestFilter || settings.mipmapMode === 'forceOff') {
        changed = this._set(texture, 'generateMipmaps', false) || changed;
        if (
          texture.minFilter !== THREE.NearestFilter &&
          texture.minFilter !== THREE.LinearFilter
        )
          changed =
            this._set(
              texture,
              'minFilter',
              texture.magFilter === THREE.NearestFilter
                ? THREE.NearestFilter
                : THREE.LinearFilter
            ) || changed;
      } else if (settings.mipmapMode === 'forceOn') {
        changed = this._set(texture, 'generateMipmaps', true) || changed;
        if (
          texture.minFilter === THREE.NearestFilter ||
          texture.minFilter === THREE.LinearFilter
        )
          changed =
            this._set(
              texture,
              'minFilter',
              texture.magFilter === THREE.NearestFilter
                ? THREE.NearestMipmapLinearFilter
                : THREE.LinearMipmapLinearFilter
            ) || changed;
      } else {
        changed =
          this._set(
            texture,
            'generateMipmaps',
            texture.minFilter !== THREE.NearestFilter &&
              texture.minFilter !== THREE.LinearFilter
          ) || changed;
      }
      const maximum = this._renderer
        ? this._renderer.capabilities.getMaxAnisotropy()
        : 1;
      const requested =
        settings.anisotropy === 0 ? maximum : settings.anisotropy;
      changed =
        this._set(
          texture,
          'anisotropy',
          Math.max(1, Math.min(requested, maximum || 1))
        ) || changed;
    }
    if (settings.forceClampWrapping) {
      changed =
        this._set(texture, 'wrapS', THREE.ClampToEdgeWrapping) || changed;
      changed =
        this._set(texture, 'wrapT', THREE.ClampToEdgeWrapping) || changed;
      if (texture.wrapR !== undefined)
        changed =
          this._set(texture, 'wrapR', THREE.ClampToEdgeWrapping) || changed;
    } else {
      changed = this._set(texture, 'wrapS', original.wrapS) || changed;
      changed = this._set(texture, 'wrapT', original.wrapT) || changed;
      if (original.wrapR !== undefined)
        changed = this._set(texture, 'wrapR', original.wrapR) || changed;
    }
    if (changed) texture.needsUpdate = true;
  }

  _fitResolution(
    texture: any,
    original: OriginalState,
    settings: any
  ): boolean {
    const image = original.image;
    const width =
      image && (image.naturalWidth || image.videoWidth || image.width);
    const height =
      image && (image.naturalHeight || image.videoHeight || image.height);
    const rendererLimit = this._renderer
      ? this._renderer.capabilities.maxTextureSize
      : 0;
    const limit =
      settings.maxTextureResolution > 0
        ? rendererLimit > 0
          ? Math.min(settings.maxTextureResolution, rendererLimit)
          : settings.maxTextureResolution
        : rendererLimit;
    if (
      !image ||
      !width ||
      !height ||
      !limit ||
      Math.max(width, height) <= limit
    ) {
      return this._set(texture, 'image', image);
    }
    const scale = limit / Math.max(width, height);
    const resizedWidth = Math.max(1, Math.round(width * scale));
    const resizedHeight = Math.max(1, Math.round(height * scale));
    const cacheKey =
      resizedWidth +
      'x' +
      resizedHeight +
      '|' +
      (settings.resamplingQuality === 'low' ? 'low' : 'high');
    let imagesBySettings = this._resizedImages.get(image);
    if (!imagesBySettings) {
      imagesBySettings = new Map();
      this._resizedImages.set(image, imagesBySettings);
    }
    const cachedImage = imagesBySettings.get(cacheKey);
    if (cachedImage) return this._set(texture, 'image', cachedImage);
    const canvas = document.createElement('canvas');
    canvas.width = resizedWidth;
    canvas.height = resizedHeight;
    const context = canvas.getContext('2d');
    if (!context) return false;
    context.imageSmoothingEnabled = settings.resamplingQuality !== 'low';
    if (context.imageSmoothingQuality)
      context.imageSmoothingQuality =
        settings.resamplingQuality === 'low' ? 'low' : 'high';
    context.drawImage(image, 0, 0, resizedWidth, resizedHeight);
    // $FlowFixMe[prop-missing]
    canvas.__gdTextureQualitySource = image;
    if (imagesBySettings.size >= MAX_RESIZED_IMAGES_PER_SOURCE) {
      const oldestKey = imagesBySettings.keys().next().value;
      if (oldestKey) imagesBySettings.delete(oldestKey);
    }
    imagesBySettings.set(cacheKey, canvas);
    this._managedImages.add(canvas);
    return this._set(texture, 'image', canvas);
  }

  _restore(texture: any) {
    const original = this._originalStates.get(texture);
    if (!original) return;
    let changed = false;
    const keys: Array<$Keys<OriginalState>> = [
      'image',
      'magFilter',
      'minFilter',
      'generateMipmaps',
      'wrapS',
      'wrapT',
      'wrapR',
      'anisotropy',
    ];
    keys.forEach(key => {
      if (original[key] !== undefined)
        changed = this._set(texture, key, original[key]) || changed;
    });
    if (changed) texture.needsUpdate = true;
  }

  _set(texture: any, key: string, value: any): boolean {
    if (texture[key] === value) return false;
    texture[key] = value;
    return true;
  }
}
