/*
 * GDevelop JS Platform
 * Copyright 2013-present Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
namespace gdjs {
  const logger = new gdjs.Logger('Advanced Texture Quality 3D');

  /**
   * The name of the "extension properties" namespace (see
   * `gd::ExtensionProperties`) used to save the settings of the advanced
   * texture quality system in the project (and so in the exported game).
   *
   * It must be kept in sync with the editor (see
   * `newIDE/app/src/TextureQuality3DEditor/settings.js`).
   */
  export const textureQuality3dPropertiesNamespace = 'AdvancedTextureQuality3D';

  /**
   * The name of the quality preset chosen in the editor.
   *
   * - `classic`: the system is disabled and textures are left untouched
   *   (this is the default, so that games made before this system existed are
   *   rendered exactly like before).
   * - `performance`, `balanced`, `quality`, `ultra`: ready-to-use presets.
   * - `custom`: the settings were manually customized in the editor.
   *
   * @category 3D > Textures
   */
  export type TextureQuality3DPreset =
    | 'classic'
    | 'performance'
    | 'balanced'
    | 'quality'
    | 'ultra'
    | 'custom';

  /**
   * How the texture sampling filters are chosen.
   *
   * - `keep`: keep the filters chosen by the resources (images) or by the
   *   3D model samplers.
   * - `nearest`: hard pixels, no smoothing (fastest, pixel-art friendly).
   * - `bilinear`: smooth sampling without mipmaps.
   * - `trilinear`: smooth sampling with mipmaps (best quality).
   *
   * @category 3D > Textures
   */
  export type TextureQuality3DFiltering =
    | 'keep'
    | 'nearest'
    | 'bilinear'
    | 'trilinear';

  /**
   * How mipmaps are managed.
   *
   * - `auto`: mipmaps are generated only when the minifying filter uses them.
   * - `forceOn`: mipmaps are always generated and used (the minifying filter
   *   is upgraded to a mipmapped one if needed).
   * - `forceOff`: mipmaps are never generated (the minifying filter is
   *   downgraded to a non-mipmapped one if needed).
   *
   * @category 3D > Textures
   */
  export type TextureQuality3DMipmapMode = 'auto' | 'forceOn' | 'forceOff';

  /**
   * The quality used when a texture is downscaled to respect the maximum
   * texture resolution (`high` uses a smoother resampling).
   *
   * @category 3D > Textures
   */
  export type TextureQuality3DResamplingQuality = 'high' | 'low';

  /**
   * The kind of texture, used for diagnostics.
   *
   * @category 3D > Textures
   */
  export type TextureQuality3DTextureKind = 'image' | 'model' | 'cubemap';

  /**
   * The settings of the advanced texture quality system. They are saved in the
   * project as "extension properties" and restored in the exported game.
   *
   * @category 3D > Textures
   */
  export interface TextureQuality3DSettings {
    /** `true` if the system must modify the textures. */
    enabled: boolean;
    /** The preset shown in the editor. */
    preset: TextureQuality3DPreset;
    /** How the sampling filters are chosen. */
    filtering: TextureQuality3DFiltering;
    /** How mipmaps are managed. */
    mipmapMode: TextureQuality3DMipmapMode;
    /**
     * The level of anisotropic filtering, from 1 (disabled) to 16.
     * 0 means "use the maximum supported by the GPU".
     * The value is automatically clamped to what the GPU supports.
     */
    anisotropy: integer;
    /**
     * Textures bigger than this (on their biggest side) are downscaled before
     * being uploaded to the GPU. 0 means "no limit" (except the hard limit of
     * the GPU, which is always respected).
     */
    maxTextureResolution: integer;
    /** The quality used when downscaling textures. */
    resamplingQuality: TextureQuality3DResamplingQuality;
    /** Force `ClampToEdge` wrapping on the S and T axes of 3D textures. */
    forceClampWrapping: boolean;
    /**
     * Apply the filtering, mipmap and wrapping settings to 3D model textures
     * too (the filtering settings of their glTF samplers are then ignored).
     */
    overrideModelSamplers: boolean;
    /**
     * A warning is logged when the estimated GPU memory used by the tracked
     * textures exceeds this amount (in MB). 0 disables the check.
     */
    memoryBudgetMb: integer;
    /** Keep detailed information about each texture for the diagnostics. */
    diagnostics: boolean;
  }

  /**
   * The capabilities of the GPU and WebGL context, automatically detected at
   * startup (see `TextureQuality3DManager.initializeWithRenderer`).
   *
   * @category 3D > Textures
   */
  export interface TextureQuality3DGpuCapabilities {
    /** Always `true` for Three.js r185, which requires WebGL 2. */
    isWebGL2: boolean;
    /** `GL.MAX_TEXTURE_SIZE` */
    maxTextureSize: integer;
    /** `GL.MAX_CUBE_MAP_TEXTURE_SIZE` */
    maxCubemapSize: integer;
    /** `GL.MAX_3D_TEXTURE_SIZE` (0 if unknown). */
    max3DTextureSize: integer;
    /** The maximum number of samples for antialiasing (`GL.MAX_SAMPLES`). */
    maxSamples: integer;
    /** The shader precision used by Three.js (`highp`, `mediump`...). */
    precision: string;
    /**
     * The maximum level of anisotropic filtering supported
     * (`GL.MAX_TEXTURE_MAX_ANISOTROPY_EXT`), or 0 if anisotropic filtering is
     * not supported at all.
     */
    maxAnisotropy: float;
    /** The name of the GPU, as reported by the browser/driver. */
    gpuName: string;
    /** The names of the supported compressed texture formats. */
    supportedCompressedFormats: Array<string>;
    /** `true` if `EXT_texture_filter_anisotropic` is available. */
    supportsAnisotropicFiltering: boolean;
  }

  /**
   * Information about a tracked texture, used for diagnostics.
   *
   * Memory field semantics (estimates for uncompressed RGBA textures,
   * mipmaps included when generated):
   *
   * - `memoryBytes` is a *per-texture* estimate: the memory of this texture's
   *   images at their current size. Textures sharing the same source (like
   *   the clones of a 3D model texture) are backed by one GPU allocation and
   *   report (about) the same value: this field is **not additive** over
   *   shared sources.
   * - `sourceMemoryBytes` is the *unique-source* estimate: the memory of the
   *   shared GPU allocation behind `sourceId` (the biggest per-texture
   *   estimate of its tracked textures).
   * - `uniqueSourceMemoryBytes` attributes `sourceMemoryBytes` to exactly one
   *   entry per source (the first tracked texture of that source; 0 for the
   *   other entries sharing it), so this field **is additive**: summing it
   *   over all the entries gives `TextureQuality3DReport.textureMemoryBytes`.
   *
   * The estimates follow the current `texture.image` of each texture (so a
   * downscaled texture is estimated at its downscaled size). Original images
   * kept outside the textures (by the resource managers or by the internal
   * resized-images cache) are CPU-side and are not counted here.
   *
   * @category 3D > Textures
   */
  export interface TextureQuality3DTextureEntry {
    id: string;
    /** The id of the shared GPU allocation (the Three.js `Source`). */
    sourceId: string;
    label: string;
    kind: TextureQuality3DTextureKind;
    width: integer;
    height: integer;
    /** Per-texture estimate (not additive over shared sources). */
    memoryBytes: integer;
    /** Unique-source estimate (additive over the entries). */
    uniqueSourceMemoryBytes: integer;
    /** The estimated GPU memory of the shared source. */
    sourceMemoryBytes: integer;
    /** The number of tracked textures sharing `sourceId`. */
    sharedSourceCount: integer;
    mipmaps: boolean;
    anisotropy: float;
    minFilter: integer;
    magFilter: integer;
  }

  /**
   * A complete diagnostic report about textures and settings.
   *
   * @category 3D > Textures
   */
  export interface TextureQuality3DReport {
    settings: TextureQuality3DSettings;
    capabilities: TextureQuality3DGpuCapabilities | null;
    /** The number of tracked textures. */
    textureCount: integer;
    /**
     * The estimated GPU memory used by the tracked textures, in bytes.
     * Each shared source is counted once (this equals both
     * `TextureQuality3DManager.getTextureMemoryBytes()` and the sum of the
     * entries' `uniqueSourceMemoryBytes`).
     */
    textureMemoryBytes: integer;
    /** The details of each tracked texture, sorted by memory usage. */
    textures: Array<TextureQuality3DTextureEntry>;
    /** The warnings about the settings and the detected capabilities. */
    warnings: Array<string>;
  }

  /**
   * Options given to `TextureQuality3DManager.applyToTexture`.
   *
   * @category 3D > Textures
   */
  export interface TextureQuality3DApplyOptions {
    /** The name of the resource behind the texture (used for diagnostics). */
    label?: string;
    /** The kind of texture (used for diagnostics). */
    kind?: TextureQuality3DTextureKind;
    /**
     * `true` when the texture must keep nearest-neighbor filtering, because
     * smoothing was disabled for its resource. Such textures are never
     * smoothed by the quality settings.
     */
    keepNearestFilter?: boolean;
    /**
     * `true` for 3D model textures: their glTF sampler settings are kept
     * (unless `overrideModelSamplers` is enabled in the settings).
     */
    respectSamplerSettings?: boolean;
  }

  const defaultSettings: TextureQuality3DSettings = {
    enabled: false,
    preset: 'classic',
    filtering: 'keep',
    mipmapMode: 'auto',
    anisotropy: 1,
    maxTextureResolution: 0,
    resamplingQuality: 'high',
    forceClampWrapping: false,
    overrideModelSamplers: false,
    memoryBudgetMb: 0,
    diagnostics: true,
  };

  /**
   * The presets offered by the editor. They must be kept in sync with
   * `newIDE/app/src/TextureQuality3DEditor/settings.js`.
   */
  export const textureQuality3dPresets: {
    [presetName: string]: TextureQuality3DSettings;
  } = {
    classic: { ...defaultSettings },
    performance: {
      ...defaultSettings,
      enabled: true,
      preset: 'performance',
      anisotropy: 1,
      maxTextureResolution: 1024,
      resamplingQuality: 'low',
      memoryBudgetMb: 256,
    },
    balanced: {
      ...defaultSettings,
      enabled: true,
      preset: 'balanced',
      filtering: 'trilinear',
      mipmapMode: 'forceOn',
      anisotropy: 4,
      maxTextureResolution: 2048,
      memoryBudgetMb: 512,
    },
    quality: {
      ...defaultSettings,
      enabled: true,
      preset: 'quality',
      filtering: 'trilinear',
      mipmapMode: 'forceOn',
      anisotropy: 8,
      maxTextureResolution: 4096,
      overrideModelSamplers: true,
      memoryBudgetMb: 1024,
    },
    ultra: {
      ...defaultSettings,
      enabled: true,
      preset: 'ultra',
      filtering: 'trilinear',
      mipmapMode: 'forceOn',
      anisotropy: 0,
      maxTextureResolution: 0,
      overrideModelSamplers: true,
      memoryBudgetMb: 0,
    },
  };

  // The names of the settings saved in the project. They must be kept in sync
  // with `newIDE/app/src/TextureQuality3DEditor/settings.js`.
  type SettingKey = keyof TextureQuality3DSettings;

  const settingKeys: Array<SettingKey> = [
    'enabled',
    'preset',
    'filtering',
    'mipmapMode',
    'anisotropy',
    'maxTextureResolution',
    'resamplingQuality',
    'forceClampWrapping',
    'overrideModelSamplers',
    'memoryBudgetMb',
    'diagnostics',
  ];

  const filteringValues: Array<TextureQuality3DFiltering> = [
    'keep',
    'nearest',
    'bilinear',
    'trilinear',
  ];
  const mipmapModeValues: Array<TextureQuality3DMipmapMode> = [
    'auto',
    'forceOn',
    'forceOff',
  ];
  const resamplingQualityValues: Array<TextureQuality3DResamplingQuality> = [
    'high',
    'low',
  ];
  const presetValues: Array<TextureQuality3DPreset> = [
    'classic',
    'performance',
    'balanced',
    'quality',
    'ultra',
    'custom',
  ];

  const compressedFormatLabels: { [extensionName: string]: string } = {
    WEBGL_compressed_texture_s3tc: 'S3TC (DXT)',
    WEBGL_compressed_texture_s3tc_srgb: 'S3TC sRGB',
    WEBGL_compressed_texture_astc: 'ASTC',
    WEBGL_compressed_texture_etc: 'ETC2/EAC',
    WEBGL_compressed_texture_etc1: 'ETC1',
    WEBGL_compressed_texture_pvrtc: 'PVRTC',
    EXT_texture_compression_bptc: 'BPTC',
    EXT_texture_compression_rgtc: 'RGTC',
    EXT_texture_compression_rgtc_srgb: 'RGTC sRGB',
  };

  // Note: the THREE constants are only accessed from functions called when a
  // 3D texture is handled, so that games without 3D don't need THREE to be
  // loaded (this file is included in every game).
  const filterRequiresMipmaps = (filter: integer): boolean =>
    filter === THREE.NearestMipmapNearestFilter ||
    filter === THREE.NearestMipmapLinearFilter ||
    filter === THREE.LinearMipmapNearestFilter ||
    filter === THREE.LinearMipmapLinearFilter;

  type TrackedTextureEntry = {
    texture: THREE.Texture;
    sourceId: string;
    label: string;
    kind: TextureQuality3DTextureKind;
    keepNearestFilter: boolean;
    respectSamplerSettings: boolean;
    /** The per-texture memory estimate (see `TextureQuality3DTextureEntry`). */
    memoryBytes: integer;
  };

  type TrackedSourceEntry = {
    /** The estimated GPU memory used by the (shared) source. */
    memoryBytes: integer;
    /** The uuid of each tracked texture using this source. */
    textureIds: Set<string>;
  };

  /**
   * The manager handling the advanced texture quality of 3D textures:
   *
   * - detects the GPU capabilities (maximum texture size, supported compressed
   *   texture formats, maximum anisotropy...),
   * - applies the quality settings to every 3D texture used by the game
   *   (textures from image resources, cube textures and 3D model textures),
   * - downscales oversized textures before they are uploaded to the GPU,
   * - tracks the estimated GPU memory used by the textures and provides
   *   diagnostic reports and warnings to the developer.
   *
   * The settings are read from the project (saved as "extension properties"
   * by the editor) and can be changed at runtime with the actions of the 3D
   * extension.
   *
   * @category 3D > Textures
   */
  export class TextureQuality3DManager {
    /**
     * The effective settings: `Runtime Override ?? Project Setting ??
     * Manager Default` (the project settings already fall back to the
     * manager defaults, see `loadSettingsFromProject`).
     */
    private _settings: TextureQuality3DSettings;
    /** The settings saved in the project, refreshed on project data reload. */
    private _projectSettings: TextureQuality3DSettings;
    /**
     * The settings changed at runtime (by the actions of the 3D extension or
     * by `setRuntimeOverride`). They have priority over the project settings,
     * survive the hot-reload of the same running project, and are never
     * written into the persisted project settings.
     */
    private _runtimeOverrides: Partial<TextureQuality3DSettings> = {};
    /**
     * Identifies the project currently loaded in the runtime (its
     * `projectUuid`), to avoid leaking runtime overrides into another
     * project loaded later into the same runtime.
     */
    private _projectKey: string;
    private _capabilities: TextureQuality3DGpuCapabilities | null = null;

    // Tracking of the GPU memory used by the textures. A texture is registered
    // as soon as it is created (even when the system is disabled) so that the
    // diagnostics and the runtime actions always work. Textures sharing the
    // same source (like the textures of cloned 3D models) are counted once.
    private _trackedTextures = new Map<string, TrackedTextureEntry>();
    private _trackedSources = new Map<string, TrackedSourceEntry>();
    private _totalMemoryBytes = 0;
    private _isMemoryBudgetWarningLogged = false;
    private _isDisposed = false;

    // Cache of the images that were already downscaled, to avoid doing the
    // work twice when a source is shared between several textures.
    private _resizedImages = new WeakMap<object, any>();

    constructor(runtimeGame: gdjs.RuntimeGame) {
      this._projectSettings =
        gdjs.TextureQuality3DManager.loadSettingsFromProject(runtimeGame);
      this._settings = { ...this._projectSettings };
      this._projectKey =
        gdjs.TextureQuality3DManager._getProjectKey(runtimeGame);
      if (this._settings.enabled) {
        logger.log(
          'Advanced Texture Quality 3D is enabled with the preset "' +
            this._settings.preset +
            '".'
        );
      }
    }

    /**
     * Read the settings saved in the project (as extension properties).
     * Missing values fall back to the `classic` preset (the system disabled),
     * so that projects made before this system behave exactly like before.
     */
    static loadSettingsFromProject(
      runtimeGame: gdjs.RuntimeGame
    ): TextureQuality3DSettings {
      const settings: TextureQuality3DSettings = { ...defaultSettings };
      for (const key of settingKeys) {
        const value = runtimeGame.getExtensionProperty(
          gdjs.textureQuality3dPropertiesNamespace,
          key
        );
        if (value === null || value === undefined || value === '') continue;
        switch (key) {
          case 'enabled':
          case 'forceClampWrapping':
          case 'overrideModelSamplers':
          case 'diagnostics':
            (settings as any)[key] = value === 'true';
            break;
          case 'anisotropy':
          case 'maxTextureResolution':
          case 'memoryBudgetMb':
            (settings as any)[key] = Math.max(0, parseInt(value, 10) || 0);
            break;
          case 'preset':
            if (presetValues.indexOf(value as TextureQuality3DPreset) !== -1) {
              settings.preset = value as TextureQuality3DPreset;
            }
            break;
          case 'filtering':
            if (
              filteringValues.indexOf(value as TextureQuality3DFiltering) !== -1
            ) {
              settings.filtering = value as TextureQuality3DFiltering;
            }
            break;
          case 'mipmapMode':
            if (
              mipmapModeValues.indexOf(value as TextureQuality3DMipmapMode) !==
              -1
            ) {
              settings.mipmapMode = value as TextureQuality3DMipmapMode;
            }
            break;
          case 'resamplingQuality':
            if (
              resamplingQualityValues.indexOf(
                value as TextureQuality3DResamplingQuality
              ) !== -1
            ) {
              settings.resamplingQuality =
                value as TextureQuality3DResamplingQuality;
            }
            break;
        }
      }
      // The anisotropy is between 1 and 16, or 0 for "automatic".
      settings.anisotropy = Math.min(16, settings.anisotropy);
      return settings;
    }

    /**
     * Return the effective settings (`Runtime Override ?? Project Setting ??
     * Manager Default`).
     */
    getSettings(): TextureQuality3DSettings {
      return { ...this._settings };
    }

    /**
     * Return the settings saved in the project (without the runtime
     * overrides).
     */
    getProjectSettings(): TextureQuality3DSettings {
      return { ...this._projectSettings };
    }

    /**
     * Return the settings overridden at runtime (empty if none).
     */
    getRuntimeOverrides(): Partial<TextureQuality3DSettings> {
      return { ...this._runtimeOverrides };
    }

    /**
     * Set one runtime override. The value has priority over the project
     * setting (and over the manager default) until it is removed with
     * `removeRuntimeOverride` or `clearRuntimeOverrides`.
     */
    setRuntimeOverride<K extends SettingKey>(
      key: K,
      value: TextureQuality3DSettings[K]
    ): void {
      (this._runtimeOverrides as any)[key] = value;
      this._isMemoryBudgetWarningLogged = false;
      this._recomputeEffectiveSettings();
      this._reapplyToTrackedTextures();
    }

    /**
     * Remove one runtime override: its effective value returns to the latest
     * project setting (or to the manager default if the project does not
     * define it). Return false if this setting was not overridden.
     */
    removeRuntimeOverride(key: SettingKey): boolean {
      if (!(key in this._runtimeOverrides)) return false;
      delete (this._runtimeOverrides as any)[key];
      this._isMemoryBudgetWarningLogged = false;
      this._recomputeEffectiveSettings();
      this._reapplyToTrackedTextures();
      return true;
    }

    /**
     * Remove all the runtime overrides: the effective settings return to the
     * project settings. This is also what starts a new runtime session for a
     * project (overrides never leak into another project or another run).
     */
    clearRuntimeOverrides(): void {
      if (Object.keys(this._runtimeOverrides).length === 0) return;
      this._runtimeOverrides = {};
      this._isMemoryBudgetWarningLogged = false;
      this._recomputeEffectiveSettings();
      this._reapplyToTrackedTextures();
    }

    /**
     * Recalculate the effective settings from the project settings and the
     * runtime overrides (`Runtime Override ?? Project Setting ?? Manager
     * Default`).
     */
    private _recomputeEffectiveSettings(): void {
      this._settings = { ...this._projectSettings, ...this._runtimeOverrides };
    }

    /**
     * Identify the project loaded in the runtime. A project without a
     * `projectUuid` is identified as "unknown" (a project change can then not
     * be detected automatically: use `clearRuntimeOverrides` explicitly).
     */
    private static _getProjectKey(runtimeGame: gdjs.RuntimeGame): string {
      return runtimeGame._data.properties.projectUuid || '';
    }

    /**
     * Re-read the settings saved in the project and apply the effective
     * settings (project settings and runtime overrides) again to the
     * textures that are already loaded.
     *
     * This is called when the project data is replaced while the game is
     * running (see `gdjs.RuntimeGame.setProjectData`), which is what the
     * hot-reload of the editor does. The runtime overrides are preserved and
     * keep their priority: only the project settings are refreshed. Loading
     * a *different* project into the same runtime starts a new session for
     * it: its runtime overrides are cleared so that overrides never leak
     * from one project to another.
     *
     * This only deals with the settings: disposing the manager or restoring
     * resources are separate responsibilities (see `dispose` and the
     * resources managers).
     */
    reloadSettingsFromProject(runtimeGame: gdjs.RuntimeGame): void {
      if (this._isDisposed) return;
      const newProjectKey =
        gdjs.TextureQuality3DManager._getProjectKey(runtimeGame);
      if (newProjectKey !== this._projectKey) {
        this._projectKey = newProjectKey;
        this._runtimeOverrides = {};
      }
      this._projectSettings =
        gdjs.TextureQuality3DManager.loadSettingsFromProject(runtimeGame);
      this._isMemoryBudgetWarningLogged = false;
      this._recomputeEffectiveSettings();
      this._reapplyToTrackedTextures();
    }

    /**
     * Change the settings at runtime and apply them again to the textures
     * that are already loaded. Each given setting becomes a runtime
     * override: it keeps its value across the hot-reload of the project and
     * can be removed individually with `removeRuntimeOverride`. The preset is
     * marked as "custom" (unless explicitly given), as the settings no
     * longer exactly match a preset.
     */
    updateSettings(patch: Partial<TextureQuality3DSettings>): void {
      this._runtimeOverrides = {
        ...this._runtimeOverrides,
        ...patch,
        preset: patch.preset !== undefined ? patch.preset : 'custom',
      };
      this._isMemoryBudgetWarningLogged = false;
      this._recomputeEffectiveSettings();
      this._reapplyToTrackedTextures();
    }

    /**
     * Apply a preset (see `gdjs.textureQuality3dPresets`) and apply it again
     * to the textures that are already loaded. Return false if the preset
     * does not exist. A preset is a complete configuration: it replaces any
     * previous runtime override (and can itself be removed setting by
     * setting).
     */
    setPreset(presetName: string): boolean {
      const presetSettings = gdjs.textureQuality3dPresets[presetName];
      if (!presetSettings) {
        logger.warn('Unknown texture quality preset: "' + presetName + '".');
        return false;
      }
      this._runtimeOverrides = {
        ...presetSettings,
        preset: presetName as TextureQuality3DPreset,
      };
      this._isMemoryBudgetWarningLogged = false;
      this._recomputeEffectiveSettings();
      this._reapplyToTrackedTextures();
      return true;
    }

    /**
     * Detect the GPU capabilities from the Three.js renderer. Must be called
     * once the renderer is created.
     */
    initializeWithRenderer(renderer: THREE.WebGLRenderer): void {
      try {
        const gl = renderer.getContext() as WebGL2RenderingContext;
        const capabilities = renderer.capabilities;
        const supportedExtensions = gl.getSupportedExtensions() || [];
        const debugRendererInfo = gl.getExtension('WEBGL_debug_renderer_info');

        const supportedCompressedFormats: Array<string> = [];
        for (const extensionName in compressedFormatLabels) {
          if (supportedExtensions.indexOf(extensionName) !== -1) {
            supportedCompressedFormats.push(
              compressedFormatLabels[extensionName]
            );
          }
        }

        this._capabilities = {
          isWebGL2: !!capabilities.isWebGL2,
          maxTextureSize: capabilities.maxTextureSize,
          maxCubemapSize: capabilities.maxCubemapSize,
          max3DTextureSize: gl.getParameter(gl.MAX_3D_TEXTURE_SIZE) || 0,
          maxSamples: capabilities.maxSamples,
          precision: capabilities.precision,
          maxAnisotropy: capabilities.getMaxAnisotropy(),
          gpuName: debugRendererInfo
            ? String(gl.getParameter(debugRendererInfo.UNMASKED_RENDERER_WEBGL))
            : String(gl.getParameter(gl.RENDERER)),
          supportedCompressedFormats,
          supportsAnisotropicFiltering:
            supportedExtensions.indexOf('EXT_texture_filter_anisotropic') !==
            -1,
        };
      } catch (error) {
        logger.warn(
          'Unable to detect the GPU capabilities:',
          error as Error | undefined
        );
        return;
      }

      const capabilities = this._capabilities;
      logger.log(
        'GPU: ' +
          capabilities.gpuName +
          ' | max texture size: ' +
          capabilities.maxTextureSize +
          ' | max anisotropy: ' +
          (capabilities.maxAnisotropy || 'not supported') +
          ' | precision: ' +
          capabilities.precision +
          ' | compressed textures: ' +
          (capabilities.supportedCompressedFormats.length > 0
            ? capabilities.supportedCompressedFormats.join(', ')
            : 'none')
      );
      for (const warning of this._collectWarnings()) {
        logger.warn(warning);
      }
    }

    /**
     * Return the detected GPU capabilities, or null if they were not detected
     * (no 3D renderer, or detection failed).
     */
    getCapabilities(): TextureQuality3DGpuCapabilities | null {
      return this._capabilities;
    }

    /**
     * Return the maximum texture resolution that textures must respect,
     * taking both the settings and the hard limit of the GPU into account.
     * 0 means "no limit".
     *
     * Cube map faces are limited by `GL.MAX_CUBE_MAP_TEXTURE_SIZE`, which can
     * be smaller than `GL.MAX_TEXTURE_SIZE`: pass 'cubemap' as the kind for
     * them. Every other texture uses `GL.MAX_TEXTURE_SIZE`.
     */
    getMaxTextureResolution(kind?: TextureQuality3DTextureKind): integer {
      const capabilities = this._capabilities;
      const deviceMax = capabilities
        ? kind === 'cubemap'
          ? capabilities.maxCubemapSize
          : capabilities.maxTextureSize
        : 0;
      let maxResolution = this._settings.maxTextureResolution;
      if (deviceMax > 0 && (maxResolution === 0 || maxResolution > deviceMax)) {
        maxResolution = deviceMax;
      }
      return maxResolution;
    }

    /**
     * Apply the quality settings to a texture, resizing it if it is too big
     * for the settings or for the GPU, and track the GPU memory it uses.
     *
     * This is called by the image manager and the 3D model manager when a
     * texture is created.
     */
    applyToTexture(
      texture: THREE.Texture,
      options?: TextureQuality3DApplyOptions
    ): void {
      if (!texture) return;
      const applyOptions: TextureQuality3DApplyOptions = options || {};

      if (this._settings.enabled) {
        // The resolution cap is useful even for 3D models with respected
        // samplers: it reduces the GPU memory usage.
        this._fitTextureResolution(texture, applyOptions.kind);

        const canChangeSampler =
          !applyOptions.respectSamplerSettings ||
          this._settings.overrideModelSamplers;
        if (canChangeSampler) {
          this._applySamplerSettings(texture, !!applyOptions.keepNearestFilter);
        }
        this._applyAnisotropy(texture);
      }

      this._trackTexture(texture, applyOptions);
    }

    /**
     * Apply the quality settings to a texture that was already tracked
     * (used when the settings change at runtime).
     */
    private _reapplyToTrackedTextures(): void {
      for (const entry of this._trackedTextures.values()) {
        this.applyToTexture(entry.texture, {
          label: entry.label,
          kind: entry.kind,
          keepNearestFilter: entry.keepNearestFilter,
          respectSamplerSettings: entry.respectSamplerSettings,
        });
      }
      for (const warning of this._collectWarnings()) {
        logger.warn(warning);
      }
    }

    /**
     * Apply the filtering, mipmap and wrapping settings to a texture.
     */
    private _applySamplerSettings(
      texture: THREE.Texture,
      keepNearestFilter: boolean
    ): void {
      const settings = this._settings;
      let changed = false;

      if (keepNearestFilter) {
        // A resource with smoothing disabled always keeps hard pixels.
        if (texture.magFilter !== THREE.NearestFilter) {
          texture.magFilter = THREE.NearestFilter;
          changed = true;
        }
        if (texture.minFilter !== THREE.NearestFilter) {
          texture.minFilter = THREE.NearestFilter;
          changed = true;
        }
        if (texture.generateMipmaps) {
          texture.generateMipmaps = false;
          changed = true;
        }
      } else {
        switch (settings.filtering) {
          case 'nearest':
            if (texture.magFilter !== THREE.NearestFilter) {
              texture.magFilter = THREE.NearestFilter;
              changed = true;
            }
            if (texture.minFilter !== THREE.NearestFilter) {
              texture.minFilter = THREE.NearestFilter;
              changed = true;
            }
            break;
          case 'bilinear':
            if (texture.magFilter !== THREE.LinearFilter) {
              texture.magFilter = THREE.LinearFilter;
              changed = true;
            }
            if (texture.minFilter !== THREE.LinearFilter) {
              texture.minFilter = THREE.LinearFilter;
              changed = true;
            }
            break;
          case 'trilinear':
            if (texture.magFilter !== THREE.LinearFilter) {
              texture.magFilter = THREE.LinearFilter;
              changed = true;
            }
            if (texture.minFilter !== THREE.LinearMipmapLinearFilter) {
              texture.minFilter = THREE.LinearMipmapLinearFilter;
              changed = true;
            }
            break;
          case 'keep':
            break;
        }

        switch (settings.mipmapMode) {
          case 'forceOn':
            if (!texture.generateMipmaps) {
              texture.generateMipmaps = true;
              changed = true;
            }
            if (!filterRequiresMipmaps(texture.minFilter)) {
              // Keep hard pixels if the magnifying filter is `NearestFilter`.
              texture.minFilter =
                texture.magFilter === THREE.NearestFilter
                  ? THREE.NearestMipmapLinearFilter
                  : THREE.LinearMipmapLinearFilter;
              changed = true;
            }
            break;
          case 'forceOff':
            if (texture.generateMipmaps) {
              texture.generateMipmaps = false;
              changed = true;
            }
            if (filterRequiresMipmaps(texture.minFilter)) {
              texture.minFilter =
                texture.magFilter === THREE.NearestFilter
                  ? THREE.NearestFilter
                  : THREE.LinearFilter;
              changed = true;
            }
            break;
          case 'auto':
            // Make the generation of mipmaps consistent with the filters: a
            // texture with a mipmapped minifying filter *needs* its mipmaps,
            // and a texture without one does not need to pay for them.
            const shouldGenerateMipmaps = filterRequiresMipmaps(
              texture.minFilter
            );
            if (texture.generateMipmaps !== shouldGenerateMipmaps) {
              texture.generateMipmaps = shouldGenerateMipmaps;
              changed = true;
            }
            break;
        }
      }

      if (settings.forceClampWrapping) {
        if (texture.wrapS !== THREE.ClampToEdgeWrapping) {
          texture.wrapS = THREE.ClampToEdgeWrapping;
          changed = true;
        }
        if (texture.wrapT !== THREE.ClampToEdgeWrapping) {
          texture.wrapT = THREE.ClampToEdgeWrapping;
          changed = true;
        }
      }

      if (changed) {
        texture.needsUpdate = true;
      }
    }

    /**
     * Apply anisotropic filtering to a texture, clamped to the maximum level
     * supported by the GPU.
     */
    private _applyAnisotropy(texture: THREE.Texture): void {
      const settings = this._settings;
      const maxAnisotropy = this._capabilities
        ? this._capabilities.maxAnisotropy
        : 0;
      let newAnisotropy = 1;
      if (maxAnisotropy > 0) {
        const wantedAnisotropy =
          settings.anisotropy === 0 ? maxAnisotropy : settings.anisotropy;
        newAnisotropy = Math.max(1, Math.min(wantedAnisotropy, maxAnisotropy));
      }
      if (texture.anisotropy !== newAnisotropy) {
        texture.anisotropy = newAnisotropy;
        // Three.js only sends the sampler parameters (including the
        // anisotropy) to the GPU when the texture is (re)uploaded - which is
        // only triggered by `needsUpdate`. Set it only when the value really
        // changed, to avoid useless (and costly) texture re-uploads.
        texture.needsUpdate = true;
      }
    }

    /**
     * Downscale the image (or the 6 images of a cube texture) if it is bigger
     * than the maximum texture resolution, so that less GPU memory is used.
     */
    private _fitTextureResolution(
      texture: THREE.Texture,
      kind?: TextureQuality3DTextureKind
    ): boolean {
      const image: any = texture.image;
      if (!image) return false;

      // Cube map faces are limited by `GL.MAX_CUBE_MAP_TEXTURE_SIZE`, which
      // can be smaller than `GL.MAX_TEXTURE_SIZE`.
      const isCubeMap = kind === 'cubemap' || (!kind && Array.isArray(image));
      const maxResolution = this.getMaxTextureResolution(
        isCubeMap ? 'cubemap' : 'image'
      );
      if (maxResolution <= 0) return false;

      if (Array.isArray(image)) {
        // Cube texture: fit each face.
        let changed = false;
        const resizedImages = image.map((face: any) => {
          const resizedFace = this._fitImageResolution(face, maxResolution);
          if (resizedFace !== face) changed = true;
          return resizedFace;
        });
        if (changed) {
          texture.image = resizedImages;
          texture.needsUpdate = true;
        }
        return changed;
      }

      const resizedImage = this._fitImageResolution(image, maxResolution);
      if (resizedImage !== image) {
        texture.image = resizedImage;
        texture.needsUpdate = true;
        return true;
      }
      return false;
    }

    /**
     * Return an image downscaled to fit in `maxResolution` x `maxResolution`,
     * or the given image if it is small enough. The result is cached to avoid
     * doing the same work again for shared sources.
     */
    private _fitImageResolution(image: any, maxResolution: integer): any {
      if (!image || typeof image !== 'object') return image;
      const width = image.naturalWidth || image.width || 0;
      const height = image.naturalHeight || image.height || 0;
      if (width <= 0 || height <= 0) return image;
      if (width <= maxResolution && height <= maxResolution) return image;

      const cachedImage = this._resizedImages.get(image);
      if (cachedImage) return cachedImage;

      const scale = Math.min(maxResolution / width, maxResolution / height);
      const newWidth = Math.max(1, Math.round(width * scale));
      const newHeight = Math.max(1, Math.round(height * scale));

      let resizedImage = image;
      try {
        const canvas = document.createElement('canvas');
        canvas.width = newWidth;
        canvas.height = newHeight;
        const context = canvas.getContext('2d');
        if (!context) return image;
        context.imageSmoothingEnabled = true;
        context.imageSmoothingQuality = this._settings.resamplingQuality;
        context.drawImage(image, 0, 0, newWidth, newHeight);
        resizedImage = canvas;
      } catch (error) {
        logger.warn(
          'Unable to downscale a texture to ' +
            newWidth +
            'x' +
            newHeight +
            ':',
          error as Error | undefined
        );
        return image;
      }

      this._resizedImages.set(image, resizedImage);
      return resizedImage;
    }

    /**
     * Register a texture to track the GPU memory it uses, and keep the
     * information needed for the diagnostics. The registration is dropped
     * automatically when the texture is disposed.
     */
    private _trackTexture(
      texture: THREE.Texture,
      options: TextureQuality3DApplyOptions
    ): void {
      const textureId = texture.uuid;
      let entry = this._trackedTextures.get(textureId);

      const image: any = texture.image;
      const faces: Array<any> = Array.isArray(image) ? image : [image];
      let width = 0;
      let height = 0;
      for (const face of faces) {
        if (!face) continue;
        width = Math.max(width, face.naturalWidth || face.width || 0);
        height = Math.max(height, face.naturalHeight || face.height || 0);
      }
      // An estimation for uncompressed RGBA textures (mipmaps add a third).
      const memoryBytes = Math.round(
        faces.length *
          width *
          height *
          4 *
          (texture.generateMipmaps ? 4 / 3 : 1)
      );

      const sourceId = texture.source.uuid;
      let sourceEntry = this._trackedSources.get(sourceId);
      if (!sourceEntry) {
        sourceEntry = { memoryBytes: 0, textureIds: new Set() };
        this._trackedSources.set(sourceId, sourceEntry);
      }
      sourceEntry.textureIds.add(textureId);

      if (!entry) {
        entry = {
          texture,
          sourceId,
          label: options.label || 'texture',
          kind: options.kind || 'image',
          keepNearestFilter: !!options.keepNearestFilter,
          respectSamplerSettings: !!options.respectSamplerSettings,
          memoryBytes,
        };
        this._trackedTextures.set(textureId, entry);
        texture.addEventListener('dispose', () => {
          this._untrackTexture(textureId);
        });
      } else {
        entry.label = options.label || entry.label;
        entry.kind = options.kind || entry.kind;
        entry.keepNearestFilter = !!options.keepNearestFilter;
        entry.respectSamplerSettings = !!options.respectSamplerSettings;
        // The texture may have been resized (or restored) since it was
        // first tracked.
        entry.memoryBytes = memoryBytes;
      }
      this._updateSourceMemory(sourceId);

      const settings = this._settings;
      if (
        settings.memoryBudgetMb > 0 &&
        this._totalMemoryBytes > settings.memoryBudgetMb * 1024 * 1024 &&
        !this._isMemoryBudgetWarningLogged
      ) {
        this._isMemoryBudgetWarningLogged = true;
        logger.warn(
          'The textures are using about ' +
            gdjs.TextureQuality3DManager.formatMemory(this._totalMemoryBytes) +
            ' of GPU memory, which is more than the budget of ' +
            settings.memoryBudgetMb +
            ' MB. Consider lowering the maximum texture resolution or the level of anisotropy.'
        );
      }
    }

    /**
     * Recalculate the memory estimate of a (shared) source from the per-texture
     * estimates of its tracked textures, and adjust the total by the
     * difference. Counting each source once keeps the totals correct whatever
     * the number of textures sharing it, and repeated calls never accumulate
     * errors (the total always converges to the sum of the source estimates).
     */
    private _updateSourceMemory(sourceId: string): void {
      const sourceEntry = this._trackedSources.get(sourceId);
      if (!sourceEntry) return;
      let memoryBytes = 0;
      for (const textureId of sourceEntry.textureIds) {
        const entry = this._trackedTextures.get(textureId);
        // The biggest member estimate wins: the shared GPU allocation must
        // accommodate every tracked texture using it.
        if (entry && entry.memoryBytes > memoryBytes) {
          memoryBytes = entry.memoryBytes;
        }
      }
      this._totalMemoryBytes += memoryBytes - sourceEntry.memoryBytes;
      sourceEntry.memoryBytes = memoryBytes;
      if (this._totalMemoryBytes < 0) this._totalMemoryBytes = 0;
    }

    /**
     * Forget a texture that was disposed, and free its memory from the
     * accounting (once no tracked texture shares its source anymore).
     */
    private _untrackTexture(textureId: string): void {
      const entry = this._trackedTextures.get(textureId);
      if (!entry) return;
      this._trackedTextures.delete(textureId);

      const sourceEntry = this._trackedSources.get(entry.sourceId);
      if (!sourceEntry) return;
      sourceEntry.textureIds.delete(textureId);
      if (sourceEntry.textureIds.size === 0) {
        this._trackedSources.delete(entry.sourceId);
        this._totalMemoryBytes -= sourceEntry.memoryBytes;
        if (this._totalMemoryBytes < 0) this._totalMemoryBytes = 0;
      } else {
        // The source is still used by other textures, but its estimate can
        // shrink (for example when the disposed texture was the only one
        // generating mipmaps).
        this._updateSourceMemory(entry.sourceId);
      }
    }

    /**
     * Return the estimated GPU memory used by the tracked textures, in bytes.
     */
    getTextureMemoryBytes(): integer {
      return this._totalMemoryBytes;
    }

    /**
     * Return the number of tracked textures.
     */
    getTrackedTextureCount(): integer {
      return this._trackedTextures.size;
    }

    /**
     * Return the warnings about the settings and the detected capabilities.
     */
    getWarnings(): Array<string> {
      return this._collectWarnings();
    }

    private _collectWarnings(): Array<string> {
      const warnings: Array<string> = [];
      const settings = this._settings;
      const capabilities = this._capabilities;

      if (!settings.enabled) return warnings;

      if (
        settings.filtering === 'trilinear' &&
        settings.mipmapMode === 'forceOff'
      ) {
        warnings.push(
          'The "trilinear" filtering needs mipmaps but the mipmap mode is "force off": the textures will be sampled without mipmaps.'
        );
      }
      if (capabilities) {
        if (settings.anisotropy > 1 && capabilities.maxAnisotropy === 0) {
          warnings.push(
            'Anisotropic filtering is not supported by this GPU (' +
              capabilities.gpuName +
              '): it will have no effect.'
          );
        } else if (
          settings.anisotropy > 1 &&
          settings.anisotropy > capabilities.maxAnisotropy
        ) {
          warnings.push(
            'This GPU only supports an anisotropy up to ' +
              capabilities.maxAnisotropy +
              ': the value will be clamped.'
          );
        }
        if (
          settings.maxTextureResolution > 0 &&
          settings.maxTextureResolution > capabilities.maxTextureSize
        ) {
          warnings.push(
            'This GPU only supports textures up to ' +
              capabilities.maxTextureSize +
              'x' +
              capabilities.maxTextureSize +
              ': bigger textures will be downscaled.'
          );
        }
      }
      if (
        settings.memoryBudgetMb > 0 &&
        this._totalMemoryBytes > settings.memoryBudgetMb * 1024 * 1024
      ) {
        warnings.push(
          'The textures are using about ' +
            gdjs.TextureQuality3DManager.formatMemory(this._totalMemoryBytes) +
            ' of GPU memory, which is more than the budget of ' +
            settings.memoryBudgetMb +
            ' MB.'
        );
      }
      return warnings;
    }

    /**
     * Return a complete report about the settings, the GPU capabilities and
     * the tracked textures. Meant for diagnostics.
     */
    getReport(): TextureQuality3DReport {
      const textures: Array<TextureQuality3DTextureEntry> = [];
      if (this._settings.diagnostics) {
        // Attribute the memory of each source to exactly one entry (the
        // first tracked texture of the source), so that summing
        // `uniqueSourceMemoryBytes` over the entries gives
        // `textureMemoryBytes` even when textures share a source.
        const sourcesWithAttributedMemory = new Set<string>();
        for (const entry of this._trackedTextures.values()) {
          const image: any = entry.texture.image;
          const faces: Array<any> = Array.isArray(image) ? image : [image];
          let width = 0;
          let height = 0;
          for (const face of faces) {
            if (!face) continue;
            width = Math.max(width, face.naturalWidth || face.width || 0);
            height = Math.max(height, face.naturalHeight || face.height || 0);
          }
          const sourceEntry = this._trackedSources.get(entry.sourceId);
          const sourceMemoryBytes = sourceEntry ? sourceEntry.memoryBytes : 0;
          const isNewSource = !sourcesWithAttributedMemory.has(entry.sourceId);
          if (isNewSource) sourcesWithAttributedMemory.add(entry.sourceId);
          textures.push({
            id: entry.texture.uuid,
            sourceId: entry.sourceId,
            label: entry.label,
            kind: entry.kind,
            width,
            height,
            memoryBytes: entry.memoryBytes,
            uniqueSourceMemoryBytes: isNewSource ? sourceMemoryBytes : 0,
            sourceMemoryBytes,
            sharedSourceCount: sourceEntry ? sourceEntry.textureIds.size : 1,
            mipmaps: entry.texture.generateMipmaps,
            anisotropy: entry.texture.anisotropy,
            minFilter: entry.texture.minFilter,
            magFilter: entry.texture.magFilter,
          });
        }
        textures.sort((a, b) => b.memoryBytes - a.memoryBytes);
      }
      return {
        settings: this.getSettings(),
        capabilities: this._capabilities,
        textureCount: this._trackedTextures.size,
        textureMemoryBytes: this._totalMemoryBytes,
        textures,
        warnings: this._collectWarnings(),
      };
    }

    /**
     * Return a human readable version of an amount of bytes.
     */
    static formatMemory(bytes: integer): string {
      if (bytes >= 1024 * 1024) {
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
      }
      if (bytes >= 1024) {
        return (bytes / 1024).toFixed(1) + ' kB';
      }
      return bytes + ' bytes';
    }

    /**
     * To be called when the game is disposed: forget all the tracked textures.
     * The textures themselves are disposed by the image manager and the 3D
     * model manager.
     */
    dispose(): void {
      this._isDisposed = true;
      this._trackedTextures.clear();
      this._trackedSources.clear();
      this._totalMemoryBytes = 0;
    }
  }

  /**
   * Actions, conditions and expressions to control the advanced texture
   * quality of 3D textures while the game is running (used by the 3D
   * extension).
   *
   * @category 3D > Textures
   */
  export namespace textureQuality3d {
    const getManager = (
      runtimeScene: RuntimeScene
    ): gdjs.TextureQuality3DManager =>
      runtimeScene.getGame().getTextureQuality3DManager();

    /**
     * Apply a quality preset: "performance", "balanced", "quality", "ultra"
     * or "classic" (which disables the system).
     */
    export const setPreset = (
      runtimeScene: RuntimeScene,
      presetName: string
    ): void => {
      getManager(runtimeScene).setPreset(presetName);
    };

    /**
     * Enable or disable the system (when disabled, textures are left exactly
     * like they were loaded).
     */
    export const setEnabled = (
      runtimeScene: RuntimeScene,
      enabled: boolean
    ): void => {
      getManager(runtimeScene).updateSettings({ enabled });
    };

    /**
     * Set the level of anisotropic filtering (1 to 16, 0 for the maximum
     * supported by the GPU).
     */
    export const setAnisotropy = (
      runtimeScene: RuntimeScene,
      anisotropy: float
    ): void => {
      getManager(runtimeScene).updateSettings({
        anisotropy: Math.min(16, Math.max(0, Math.round(anisotropy))),
      });
    };

    /**
     * Set the maximum texture resolution (0 for no limit). Textures that are
     * already loaded are downscaled again if needed.
     */
    export const setMaxTextureResolution = (
      runtimeScene: RuntimeScene,
      maxResolution: float
    ): void => {
      getManager(runtimeScene).updateSettings({
        maxTextureResolution: Math.max(0, Math.round(maxResolution)),
      });
    };

    /**
     * Set one runtime override: the setting keeps its value across the
     * hot-reload of the project until it is removed.
     */
    export const setRuntimeOverride = (
      runtimeScene: RuntimeScene,
      settingName: string,
      value: TextureQuality3DSettings[SettingKey]
    ): void => {
      getManager(runtimeScene).setRuntimeOverride(
        settingName as SettingKey,
        value as any
      );
    };

    /**
     * Remove one runtime override: its effective value returns to the
     * project setting.
     */
    export const removeRuntimeOverride = (
      runtimeScene: RuntimeScene,
      settingName: string
    ): void => {
      getManager(runtimeScene).removeRuntimeOverride(settingName as SettingKey);
    };

    /**
     * Remove all the runtime overrides: the effective settings return to the
     * project settings.
     */
    export const clearRuntimeOverrides = (runtimeScene: RuntimeScene): void => {
      getManager(runtimeScene).clearRuntimeOverrides();
    };

    /**
     * Check if the advanced texture quality system is enabled.
     */
    export const isEnabled = (runtimeScene: RuntimeScene): boolean =>
      getManager(runtimeScene).getSettings().enabled;

    /**
     * The estimated GPU memory used by the tracked textures, in MB.
     */
    export const getTextureMemoryMb = (runtimeScene: RuntimeScene): float =>
      getManager(runtimeScene).getTextureMemoryBytes() / (1024 * 1024);

    /**
     * The number of tracked textures.
     */
    export const getTrackedTextureCount = (runtimeScene: RuntimeScene): float =>
      getManager(runtimeScene).getTrackedTextureCount();

    /**
     * The maximum level of anisotropic filtering supported by the GPU
     * (0 if not supported).
     */
    export const getMaxSupportedAnisotropy = (
      runtimeScene: RuntimeScene
    ): float => {
      const capabilities = getManager(runtimeScene).getCapabilities();
      return capabilities ? capabilities.maxAnisotropy : 0;
    };

    /**
     * The maximum texture size supported by the GPU.
     */
    export const getMaxSupportedTextureSize = (
      runtimeScene: RuntimeScene
    ): float => {
      const capabilities = getManager(runtimeScene).getCapabilities();
      return capabilities ? capabilities.maxTextureSize : 0;
    };
  }
}
