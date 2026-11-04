// @flow
/**
 * Helpers to read and write the PBR material configuration of 3D objects.
 *
 * The configuration is stored as a JSON string in the `pbrConfig` property of
 * the object (3D box or 3D model). It is read by the game engine (see
 * `GDJS/Runtime/PBRMaterialManager.ts`, which must be kept in sync with this
 * file).
 *
 * The shape of the configuration is:
 * {
 *   enabled?: boolean,
 *   material?: 'standard' | 'physical',
 *   settings?: PBRMaterialSettings,     // settings for the whole object
 *   targets?: { [targetName: string]: PBRMaterialSettings }, // per-mesh/face
 * }
 *
 * In `PBRMaterialSettings`, a property that is *absent* keeps the value of the
 * original material of the object (this is what allows to override only a few
 * properties of the materials of a 3D model). A texture slot explicitly set to
 * an empty string removes the texture.
 */

export type PBRMaterialTextures = {|
  baseColor?: string,
  metallicRoughness?: string,
  metallic?: string,
  roughness?: string,
  normal?: string,
  ao?: string,
  emissive?: string,
  height?: string,
  opacity?: string,
|};

export type PBRMaterialSettings = {|
  preset?: string,
  baseColor?: string,
  metallic?: number,
  roughness?: number,
  opacity?: number,
  emissiveColor?: string,
  emissiveIntensity?: number,
  normalScale?: number,
  aoIntensity?: number,
  displacementScale?: number,
  displacementBias?: number,
  envMapIntensity?: number,
  ior?: number,
  transmission?: number,
  clearcoat?: number,
  doubleSided?: boolean,
  alphaCutoff?: number,
  textures?: PBRMaterialTextures,
|};

export type PBRConfig = {|
  enabled?: boolean,
  material?: 'standard' | 'physical',
  settings?: PBRMaterialSettings,
  targets?: { [targetName: string]: PBRMaterialSettings },
|};

