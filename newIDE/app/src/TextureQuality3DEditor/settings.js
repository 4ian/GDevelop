// @flow
/**
 * The settings of the "Advanced Texture Quality 3D" system, saved in the
 * project as extension properties and restored by the game engine (see
 * `GDJS/Runtime/TextureQuality3DManager.ts`, which must be kept in sync
 * with this file).
 */

export type TextureQuality3DPreset =
  | 'classic'
  | 'performance'
  | 'balanced'
  | 'quality'
  | 'ultra'
  | 'custom';

export type TextureQuality3DFiltering =
  | 'keep'
  | 'nearest'
  | 'bilinear'
  | 'trilinear';

export type TextureQuality3DMipmapMode = 'auto' | 'forceOn' | 'forceOff';

export type TextureQuality3DResamplingQuality = 'high' | 'low';

export type TextureQuality3DSettings = {|
  enabled: boolean,
  preset: TextureQuality3DPreset,
  filtering: TextureQuality3DFiltering,
  mipmapMode: TextureQuality3DMipmapMode,
  /**
   * The level of anisotropic filtering, from 1 (disabled) to 16.
   * 0 means "use the maximum supported by the GPU".
   */
  anisotropy: number,
  /**
   * Textures bigger than this (on their biggest side) are downscaled before
   * being uploaded to the GPU. 0 means "no limit".
   */
  maxTextureResolution: number,
  resamplingQuality: TextureQuality3DResamplingQuality,
  forceClampWrapping: boolean,
  overrideModelSamplers: boolean,
  /** A warning is logged when the textures use more than this (in MB). */
  memoryBudgetMb: number,
  diagnostics: boolean,
|};

export type GpuCapabilities = {|
  isWebGL2: boolean,
  maxTextureSize: number,
  maxCubemapSize: number,
  max3DTextureSize: number,
  maxSamples: number,
  precision: string,
  maxAnisotropy: number,
  gpuName: string,
  supportedCompressedFormats: Array<string>,
  supportsAnisotropicFiltering: boolean,
|};

/**
 * The "extension properties" namespace used to save the settings in the
 * project (and so in the exported game).
 */
export const textureQuality3dPropertiesNamespace = 'AdvancedTextureQuality3D';

const makeDefaultSettings = (): TextureQuality3DSettings => ({
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
});

export const defaultSettings: TextureQuality3DSettings = makeDefaultSettings();

/**
 * The presets offered in the editor. They must be kept in sync with
 * `gdjs.textureQuality3dPresets` in `GDJS/Runtime/TextureQuality3DManager.ts`.
 */
