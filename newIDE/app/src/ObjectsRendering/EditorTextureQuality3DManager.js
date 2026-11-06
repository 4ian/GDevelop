// @flow
import * as THREE from 'three';
import { loadSettings } from '../TextureQuality3DEditor/settings';

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

/**
 * Editor-only counterpart of the runtime texture-quality manager.
 *
 * The scene editor has no RuntimeGame: it owns a separate Three.js renderer
 * and texture cache. Keeping this adapter here makes that boundary explicit.
 * It never changes project resources; resized images are private canvases
 * attached only to editor Three.js textures.
 */
export default class EditorTextureQuality3DManager {
  _renderer: THREE.WebGLRenderer | null = null;
  _project: gdProject | null = null;
  _trackedTextures: Set<any> = new Set();
  _originalStates: WeakMap<any, OriginalState> = new WeakMap();
  _options: WeakMap<any, TextureOptions> = new WeakMap();
  _lastSettingsKey: string = '';

  setRenderer(project: gdProject, renderer: THREE.WebGLRenderer | null) {
    if (this._project !== project) this._lastSettingsKey = '';
    this._project = project;
    this._renderer = renderer;
    this.refresh();
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
    this._trackedTextures.delete(texture);
    this._originalStates.delete(texture);
    this._options.delete(texture);
  }

  dispose() {
    this._trackedTextures.forEach(texture => this._restore(texture));
    this._trackedTextures.clear();
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

  _apply(texture: any, providedSettings?: any) {
    if (!this._project) return;
    const settings = providedSettings || loadSettings(this._project);
    const original = this._originalStates.get(texture);
    if (!original) return;
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
    const oldImage = texture.image;
    if (
      oldImage &&
      oldImage.__gdTextureQualitySource === image &&
      oldImage.width === resizedWidth &&
      oldImage.height === resizedHeight
    )
      return false;
    const canvas = document.createElement('canvas');
    canvas.width = resizedWidth;
    canvas.height = resizedHeight;
    const context = canvas.getContext('2d');
    if (!context) return false;
    context.imageSmoothingEnabled = settings.resamplingQuality !== 'low';
    context.drawImage(image, 0, 0, resizedWidth, resizedHeight);
    // $FlowFixMe[prop-missing]
    canvas.__gdTextureQualitySource = image;
    return this._set(texture, 'image', canvas);
  }

  _restore(texture: any) {
    const original = this._originalStates.get(texture);
    if (!original) return;
    let changed = false;
    [
      'image',
      'magFilter',
      'minFilter',
      'generateMipmaps',
      'wrapS',
      'wrapT',
      'wrapR',
      'anisotropy',
    ].forEach(key => {
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