export const parsePBRConfig = (json: ?string): PBRConfig => {
  if (!json) return {};
  try {
    const parsed = JSON.parse(json);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch (error) {
    console.warn('Invalid PBR material configuration:', json);
    return {};
  }
};

export const serializePBRConfig = (config: PBRConfig): string =>
  JSON.stringify(config);

export const isPBRConfigEmpty = (json: ?string): boolean => {
  const config = parsePBRConfig(json);
  return config.enabled === false || (!config.settings && !config.targets);
};

/**
 * The names of the targets (faces of a 3D box).
 */
export const faceTargetNames = [
  'front',
  'back',
  'left',
  'right',
  'top',
  'bottom',
];

const getTargetSettings = (
  config: PBRConfig,
  targetName: string,
  createIfMissing: boolean
): PBRMaterialSettings | null => {
  if (!targetName) {
    if (!config.settings) {
      if (!createIfMissing) return null;
      config.settings = {};
    }
    return config.settings;
  }
  if (!config.targets) {
    if (!createIfMissing) return null;
    config.targets = {};
  }
  if (!config.targets[targetName]) {
    if (!createIfMissing) return null;
    config.targets[targetName] = {};
  }
  return config.targets[targetName];
};

/**
 * The value of a property for a target: the value of the target when it
 * overrides it, the value of the object otherwise.
 */
export const readFloatValue = (
  config: PBRConfig,
  targetName: string,
  key: string,
  defaultValue: number
): {| value: number, isOverridden: boolean |} => {
  const targetSettings = targetName
    ? getTargetSettings(config, targetName, false)
    : null;
  if (targetSettings && (targetSettings: any)[key] !== undefined) {
    return { value: (targetSettings: any)[key], isOverridden: true };
  }
  const settings = getTargetSettings(config, '', false);
  if (settings && (settings: any)[key] !== undefined) {
    return { value: (settings: any)[key], isOverridden: false };
  }
  return { value: defaultValue, isOverridden: false };
};

export const writeFloatValue = (
  config: PBRConfig,
  targetName: string,
  key: string,
  value: number
) => {
  const settings: any = getTargetSettings(config, targetName, true);
  if (settings) settings[key] = value;
};

export const readColorValue = (
  config: PBRConfig,
  targetName: string,
  key: string,
  defaultValue: string
): {| value: string, isOverridden: boolean |} => {
  const targetSettings = targetName
    ? getTargetSettings(config, targetName, false)
    : null;
  if (targetSettings && (targetSettings: any)[key] !== undefined) {
    return { value: (targetSettings: any)[key], isOverridden: true };
  }
  const settings = getTargetSettings(config, '', false);
  if (settings && (settings: any)[key] !== undefined) {
    return { value: (settings: any)[key], isOverridden: false };
  }
  return { value: defaultValue, isOverridden: false };
};

export const writeColorValue = (
  config: PBRConfig,
  targetName: string,
  key: string,
  value: string
) => {
  const settings: any = getTargetSettings(config, targetName, true);
  if (settings) settings[key] = value;
};

export const readBooleanValue = (
  config: PBRConfig,
  targetName: string,
  key: string,
  defaultValue: boolean
): {| value: boolean, isOverridden: boolean |} => {
  const targetSettings = targetName
    ? getTargetSettings(config, targetName, false)
    : null;
  if (targetSettings && (targetSettings: any)[key] !== undefined) {
    return { value: (targetSettings: any)[key], isOverridden: true };
  }
  const settings = getTargetSettings(config, '', false);
  if (settings && (settings: any)[key] !== undefined) {
    return { value: (settings: any)[key], isOverridden: false };
  }
  return { value: defaultValue, isOverridden: false };
};

export const writeBooleanValue = (
  config: PBRConfig,
  targetName: string,
  key: string,
  value: boolean
) => {
  const settings: any = getTargetSettings(config, targetName, true);
  if (settings) settings[key] = value;
};

export const readTextureValue = (
  config: PBRConfig,
  targetName: string,
  slot: string
): {| value: string, isOverridden: boolean |} => {
  const targetSettings = targetName
    ? getTargetSettings(config, targetName, false)
    : null;
  const targetTextures = targetSettings && targetSettings.textures;
  if (targetTextures && targetTextures[slot] !== undefined) {
    return { value: targetTextures[slot], isOverridden: true };
  }
  const settings = getTargetSettings(config, '', false);
  const textures = settings && settings.textures;
  if (textures && textures[slot] !== undefined) {
    return { value: textures[slot], isOverridden: false };
  }
  return { value: '', isOverridden: false };
};

export const writeTextureValue = (
  config: PBRConfig,
  targetName: string,
  slot: string,
  value: string
) => {
  const settings = getTargetSettings(config, targetName, true);
  if (!settings) return;
  if (!settings.textures) settings.textures = {};
  settings.textures[slot] = value;
};

/**
 * Remove the override of a property for a target (the value of the object
 * is then used).
 */
export const resetProperty = (
  config: PBRConfig,
  targetName: string,
  key: string
) => {
  const settings: any = getTargetSettings(config, targetName, false);
  if (!settings) return;
  if (key.startsWith('texture:') && settings.textures) {
    delete settings.textures[key.substring('texture:'.length)];
    return;
  }
  delete settings[key];
};

/**
 * The description of a numeric property of a PBR material.
 */
export type PBRFloatProperty = {|
  key: string,
  label: string,
  min: number,
  max: number,
  step: number,
  defaultValue: number,
  group: 'material' | 'detail' | 'transparency' | 'advanced',
  isPhysicalOnly?: boolean,
|};

export const floatProperties: Array<PBRFloatProperty> = [
  {
    key: 'metallic',
    label: 'Metallic',
    min: 0,
    max: 1,
    step: 0.01,
    defaultValue: 0,
    group: 'material',
  },
  {
    key: 'roughness',
    label: 'Roughness',
    min: 0,
    max: 1,
    step: 0.01,
    defaultValue: 0.5,
    group: 'material',
  },
  {
    key: 'opacity',
    label: 'Opacity',
    min: 0,
    max: 1,
    step: 0.01,
    defaultValue: 1,
    group: 'transparency',
  },
  {
    key: 'emissiveIntensity',
    label: 'Emissive intensity',
    min: 0,
    max: 10,
    step: 0.1,
    defaultValue: 1,
    group: 'detail',
  },
  {
    key: 'normalScale',
    label: 'Normal map strength',
    min: -2,
    max: 2,
    step: 0.01,
    defaultValue: 1,
    group: 'detail',
  },
  {
    key: 'aoIntensity',
    label: 'Ambient occlusion strength',
    min: 0,
    max: 2,
    step: 0.01,
    defaultValue: 1,
    group: 'detail',
  },
  {
    key: 'envMapIntensity',
    label: 'Environment lighting strength',
    min: 0,
    max: 4,
    step: 0.01,
    defaultValue: 1,
    group: 'detail',
  },
  {
    key: 'transmission',
    label: 'Transmission (glass)',
    min: 0,
    max: 1,
    step: 0.01,
    defaultValue: 0,
    group: 'transparency',
    isPhysicalOnly: true,
  },
  {
    key: 'ior',
    label: 'Index of refraction',
    min: 1,
    max: 2.5,
    step: 0.01,
    defaultValue: 1.5,
    group: 'transparency',
    isPhysicalOnly: true,
  },
  {
    key: 'clearcoat',
    label: 'Clear coat',
    min: 0,
    max: 1,
    step: 0.01,
    defaultValue: 0,
    group: 'transparency',
    isPhysicalOnly: true,
  },
  {
    key: 'alphaCutoff',
    label: 'Alpha cutoff',
    min: 0,
    max: 1,
    step: 0.01,
    defaultValue: 0,
    group: 'transparency',
  },
  {
    key: 'displacementScale',
    label: 'Displacement strength',
    min: -2,
    max: 2,
    step: 0.01,
    defaultValue: 1,
    group: 'advanced',
  },
  {
    key: 'displacementBias',
    label: 'Displacement offset',
    min: -1,
    max: 1,
    step: 0.01,
    defaultValue: 0,
    group: 'advanced',
  },
];

export const colorProperties = [
  { key: 'baseColor', label: 'Base color', defaultValue: '255;255;255' },
  { key: 'emissiveColor', label: 'Emissive color', defaultValue: '0;0;0' },
];

export const textureSlots = [
  { key: 'baseColor', label: 'Base color (albedo)' },
  { key: 'metallicRoughness', label: 'Metallic & roughness (packed)' },
  { key: 'metallic', label: 'Metallic' },
  { key: 'roughness', label: 'Roughness' },
  { key: 'normal', label: 'Normal' },
  { key: 'ao', label: 'Ambient occlusion' },
  { key: 'emissive', label: 'Emissive' },
  { key: 'height', label: 'Height (displacement)' },
  { key: 'opacity', label: 'Opacity' },
];

/**
 * The material presets shown in the editor (kept in sync with
 * `gdjs.pbrPresets` in the game engine).
 */
export const pbrPresets: { [name: string]: PBRMaterialSettings } = {
  metal: {
    preset: 'metal',
    baseColor: '200;200;200',
    metallic: 1,
    roughness: 0.35,
  },
  gold: {
    preset: 'gold',
    baseColor: '255;212;96',
    metallic: 1,
    roughness: 0.25,
  },
  glass: {
    preset: 'glass',
    baseColor: '230;240;250',
    metallic: 0,
    roughness: 0.05,
    transmission: 0.9,
    ior: 1.5,
    doubleSided: true,
  },
  wood: {
    preset: 'wood',
    baseColor: '150;108;74',
    metallic: 0,
    roughness: 0.75,
  },
  plastic: {
    preset: 'plastic',
    baseColor: '216;216;222',
    metallic: 0,
    roughness: 0.4,
    clearcoat: 0.3,
  },
  stone: {
    preset: 'stone',
    baseColor: '136;132;124',
    metallic: 0,
    roughness: 0.85,
  },
  fabric: {
    preset: 'fabric',
    baseColor: '180;180;180',
    metallic: 0,
    roughness: 0.95,
  },
  rubber: {
    preset: 'rubber',
    baseColor: '40;40;40',
    metallic: 0,
    roughness: 0.9,
  },
};

export const presetNames = ['custom', ...Object.keys(pbrPresets)];

/**
 * Apply a preset to a target: the values of the preset become the values of
 * the target (or of the object when the target is empty).
 */
export const applyPreset = (
  config: PBRConfig,
  targetName: string,
  presetName: string
) => {
  const settings = getTargetSettings(config, targetName, true);
  if (!settings) return;
  const preset = pbrPresets[presetName];
  const mutableSettings: any = settings;
  if (preset) {
    for (const key of Object.keys(preset)) {
      mutableSettings[key] = (preset: any)[key];
    }
  }
  settings.preset = presetName;
};

/**
 * The settings shown by the editor for a target: the settings of the object
 * merged with the settings of the target, with default values for the
 * properties that are not set (so that the editor and the preview always show
 * a value).
 */
export const getMergedSettingsWithDefaults = (
  config: PBRConfig,
  targetName: string
): PBRMaterialSettings => {
  const settings = getTargetSettings(config, '', false) || {};
  const targetSettings = getTargetSettings(config, targetName, false) || {};
  const merged: PBRMaterialSettings = {
    preset: 'custom',
    baseColor: '255;255;255',
    emissiveColor: '0;0;0',
    ...settings,
    ...targetSettings,
    textures: {
      ...(settings.textures || {}),
      ...(targetSettings.textures || {}),
    },
  };
  const mutableMerged: any = merged;
  for (const property of floatProperties) {
    if (mutableMerged[property.key] === undefined) {
      mutableMerged[property.key] = property.defaultValue;
    }
  }
  return merged;
};