export const presets: { [presetName: string]: TextureQuality3DSettings } = {
  classic: makeDefaultSettings(),
  performance: {
    ...makeDefaultSettings(),
    enabled: true,
    preset: 'performance',
    anisotropy: 1,
    maxTextureResolution: 1024,
    resamplingQuality: 'low',
    memoryBudgetMb: 256,
  },
  balanced: {
    ...makeDefaultSettings(),
    enabled: true,
    preset: 'balanced',
    filtering: 'trilinear',
    mipmapMode: 'forceOn',
    anisotropy: 4,
    maxTextureResolution: 2048,
    memoryBudgetMb: 512,
  },
  quality: {
    ...makeDefaultSettings(),
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
    ...makeDefaultSettings(),
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

/**
 * Read the settings saved in the project. Missing values fall back to the
 * `classic` preset (the system disabled), so that projects made before this
 * system behave exactly like before.
 */
export const loadSettings = (project: gdProject): TextureQuality3DSettings => {
  const extensionProperties = project.getExtensionProperties();
  const settings = makeDefaultSettings();
  const readValue = (key: string): string =>
    extensionProperties.getValue(textureQuality3dPropertiesNamespace, key);

  const enabled = readValue('enabled');
  if (enabled) settings.enabled = enabled === 'true';
  const preset = readValue('preset');
  if (preset) settings.preset = (preset: any);
  const filtering = readValue('filtering');
  if (filtering) settings.filtering = (filtering: any);
  const mipmapMode = readValue('mipmapMode');
  if (mipmapMode) settings.mipmapMode = (mipmapMode: any);
  const anisotropy = readValue('anisotropy');
  if (anisotropy)
    settings.anisotropy = Math.min(16, parseInt(anisotropy, 10) || 0);
  const maxTextureResolution = readValue('maxTextureResolution');
  if (maxTextureResolution)
    settings.maxTextureResolution = parseInt(maxTextureResolution, 10) || 0;
  const resamplingQuality = readValue('resamplingQuality');
  if (resamplingQuality) settings.resamplingQuality = (resamplingQuality: any);
  const forceClampWrapping = readValue('forceClampWrapping');
  if (forceClampWrapping)
    settings.forceClampWrapping = forceClampWrapping === 'true';
  const overrideModelSamplers = readValue('overrideModelSamplers');
  if (overrideModelSamplers)
    settings.overrideModelSamplers = overrideModelSamplers === 'true';
  const memoryBudgetMb = readValue('memoryBudgetMb');
  if (memoryBudgetMb)
    settings.memoryBudgetMb = parseInt(memoryBudgetMb, 10) || 0;
  const diagnostics = readValue('diagnostics');
  if (diagnostics) settings.diagnostics = diagnostics === 'true';
  return settings;
};

/**
 * Save the settings in the project, so that they are used by the exported
 * game (and restored the next time the project is opened).
 */
export const saveSettings = (
  project: gdProject,
  settings: TextureQuality3DSettings
) => {
  const extensionProperties = project.getExtensionProperties();
  const namespace = textureQuality3dPropertiesNamespace;
  extensionProperties.setValue(
    namespace,
    'enabled',
    settings.enabled ? 'true' : 'false'
  );
  extensionProperties.setValue(namespace, 'preset', settings.preset);
  extensionProperties.setValue(namespace, 'filtering', settings.filtering);
  extensionProperties.setValue(namespace, 'mipmapMode', settings.mipmapMode);
  extensionProperties.setValue(
    namespace,
    'anisotropy',
    '' + settings.anisotropy
  );
  extensionProperties.setValue(
    namespace,
    'maxTextureResolution',
    '' + settings.maxTextureResolution
  );
  extensionProperties.setValue(
    namespace,
    'resamplingQuality',
    settings.resamplingQuality
  );
  extensionProperties.setValue(
    namespace,
    'forceClampWrapping',
    settings.forceClampWrapping ? 'true' : 'false'
  );
  extensionProperties.setValue(
    namespace,
    'overrideModelSamplers',
    settings.overrideModelSamplers ? 'true' : 'false'
  );
  extensionProperties.setValue(
    namespace,
    'memoryBudgetMb',
    '' + settings.memoryBudgetMb
  );
  extensionProperties.setValue(
    namespace,
    'diagnostics',
    settings.diagnostics ? 'true' : 'false'
  );
};

/**
 * Return the warnings about the settings compared to the detected GPU
 * capabilities (the same checks are done by the game engine at startup).
 */
export const getSettingsWarnings = (
  settings: TextureQuality3DSettings,
  capabilities: ?GpuCapabilities
): Array<string> => {
  const warnings = [];
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
        'Anisotropic filtering is not supported by this GPU: it will have no effect.'
      );
    } else if (
      settings.anisotropy > 1 &&
      settings.anisotropy > capabilities.maxAnisotropy
    ) {
      warnings.push(
        'This GPU only supports an anisotropy up to ' +
          capabilities.maxAnisotropy +
          ': the value will be clamped at runtime.'
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
          ': bigger textures will be downscaled at runtime.'
      );
    }
    if (capabilities.maxTextureSize < 2048) {
      warnings.push(
        'This GPU has a low maximum texture size (' +
          capabilities.maxTextureSize +
          '): use the "performance" or "balanced" preset to avoid problems on similar devices.'
      );
    }
  }
  return warnings;
};
