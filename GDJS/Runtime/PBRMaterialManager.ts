/*
 * GDevelop JS Platform
 * Copyright 2013-present Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
namespace gdjs {
  const logger = new gdjs.Logger('PBR Material Manager');

  /**
   * The names of the material presets that can be applied to a PBR material.
   *
   * @category 3D > Materials
   */
  export type PBRPresetName =
    | 'metal'
    | 'gold'
    | 'glass'
    | 'wood'
    | 'plastic'
    | 'stone'
    | 'fabric'
    | 'rubber'
    | 'custom';

  /**
   * The names of the texture slots of a PBR material.
   *
   * - `baseColor` is the albedo (diffuse) texture.
   * - `metallicRoughness` is a packed texture (as in glTF: the green channel
   *   holds the roughness and the blue channel the metallic factor) that fills
   *   both the `metallic` and `roughness` slots at once.
   * - `height` is used as a displacement map (the displacement is only visible
   *   on tessellated geometries).
   *
   * @category 3D > Materials
   */
  export type PBRTextureSlotName =
    | 'baseColor'
    | 'metallicRoughness'
    | 'metallic'
    | 'roughness'
    | 'normal'
    | 'ao'
    | 'emissive'
    | 'height'
    | 'opacity';

  /**
   * The names of the numeric properties of a PBR material.
   *
   * @category 3D > Materials
   */
  export type PBRFloatPropertyName =
    | 'metallic'
    | 'roughness'
    | 'opacity'
    | 'emissiveIntensity'
    | 'normalScale'
    | 'aoIntensity'
    | 'displacementScale'
    | 'displacementBias'
    | 'envMapIntensity'
    | 'ior'
    | 'transmission'
    | 'clearcoat'
    | 'clearcoatRoughness'
    | 'alphaCutoff';

  /**
   * The names of the boolean properties of a PBR material.
   *
   * @category 3D > Materials
   */
  export type PBRBooleanPropertyName = 'normalFlipY';

  /**
   * The names of the color properties of a PBR material. Colors are stored
   * as GDevelop color strings ("R;G;B" with components between 0 and 255).
   *
   * @category 3D > Materials
   */
  export type PBRColorPropertyName = 'baseColor' | 'emissiveColor';

  /**
   * The texture slots of a PBR material.
   *
   * A slot that is *absent* keeps the texture of the original material (this
   * is what makes "material overrides" possible on 3D models without losing
   * the textures of the glTF file). A slot explicitly set to an empty string
   * removes the texture.
   *
   * @category 3D > Materials
   */
  export interface PBRMaterialTextures {
    baseColor?: string;
    metallicRoughness?: string;
    metallic?: string;
    roughness?: string;
    normal?: string;
    ao?: string;
    emissive?: string;
    height?: string;
    opacity?: string;
  }

  /**
   * A UV transform applied to a texture: tiling (repeat), offset and rotation.
   * A field that is not set keeps its default (repeat 1, offset 0, rotation 0).
   *
   * @category 3D > Materials
   */
  export interface PBRUvTransform {
    /** Tiling on the U axis (1 by default). */
    repeatX?: number;
    /** Tiling on the V axis (1 by default). */
    repeatY?: number;
    /** Offset on the U axis (0 by default). */
    offsetX?: number;
    /** Offset on the V axis (0 by default). */
    offsetY?: number;
    /**
     * Rotation in degrees, around the center (0.5; 0.5) of the texture (0 by
     * default).
     */
    rotation?: number;
  }

  /**
   * The settings applied to a PBR material. Every field is optional: a field
   * that is not set keeps the value of the original material of the object
   * (or the value chosen by a preset).
   *
   * @category 3D > Materials
   */
  export interface PBRMaterialSettings {
    /** The preset these settings were derived from (informative). */
    preset?: PBRPresetName;
    /** Albedo color, as a "R;G;B" string. */
    baseColor?: string;
    /** Metallic factor, between 0 and 1. */
    metallic?: number;
    /** Roughness factor, between 0 (smooth) and 1 (rough). */
    roughness?: number;
    /** Opacity factor, between 0 (invisible) and 1 (opaque). */
    opacity?: number;
    /** Emissive color, as a "R;G;B" string. */
    emissiveColor?: string;
    /** Multiplier applied to the emissive color and texture. */
    emissiveIntensity?: number;
    /** Strength of the normal map (1 by default). */
    normalScale?: number;
    /** Strength of the ambient occlusion map (1 by default). */
    aoIntensity?: number;
    /** Strength of the displacement (height) map (1 by default). */
    displacementScale?: number;
    /** Offset applied to the displacement (height) map. */
    displacementBias?: number;
    /** Strength of the lighting of the environment map (IBL). */
    envMapIntensity?: number;
    /** Index of refraction (for glasses and other transparent materials). */
    ior?: number;
    /** How much light is transmitted through the material (0 to 1). */
    transmission?: number;
    /** Strength of the clear coat layer (0 to 1). */
    clearcoat?: number;
    /** Roughness of the clear coat layer (0 by default). */
    clearcoatRoughness?: number;
    /**
     * When true, the green channel of the normal map is flipped (DirectX /
     * Unreal convention). `false` by default: glTF and OpenGL-style normal
     * maps need no flip.
     */
    normalFlipY?: boolean;
    /** When true, the material is rendered on both faces. */
    doubleSided?: boolean;
    /** When above 0, the alpha cutoff used to discard transparent pixels. */
    alphaCutoff?: number;
    /**
     * UV transform applied to every texture slot. It is only applied to the
     * slots the settings actually set (a slot left untouched keeps the texture
     * of the original material, which is never cloned).
     */
    uvTransform?: PBRUvTransform;
    /** UV transforms overriding `uvTransform` for specific slots. */
    slotUvTransforms?: {
      [slot in PBRTextureSlotName]?: PBRUvTransform;
    };
    /** The texture slots. */
    textures?: PBRMaterialTextures;
  }

  /**
   * The PBR configuration saved in the properties of an object.
   *
   * @category 3D > Materials
   */
  export interface PBRConfig {
    /** `false` when PBR is disabled (the object keeps its classic materials). */
    enabled?: boolean;
    /**
     * `physical` enables the advanced physical properties (transmission, ior,
     * clearcoat) at the cost of a more expensive shader.
     */
    material?: 'standard' | 'physical';
    /** The settings applied to the whole object. */
    settings?: PBRMaterialSettings;
    /**
     * The settings overriding `settings` for one target of the object: a mesh
     * of a 3D model (named after the mesh) or a face of a 3D box (named
     * `front`, `back`, `left`, `right`, `top` or `bottom`).
     */
    targets?: { [targetName: string]: PBRMaterialSettings };
  }

  /**
   * The presets offered by the PBR material editor. Their values are merged
   * *before* the settings of the object, so that the object can override any
   * of them.
   *
   * @category 3D > Materials
   */
  export const pbrPresets: {
    readonly [name in PBRPresetName]?: PBRMaterialSettings;
  } = {
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
      // A starting value for the clear coat roughness: it is tunable, just
      // like the other preset values.
      clearcoatRoughness: 0.15,
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
    custom: {
      preset: 'custom',
    },
  };

  /**
   * The names of the available presets.
   *
   * @category 3D > Materials
   */
  export const pbrPresetNames: string[] = Object.keys(pbrPresets);

  /**
   * Parse the JSON of a PBR configuration. Invalid JSON is ignored (a warning
   * is logged) so that projects with older or hand-edited data keep working.
   *
   * @category 3D > Materials
   */
  export const parsePBRConfig = (
    json: string | undefined | null
  ): PBRConfig | null => {
    if (!json) return null;
    try {
      const parsed = JSON.parse(json);
      return parsed && typeof parsed === 'object' ? parsed : null;
    } catch (error) {
      logger.warn('Invalid PBR material configuration: ' + json, error);
      return null;
    }
  };

  /**
   * Check that a string is the name of a texture slot.
   *
   * @category 3D > Materials
   */
  export const isPBRTextureSlot = (slot: string): slot is PBRTextureSlotName =>
    slot === 'baseColor' ||
    slot === 'metallicRoughness' ||
    slot === 'metallic' ||
    slot === 'roughness' ||
    slot === 'normal' ||
    slot === 'ao' ||
    slot === 'emissive' ||
    slot === 'height' ||
    slot === 'opacity';

  /**
   * Check that a string is the name of a color property.
   *
   * @category 3D > Materials
   */
  export const isPBRColorProperty = (
    property: string
  ): property is PBRColorPropertyName =>
    property === 'baseColor' || property === 'emissiveColor';

  /**
   * Check that a string is the name of a numeric property.
   *
   * @category 3D > Materials
   */
  export const isPBRFloatProperty = (
    property: string
  ): property is PBRFloatPropertyName =>
    property === 'metallic' ||
    property === 'roughness' ||
    property === 'opacity' ||
    property === 'emissiveIntensity' ||
    property === 'normalScale' ||
    property === 'aoIntensity' ||
    property === 'displacementScale' ||
    property === 'displacementBias' ||
    property === 'envMapIntensity' ||
    property === 'ior' ||
    property === 'transmission' ||
    property === 'clearcoat' ||
    property === 'clearcoatRoughness' ||
    property === 'alphaCutoff';

  /**
   * Check that a string is the name of a boolean property.
   *
   * @category 3D > Materials
   */
  export const isPBRBooleanProperty = (
    property: string
  ): property is PBRBooleanPropertyName => property === 'normalFlipY';

  /**
   * The names of the numeric properties of a UV transform (`PBRUvTransform`).
   *
   * @category 3D > Materials
   */
  export type PBRUvTransformPropertyName =
    | 'repeatX'
    | 'repeatY'
    | 'offsetX'
    | 'offsetY'
    | 'rotation';

  /**
   * Check that a string is the name of a UV transform property.
   *
   * @category 3D > Materials
   */
  export const isPBRUvTransformProperty = (
    property: string
  ): property is PBRUvTransformPropertyName =>
    property === 'repeatX' ||
    property === 'repeatY' ||
    property === 'offsetX' ||
    property === 'offsetY' ||
    property === 'rotation';

  /**
   * Convert a GDevelop color string ("R;G;B") to a THREE.js color.
   *
   * @category 3D > Materials
   */
  export const pbrColorStringToThreeColor = (
    rgbString: string,
    color: THREE.Color
  ): THREE.Color => {
    const components = gdjs.rgbOrHexToRGBColor(rgbString);
    return color.setRGB(
      components[0] / 255,
      components[1] / 255,
      components[2] / 255,
      THREE.SRGBColorSpace
    );
  };

  /**
   * Convert a THREE.js color to a GDevelop color string ("R;G;B").
   *
   * @category 3D > Materials
   */
  export const threeColorToPBRColorString = (color: THREE.Color): string => {
    const srgbColor = color.clone().convertLinearToSRGB();
    return (
      Math.round(srgbColor.r * 255) +
      ';' +
      Math.round(srgbColor.g * 255) +
      ';' +
      Math.round(srgbColor.b * 255)
    );
  };

  /**
   * Merge PBR settings: `settings` overrides `base`. The texture slots are
   * merged key by key (a key absent from `settings` keeps the one from `base`).
   *
   * @category 3D > Materials
   */
  export const mergePBRSettings = (
    base: PBRMaterialSettings | undefined,
    settings: PBRMaterialSettings | undefined
  ): PBRMaterialSettings => {
    const merged: PBRMaterialSettings = { ...base, ...settings };
    if (base && base.textures && settings && settings.textures) {
      merged.textures = { ...base.textures, ...settings.textures };
    }
    if (base && base.uvTransform && settings && settings.uvTransform) {
      merged.uvTransform = { ...base.uvTransform, ...settings.uvTransform };
    }
    if (
      base &&
      base.slotUvTransforms &&
      settings &&
      settings.slotUvTransforms
    ) {
      merged.slotUvTransforms = {
        ...base.slotUvTransforms,
        ...settings.slotUvTransforms,
      };
    }
    return merged;
  };

  /**
   * `true` when a UV transform is the identity: the shared texture of the
   * image manager can then be used directly (no clone).
   */
  const isDefaultUvTransform = (
    transform: PBRUvTransform | undefined
  ): boolean =>
    !transform ||
    ((transform.repeatX === undefined || transform.repeatX === 1) &&
      (transform.repeatY === undefined || transform.repeatY === 1) &&
      (transform.offsetX === undefined || transform.offsetX === 0) &&
      (transform.offsetY === undefined || transform.offsetY === 0) &&
      (transform.rotation === undefined || transform.rotation === 0));

  /**
   * Merge the global UV transform of the settings with the one of a slot (the
   * per-slot transform wins).
   */
  const getSlotUvTransform = (
    settings: PBRMaterialSettings,
    slot: PBRTextureSlotName
  ): PBRUvTransform | undefined => {
    const globalTransform = settings.uvTransform;
    const slotTransform = settings.slotUvTransforms
      ? settings.slotUvTransforms[slot]
      : undefined;
    if (!globalTransform && !slotTransform) return undefined;
    return { ...globalTransform, ...slotTransform };
  };

  /**
   * Build the cache key of a transformed texture (resource, color space and
   * normalized transform values).
   */
  const getUvTransformCacheKey = (
    resourceName: string,
    isColorData: boolean,
    transform: PBRUvTransform
  ): string =>
    [
      resourceName,
      isColorData ? 'color' : 'linear',
      transform.repeatX === undefined ? 1 : transform.repeatX,
      transform.repeatY === undefined ? 1 : transform.repeatY,
      transform.offsetX === undefined ? 0 : transform.offsetX,
      transform.offsetY === undefined ? 0 : transform.offsetY,
      transform.rotation === undefined ? 0 : transform.rotation,
    ].join('|');

  /**
   * The value of a numeric property in merged settings (or `null` when the
   * property is not set).
   */
  const getPBRFloatValue = (
    settings: PBRMaterialSettings | undefined,
    property: string
  ): float | null => {
    if (!settings) return null;
    switch (property) {
      case 'metallic':
      case 'roughness':
      case 'opacity':
      case 'emissiveIntensity':
      case 'normalScale':
      case 'aoIntensity':
      case 'displacementScale':
      case 'displacementBias':
      case 'envMapIntensity':
      case 'ior':
      case 'transmission':
      case 'clearcoat':
      case 'clearcoatRoughness':
      case 'alphaCutoff': {
        const value = settings[property];
        return value === undefined ? null : value;
      }
      default:
        return null;
    }
  };

  /**
   * Read and write the settings of a PBR configuration, either for the whole
   * object (`targetName` is then an empty string) or for one of its targets
   * (a mesh of a 3D model or a face of a 3D box).
   *
   * @category 3D > Materials
   */
  export namespace pbrconfig {
    /**
     * Return the settings applied to a target: the settings of the object
     * overridden by the settings of the target.
     */
    export const getSettingsForTarget = (
      config: PBRConfig | null,
      targetName: string
    ): PBRMaterialSettings => {
      if (!config) return {};
      return mergePBRSettings(
        config.settings,
        targetName ? (config.targets || {})[targetName] : undefined
      );
    };

    const getOrCreateTargetSettings = (
      config: PBRConfig,
      targetName: string
    ): PBRMaterialSettings => {
      if (!targetName) {
        if (!config.settings) config.settings = {};
        return config.settings;
      }
      if (!config.targets) config.targets = {};
      if (!config.targets[targetName]) config.targets[targetName] = {};
      return config.targets[targetName];
    };

    /** Change a numeric property in the configuration. */
    export const setFloatValue = (
      config: PBRConfig,
      targetName: string,
      property: PBRFloatPropertyName,
      value: float
    ) => {
      getOrCreateTargetSettings(config, targetName)[property] = value;
    };

    /** Change a color property in the configuration. */
    export const setColorValue = (
      config: PBRConfig,
      targetName: string,
      property: PBRColorPropertyName,
      color: string
    ) => {
      getOrCreateTargetSettings(config, targetName)[property] = color;
    };

    /** Change a texture slot in the configuration (`null` removes it). */
    export const setTextureSlot = (
      config: PBRConfig,
      targetName: string,
      slot: PBRTextureSlotName,
      resourceName: string | null
    ) => {
      const settings = getOrCreateTargetSettings(config, targetName);
      if (!settings.textures) settings.textures = {};
      if (resourceName === null) {
        delete settings.textures[slot];
      } else {
        settings.textures[slot] = resourceName;
      }
    };

    /** Change the preset in the configuration (and apply its values). */
    export const applyPreset = (
      config: PBRConfig,
      targetName: string,
      presetName: PBRPresetName
    ) => {
      const preset = pbrPresets[presetName];
      const settings = getOrCreateTargetSettings(config, targetName);
      if (preset) {
        for (const key of Object.keys(preset) as Array<
          keyof PBRMaterialSettings
        >) {
          (settings as any)[key] = (preset as any)[key];
        }
      }
      settings.preset = presetName;
    };

    /**
     * Read a numeric property in the configuration (or `null` when the
     * property is not set).
     */
    export const getFloatValue = (
      config: PBRConfig | null,
      targetName: string,
      property: PBRFloatPropertyName
    ): float | null =>
      getPBRFloatValue(getSettingsForTarget(config, targetName), property);

    /**
     * Read a color property in the configuration (or `null` when the property
     * is not set).
     */
    export const getColorValue = (
      config: PBRConfig | null,
      targetName: string,
      property: PBRColorPropertyName
    ): string | null => {
      const value = getSettingsForTarget(config, targetName)[property];
      return value === undefined ? null : value;
    };

    /**
     * Read a texture slot in the configuration (or `null` when the slot is
     * not set).
     */
    export const getTextureSlot = (
      config: PBRConfig | null,
      targetName: string,
      slot: PBRTextureSlotName
    ): string | null => {
      const textures = getSettingsForTarget(config, targetName).textures;
      const value = textures && textures[slot];
      return value === undefined ? null : value;
    };

    /** Change a boolean property in the configuration. */
    export const setBooleanValue = (
      config: PBRConfig,
      targetName: string,
      property: PBRBooleanPropertyName,
      value: boolean
    ) => {
      getOrCreateTargetSettings(config, targetName)[property] = value;
    };

    /**
     * Read a boolean property in the configuration (or `null` when the
     * property is not set).
     */
    export const getBooleanValue = (
      config: PBRConfig | null,
      targetName: string,
      property: PBRBooleanPropertyName
    ): boolean | null => {
      const value = getSettingsForTarget(config, targetName)[property];
      return value === undefined ? null : value;
    };

    /**
     * Change the UV transform of a texture slot. `slot` is `null` for the
     * transform applied to every slot. A `null` transform removes it.
     */
    export const setUvTransform = (
      config: PBRConfig,
      targetName: string,
      slot: PBRTextureSlotName | null,
      transform: PBRUvTransform | null
    ) => {
      const settings = getOrCreateTargetSettings(config, targetName);
      if (!slot) {
        if (transform === null) {
          delete settings.uvTransform;
        } else {
          settings.uvTransform = transform;
        }
        return;
      }
      if (!settings.slotUvTransforms) settings.slotUvTransforms = {};
      if (transform === null) {
        delete settings.slotUvTransforms[slot];
      } else {
        settings.slotUvTransforms[slot] = transform;
      }
    };

    /**
     * Read the UV transform of a texture slot (or `null` when it is not set).
     * `slot` is `null` for the transform applied to every slot.
     */
    export const getUvTransform = (
      config: PBRConfig | null,
      targetName: string,
      slot: PBRTextureSlotName | null
    ): PBRUvTransform | null => {
      const settings = getSettingsForTarget(config, targetName);
      if (!slot) return settings.uvTransform || null;
      const transforms = settings.slotUvTransforms;
      return (transforms && transforms[slot]) || null;
    };
  }

  /**
   * A texture cloned to apply a non-default UV transform. It is shared by every
   * material using the same resource and transform, and reference counted so
   * that it is disposed only when its last user is gone.
   */
  interface UvTransformedTextureEntry {
    texture: THREE.Texture;
    resourceName: string;
    users: Set<THREE.Material>;
  }

  /**
   * The material types that can be built by {@link gdjs.PBRMaterialManager}.
   *
   * - `basic` ignores lighting (like the basic materials of Three.js).
   * - `standard` is the classic PBR material (metallic/roughness workflow).
   * - `physical` additionally supports transmission, ior and clearcoat (but
   *   is slower to render).
   *
   * @category 3D > Materials
   */
  export type PBRMaterialType = 'basic' | 'standard' | 'physical';

  /**
   * The default index of refraction of a Three.js physical material. Setting
   * it explicitly does not need the physical material (and so the heavier
   * shader).
   */
  const defaultPhysicalMaterialIor = 1.5;

  /**
   * `true` when the settings need the physical material (that is slower to
   * render but supports transmission, ior and clearcoat).
   *
   * Neutral values (0 for transmission and clearcoat, the default ior) do not
   * need it: they would compile the heavy physical shader for nothing.
   */
  const settingsNeedPhysicalMaterial = (
    settings: PBRMaterialSettings | undefined
  ): boolean =>
    !!settings &&
    ((settings.transmission !== undefined && settings.transmission > 0) ||
      (settings.clearcoat !== undefined && settings.clearcoat > 0) ||
      (settings.ior !== undefined &&
        settings.ior !== defaultPhysicalMaterialIor));

  const getThreeMaterialType = (material: THREE.Material): PBRMaterialType => {
    if ((material as THREE.MeshPhysicalMaterial).isMeshPhysicalMaterial) {
      return 'physical';
    }
    if ((material as THREE.MeshBasicMaterial).isMeshBasicMaterial) {
      return 'basic';
    }
    return 'standard';
  };

  const resolveMaterialType = (
    requestedType: PBRMaterialType,
    settings: PBRMaterialSettings | undefined
  ): PBRMaterialType => {
    if (
      requestedType === 'standard' &&
      settingsNeedPhysicalMaterial(settings)
    ) {
      return 'physical';
    }
    return requestedType;
  };

  /**
   * Create and configure a PBR material from settings.
   *
   * Materials and their textures are managed to avoid GPU memory leaks:
   * - Textures are shared and cached by the image manager (only one copy of
   *   each image is sent to the GPU, whatever the number of objects using it).
   * - Materials configured with the same settings are shared until an object
   *   changes them with events (they are then copied for this object only).
   * - Materials created for a single object must be disposed with
   *   `disposeUniqueMaterial` when the object is destroyed.
   *
   * @category 3D > Materials
   */
  export class PBRMaterialManager {
    private _runtimeGame: gdjs.RuntimeGame;

    /**
     * The shared materials, cached with the JSON of their configuration as
     * key. They are used by every object configured with the same settings.
     */
    private _sharedMaterials = new Map<string, THREE.Material>();

    /**
     * The materials created for a single object (because events changed their
     * properties). They are disposed by their owner with
     * `disposeUniqueMaterial`.
     */
    private _uniqueMaterials = new Set<THREE.Material>();

    /**
     * For each image resource name, the materials using it (to remove the
     * textures from these materials when the resource is unloaded).
     */
    private _materialsByResource = new Map<string, Set<THREE.Material>>();

    // Environment map (image based lighting) state.
    private _environmentTexture: THREE.Texture | null = null;
    private _environmentIntensity: float = 1;
    private _pmremGenerator: THREE.PMREMGenerator | null = null;

    /**
     * The textures cloned to apply a non-default UV transform (tiling, offset
     * or rotation). They are cached by resource/color-space/transform and
     * reference counted by material. The textures of the image manager are
     * never modified: a clone is only made when a non-default transform is
     * needed.
     */
    private _uvTransformedTextures = new Map<
      string,
      UvTransformedTextureEntry
    >();

    constructor(runtimeGame: gdjs.RuntimeGame) {
      this._runtimeGame = runtimeGame;
    }

    /**
     * Set the maximum anisotropic filtering applied to the 3D textures of the
     * materials (16 by default). Lower it on weak devices. It is applied
     * immediately to the textures already created.
     */
    setMaxAnisotropy(value: number): void {
      this._runtimeGame.getImageManager().setMaxAnisotropy(value);
    }

    /**
     * @returns the maximum anisotropic filtering asked for the 3D textures.
     */
    getMaxAnisotropy(): number {
      return this._runtimeGame.getImageManager().getMaxAnisotropy();
    }

    /**
     * Return the shared material configured with the given settings (it is
     * built if needed).
     *
     * ⚠️ Shared materials must not be changed: use `makeUniqueMaterialCopy`
     * before changing one for a single object.
     *
     * @param cacheKey a key identifying the settings (usually their JSON).
     * @param settings the settings to apply (after merging presets and overrides).
     */
    getSharedMaterial(
      cacheKey: string,
      settings: PBRMaterialSettings,
      options: {
        materialType: PBRMaterialType;
        vertexColors: boolean;
        side?: THREE.Side;
        transparent?: boolean;
      }
    ): THREE.Material {
      const existingMaterial = this._sharedMaterials.get(cacheKey);
      if (existingMaterial) {
        return existingMaterial;
      }
      const material = this.createUniqueMaterial(settings, options);
      this._uniqueMaterials.delete(material);
      this._sharedMaterials.set(cacheKey, material);
      return material;
    }

    /**
     * Create a material owned by the caller (not shared with other objects).
     * It must be disposed with `disposeUniqueMaterial` when not used anymore.
     */
    createUniqueMaterial(
      settings: PBRMaterialSettings,
      options: {
        materialType: PBRMaterialType;
        vertexColors: boolean;
        side?: THREE.Side;
        transparent?: boolean;
      }
    ): THREE.Material {
      const material = createThreeMaterial({
        materialType: resolveMaterialType(options.materialType, settings),
        vertexColors: options.vertexColors,
        side: options.side === undefined ? THREE.FrontSide : options.side,
        transparent: options.transparent === true,
      });
      this._uniqueMaterials.add(material);
      this._applySettings(material, settings);
      return material;
    }

    /**
     * Create a copy of a material owned by a single object, so that events can
     * change it without impacting the other objects sharing it.
     *
     * ⚠️ The copy must be disposed with `disposeUniqueMaterial`. The original
     * material is left untouched (and can still be shared by other objects).
     */
    makeUniqueMaterialCopy(material: THREE.Material): THREE.Material {
      const materialCopy = material.clone();
      this._uniqueMaterials.add(materialCopy);
      // Keep tracking the resources used by the copy.
      for (const entry of this._materialsByResource) {
        if (entry[1].has(material)) {
          entry[1].add(materialCopy);
        }
      }
      // The copy shares the textures of the original: register it as a user
      // of the UV transform clones so that they are not disposed under its
      // feet.
      this._registerMaterialUvTransformTextures(materialCopy);
      return materialCopy;
    }

    /**
     * Apply settings to an existing material.
     *
     * The material is changed in place when its type can support the settings.
     * Otherwise a new material is built (and the returned material is a new
     * one that must be disposed with `disposeUniqueMaterial` when not used
     * anymore - the given one is left untouched).
     */
    configureMaterial(
      material: THREE.Material,
      settings: PBRMaterialSettings,
      options: {
        materialType: PBRMaterialType;
        vertexColors: boolean;
        side?: THREE.Side;
        transparent?: boolean;
      }
    ): THREE.Material {
      const targetType = resolveMaterialType(options.materialType, settings);
      if (options.transparent !== undefined) {
        material.transparent = options.transparent;
      }
      if (getThreeMaterialType(material) === targetType) {
        this._applySettings(material, settings);
        return material;
      }
      const newMaterial = createThreeMaterial({
        materialType: targetType,
        vertexColors: options.vertexColors,
        side: options.side === undefined ? material.side : options.side,
        transparent: options.transparent === true,
      });
      this._uniqueMaterials.add(newMaterial);
      const previousType = getThreeMaterialType(material);
      if (
        (targetType === 'standard' || targetType === 'physical') &&
        (previousType === 'standard' || previousType === 'physical')
      ) {
        // Both materials are PBR materials: copy every PBR field (normal map,
        // roughness, metalness, emissive, ...) so that they are not lost. A
        // `MeshBasicMaterial` has none of these fields, so
        // `copyCommonMaterialProperties` is still used for the other
        // conversions.
        copyStandardMaterialProperties(material, newMaterial, targetType);
      } else {
        copyCommonMaterialProperties(material, newMaterial);
      }
      // Textures are shared and owned by the image manager (they must not be
      // disposed): keep tracking the new material for every resource the old
      // one used, so that `onImageResourceUnloaded` still clears its slots
      // (same loop as in `makeUniqueMaterialCopy`).
      for (const entry of this._materialsByResource) {
        if (entry[1].has(material)) {
          entry[1].add(newMaterial);
        }
      }
      // The new material shares the textures copied from the old one: register
      // it as a user of their UV transform clones.
      this._registerMaterialUvTransformTextures(newMaterial);
      this._applySettings(newMaterial, settings);
      return newMaterial;
    }

    /**
     * Dispose a material created with `createUniqueMaterial`, returned by
     * `makeUniqueMaterialCopy` or by `configureMaterial`.
     */
    disposeUniqueMaterial(material: THREE.Material): void {
      if (!this._uniqueMaterials.delete(material)) {
        return;
      }
      this._forgetMaterial(material);
      material.dispose();
    }

    /**
     * Change a numeric property of an existing material (used by events to
     * change materials while the game is running).
     */
    setFloatProperty(
      material: THREE.Material,
      property: PBRFloatPropertyName,
      value: float
    ): void {
      const standardMaterial = material as THREE.MeshStandardMaterial;
      switch (property) {
        case 'metallic':
          standardMaterial.metalness = value;
          break;
        case 'roughness':
          standardMaterial.roughness = value;
          break;
        case 'opacity':
          material.opacity = value;
          material.transparent = value < 1;
          break;
        case 'emissiveIntensity':
          standardMaterial.emissiveIntensity = value;
          break;
        case 'normalScale':
          if (standardMaterial.normalScale) {
            // The strength is always positive: the sign of Y is driven by
            // `normalFlipY` and kept when the strength changes.
            const strength = Math.abs(value);
            const flip = this._getNormalFlipY(material);
            standardMaterial.normalScale.set(
              strength,
              flip ? -strength : strength
            );
          }
          break;
        case 'aoIntensity':
          standardMaterial.aoMapIntensity = value;
          break;
        case 'displacementScale':
          standardMaterial.displacementScale = value;
          break;
        case 'displacementBias':
          standardMaterial.displacementBias = value;
          break;
        case 'envMapIntensity':
          standardMaterial.envMapIntensity = value;
          break;
        case 'alphaCutoff':
          material.alphaTest = value > 0 ? value : 0;
          if (value > 0) material.transparent = true;
          break;
        case 'ior':
          // Physical-only fields are not assigned to a standard material (it
          // would only pollute it with unused properties).
          if (this._isPhysicalMaterial(material)) {
            (material as THREE.MeshPhysicalMaterial).ior = value;
          }
          break;
        case 'transmission':
          if (this._isPhysicalMaterial(material)) {
            (material as THREE.MeshPhysicalMaterial).transmission = value;
            if (value > 0) material.transparent = true;
          }
          break;
        case 'clearcoat':
          if (this._isPhysicalMaterial(material)) {
            (material as THREE.MeshPhysicalMaterial).clearcoat = value;
          }
          break;
        case 'clearcoatRoughness':
          if (this._isPhysicalMaterial(material)) {
            (material as THREE.MeshPhysicalMaterial).clearcoatRoughness = value;
          }
          break;
      }
    }

    /**
     * Change a boolean property of an existing material (used by events to
     * change materials while the game is running).
     */
    setBooleanProperty(
      material: THREE.Material,
      property: PBRBooleanPropertyName,
      value: boolean
    ): void {
      if (property === 'normalFlipY') {
        this._setNormalFlipY(material, value);
      }
    }

    /**
     * Read a boolean property of a material (for events).
     */
    getBooleanProperty(
      material: THREE.Material,
      property: PBRBooleanPropertyName
    ): boolean {
      if (property === 'normalFlipY') {
        return this._getNormalFlipY(material);
      }
      return false;
    }

    /**
     * Change the UV transform (tiling, offset, rotation) of a texture slot of
     * an existing material. Use `'all'` to change every slot at once.
     *
     * The material must be unique (`makeUniqueMaterialCopy`): a shared
     * material must never be changed.
     */
    setUvTransform(
      material: THREE.Material,
      slotName: PBRTextureSlotName | 'all',
      transform: PBRUvTransform
    ): void {
      const slots: Array<PBRTextureSlotName> =
        slotName === 'all'
          ? [
              'baseColor',
              'metallic',
              'roughness',
              'normal',
              'ao',
              'emissive',
              'height',
              'opacity',
            ]
          : [slotName];
      for (const slot of slots) {
        const resourceName = this.getTextureSlotName(material, slot);
        if (!resourceName) continue;
        const isColorData = slot === 'baseColor' || slot === 'emissive';
        const texture = this._getUvTransformedTexture(
          material,
          resourceName,
          isColorData,
          transform
        );
        this._setMaterialTextureSlot(material, slot, texture);
      }
    }

    /**
     * Read the UV transform of a texture slot of a material (for events).
     * `'all'` returns the transform of the base color slot. Defaults are
     * returned when the slot has no transform.
     */
    getUvTransform(
      material: THREE.Material,
      slotName: PBRTextureSlotName | 'all'
    ): PBRUvTransform {
      const slot: PBRTextureSlotName =
        slotName === 'all' ? 'baseColor' : slotName;
      const texture = this._getMaterialTextureSlot(material, slot);
      const transform = texture ? (texture as any)._gdjsUvTransform : undefined;
      return transform
        ? { ...transform }
        : { repeatX: 1, repeatY: 1, offsetX: 0, offsetY: 0, rotation: 0 };
    }

    /**
     * Change a color property of an existing material (used by events to
     * change materials while the game is running).
     */
    setColorProperty(
      material: THREE.Material,
      property: PBRColorPropertyName,
      color: string
    ): void {
      const standardMaterial = material as THREE.MeshStandardMaterial;
      if (property === 'baseColor') {
        pbrColorStringToThreeColor(color, standardMaterial.color);
      } else {
        pbrColorStringToThreeColor(color, standardMaterial.emissive);
      }
    }

    /**
     * Change a texture slot of an existing material (used by events to change
     * materials while the game is running).
     *
     * @param resourceName the image resource to use, or an empty string to
     * remove the texture of the slot.
     */
    setTextureSlot(
      material: THREE.Material,
      slotName: PBRTextureSlotName,
      resourceName: string
    ): void {
      this._applyTextureSlot(
        material,
        slotName,
        resourceName === '' ? null : resourceName
      );
    }

    /**
     * Read a numeric property of a material (for events).
     */
    getFloatProperty(
      material: THREE.Material,
      property: PBRFloatPropertyName
    ): float {
      const standardMaterial = material as THREE.MeshStandardMaterial;
      switch (property) {
        case 'metallic':
          return standardMaterial.metalness;
        case 'roughness':
          return standardMaterial.roughness;
        case 'opacity':
          return material.opacity;
        case 'emissiveIntensity':
          return standardMaterial.emissiveIntensity;
        case 'normalScale':
          // The strength is always the positive value (see `normalFlipY`).
          return standardMaterial.normalScale
            ? Math.abs(standardMaterial.normalScale.x)
            : 1;
        case 'aoIntensity':
          return standardMaterial.aoMapIntensity;
        case 'displacementScale':
          return standardMaterial.displacementScale;
        case 'displacementBias':
          return standardMaterial.displacementBias;
        case 'envMapIntensity':
          return standardMaterial.envMapIntensity;
        case 'alphaCutoff':
          return material.alphaTest;
        case 'ior':
          return (material as THREE.MeshPhysicalMaterial).ior || 1.5;
        case 'transmission':
          return (material as THREE.MeshPhysicalMaterial).transmission || 0;
        case 'clearcoat':
          return (material as THREE.MeshPhysicalMaterial).clearcoat || 0;
        case 'clearcoatRoughness':
          return (
            (material as THREE.MeshPhysicalMaterial).clearcoatRoughness || 0
          );
      }
    }

    /**
     * Read a color property of a material (for events).
     */
    getColorProperty(
      material: THREE.Material,
      property: PBRColorPropertyName
    ): string {
      const standardMaterial = material as THREE.MeshStandardMaterial;
      return threeColorToPBRColorString(
        property === 'baseColor'
          ? standardMaterial.color
          : standardMaterial.emissive
      );
    }

    /**
     * Read a texture slot of a material (for events).
     *
     * @returns the name of the image resource of the slot (an empty string
     * when the slot is empty or when the texture does not come from an image
     * resource - like the textures embedded in 3D models).
     */
    getTextureSlotName(
      material: THREE.Material,
      slotName: PBRTextureSlotName
    ): string {
      const texture = this._getMaterialTextureSlot(material, slotName);
      return texture ? (texture as any)._gdjsResourceName || '' : '';
    }

    /**
     * Apply a preset to an existing material (used by events).
     *
     * @returns the material to use (a new one is returned when the material
     * type had to change - the given one is left untouched and the returned
     * one must be disposed with `disposeUniqueMaterial` when not used anymore).
     */
    applyPresetToMaterial(
      material: THREE.Material,
      presetName: PBRPresetName,
      options: { materialType: PBRMaterialType; vertexColors: boolean }
    ): THREE.Material {
      const settings = pbrPresets[presetName] || {};
      return this.configureMaterial(material, settings, options);
    }

    /**
     * Dispose the shared material built with the given cache key.
     */
    disposeSharedMaterial(cacheKey: string): void {
      const material = this._sharedMaterials.get(cacheKey);
      if (!material) return;
      this._sharedMaterials.delete(cacheKey);
      this._forgetMaterial(material);
      material.dispose();
    }

    /**
     * To be called when an image resource is unloaded, to avoid keeping
     * disposed textures on materials (and leaking GPU memory).
     */
    onImageResourceUnloaded(resourceName: string): void {
      // Dispose the UV transform clones made for this resource.
      for (const [key, entry] of this._uvTransformedTextures) {
        if (entry.resourceName === resourceName) {
          entry.texture.dispose();
          this._uvTransformedTextures.delete(key);
        }
      }
      const materials = this._materialsByResource.get(resourceName);
      if (!materials) return;
      this._materialsByResource.delete(resourceName);
      for (const material of materials) {
        clearTextureSlotsForResource(material, resourceName);
      }
    }

    /**
     * @returns the image based lighting texture currently applied to scenes.
     */
    getEnvironmentTexture(): THREE.Texture | null {
      return this._environmentTexture;
    }

    /**
     * @returns the intensity of the image based lighting.
     */
    getEnvironmentIntensity(): float {
      return this._environmentIntensity;
    }

    /**
     * Set the intensity of the image based lighting and apply it to scenes.
     */
    setEnvironmentIntensity(runtimeScene: gdjs.RuntimeScene, value: float) {
      this._environmentIntensity = value;
      this.applyEnvironmentToScenes(runtimeScene);
    }

    /**
     * Use the 6 given images as an environment map (image based lighting).
     *
     * @param faceResourceNames the names of 6 image resources, in the order
     * X+, X-, Y+, Y-, Z+, Z-.
     */
    setEnvironmentMapFromCubeImages(
      runtimeScene: gdjs.RuntimeScene,
      faceResourceNames: [string, string, string, string, string, string]
    ): void {
      const imageManager = this._runtimeGame.getImageManager();
      const cubeTexture = imageManager.getThreeCubeTexture(
        faceResourceNames[0],
        faceResourceNames[1],
        faceResourceNames[2],
        faceResourceNames[3],
        faceResourceNames[4],
        faceResourceNames[5]
      );
      this._setEnvironmentTexture(runtimeScene, cubeTexture);
    }

    /**
     * Use an equirectangular image as an environment map (image based
     * lighting).
     */
    setEnvironmentMapFromEquirectangularImage(
      runtimeScene: gdjs.RuntimeScene,
      resourceName: string
    ): void {
      const imageManager = this._runtimeGame.getImageManager();
      const texture = imageManager.getThreeTexture(resourceName, {
        isColorData: true,
      });
      texture.mapping = THREE.EquirectangularReflectionMapping;
      this._setEnvironmentTexture(runtimeScene, texture);
    }

    /**
     * Remove the environment map (image based lighting) from scenes.
     */
    removeEnvironmentMap(runtimeScene: gdjs.RuntimeScene): void {
      if (this._environmentTexture) {
        this._environmentTexture.dispose();
        this._environmentTexture = null;
      }
      this._forEachThreeScene(runtimeScene, (threeScene) => {
        threeScene.environment = null;
      });
    }

    /**
     * Apply the current environment map (image based lighting) to the 3D
     * scenes of the given runtime scene (and the other loaded scenes).
     */
    applyEnvironmentToScenes(runtimeScene: gdjs.RuntimeScene): void {
      this._forEachThreeScene(runtimeScene, (threeScene) => {
        threeScene.environment = this._environmentTexture;
        threeScene.environmentIntensity = this._environmentIntensity;
      });
    }

    /**
     * To be called when the game is disposed: dispose every material and the
     * environment map (their textures are owned by the image manager).
     */
    dispose(): void {
      for (const material of this._sharedMaterials.values()) {
        material.dispose();
      }
      this._sharedMaterials.clear();
      for (const material of this._uniqueMaterials) {
        material.dispose();
      }
      this._uniqueMaterials.clear();
      this._materialsByResource.clear();
      for (const entry of this._uvTransformedTextures.values()) {
        entry.texture.dispose();
      }
      this._uvTransformedTextures.clear();
      if (this._environmentTexture) {
        this._environmentTexture.dispose();
        this._environmentTexture = null;
      }
      if (this._pmremGenerator) {
        this._pmremGenerator.dispose();
        this._pmremGenerator = null;
      }
    }

    private _setEnvironmentTexture(
      runtimeScene: gdjs.RuntimeScene,
      sourceTexture: THREE.Texture
    ): void {
      const threeRenderer = this._runtimeGame.getRenderer().getThreeRenderer();
      if (!threeRenderer) {
        logger.warn(
          'Cannot setup the environment map: no 3D renderer is available.'
        );
        return;
      }
      if (!this._pmremGenerator) {
        this._pmremGenerator = new THREE.PMREMGenerator(threeRenderer);
      }
      const previousTexture = this._environmentTexture;
      // PMREM prefiltering is needed for smooth roughness on every GPU
      // (see https://threejs.org/docs/#api/en/materials/MeshStandardMaterial).
      this._environmentTexture = (sourceTexture as THREE.CubeTexture)
        .isCubeTexture
        ? this._pmremGenerator.fromCubemap(sourceTexture as THREE.CubeTexture)
            .texture
        : this._pmremGenerator.fromEquirectangular(sourceTexture).texture;
      if (previousTexture) {
        previousTexture.dispose();
      }
      this.applyEnvironmentToScenes(runtimeScene);
    }

    private _forEachThreeScene(
      runtimeScene: gdjs.RuntimeScene,
      callback: (threeScene: THREE.Scene) => void
    ): void {
      const visitedScenes = new Set<gdjs.RuntimeScene>();
      for (const scene of [
        runtimeScene,
        ...this._runtimeGame.getSceneStack().getAllScenes(),
      ]) {
        if (visitedScenes.has(scene)) continue;
        visitedScenes.add(scene);
        for (const layer of scene._orderedLayers) {
          const threeScene = layer.getRenderer().getThreeScene();
          if (threeScene) {
            callback(threeScene);
          }
        }
      }
    }

    private _applySettings(
      material: THREE.Material,
      settings: PBRMaterialSettings | undefined
    ): void {
      if (!settings) return;
      const standardMaterial = material as THREE.MeshStandardMaterial;

      if (settings.baseColor !== undefined) {
        pbrColorStringToThreeColor(settings.baseColor, standardMaterial.color);
      }
      if (settings.metallic !== undefined) {
        standardMaterial.metalness = settings.metallic;
      }
      if (settings.roughness !== undefined) {
        standardMaterial.roughness = settings.roughness;
      }
      if (settings.opacity !== undefined) {
        material.opacity = settings.opacity;
        material.transparent = settings.opacity < 1;
      }
      if (settings.emissiveColor !== undefined) {
        pbrColorStringToThreeColor(
          settings.emissiveColor,
          standardMaterial.emissive
        );
      }
      if (settings.emissiveIntensity !== undefined) {
        standardMaterial.emissiveIntensity = settings.emissiveIntensity;
      }
      if (settings.normalFlipY !== undefined) {
        this._setNormalFlipY(material, settings.normalFlipY);
      }
      if (settings.normalScale !== undefined && standardMaterial.normalScale) {
        // The strength is always positive: the sign of Y is driven by
        // `normalFlipY`. It is applied after the flip so that both settings
        // can be changed at once.
        const strength = Math.abs(settings.normalScale);
        const flip = this._getNormalFlipY(material);
        standardMaterial.normalScale.set(strength, flip ? -strength : strength);
      }
      if (settings.aoIntensity !== undefined) {
        standardMaterial.aoMapIntensity = settings.aoIntensity;
      }
      if (settings.displacementScale !== undefined) {
        standardMaterial.displacementScale = settings.displacementScale;
      }
      if (settings.displacementBias !== undefined) {
        standardMaterial.displacementBias = settings.displacementBias;
      }
      if (settings.envMapIntensity !== undefined) {
        standardMaterial.envMapIntensity = settings.envMapIntensity;
      }
      if (settings.doubleSided !== undefined) {
        material.side = settings.doubleSided
          ? THREE.DoubleSide
          : THREE.FrontSide;
      }
      if (settings.alphaCutoff !== undefined && settings.alphaCutoff > 0) {
        material.alphaTest = settings.alphaCutoff;
        material.transparent = true;
      }
      // Physical-only fields are only assigned to a physical material: a
      // standard material must not be polluted with unused properties.
      if (this._isPhysicalMaterial(material)) {
        const physicalMaterial = material as THREE.MeshPhysicalMaterial;
        if (settings.ior !== undefined) {
          physicalMaterial.ior = settings.ior;
        }
        if (settings.transmission !== undefined) {
          physicalMaterial.transmission = settings.transmission;
          if (settings.transmission > 0) {
            material.transparent = true;
          }
        }
        if (settings.clearcoat !== undefined) {
          physicalMaterial.clearcoat = settings.clearcoat;
        }
        if (settings.clearcoatRoughness !== undefined) {
          physicalMaterial.clearcoatRoughness = settings.clearcoatRoughness;
        }
      }

      const textures = settings.textures;
      if (textures) {
        this._applyTextureSlot(
          material,
          'baseColor',
          textures.baseColor,
          getSlotUvTransform(settings, 'baseColor')
        );
        if (textures.metallicRoughness !== undefined) {
          // glTF packs the roughness in the green channel and the metallic
          // factor in the blue channel: one texture fills the 2 slots.
          const texture = textures.metallicRoughness
            ? this._getUvTransformedTexture(
                material,
                textures.metallicRoughness,
                false,
                getSlotUvTransform(settings, 'metallicRoughness')
              )
            : null;
          this._setMaterialTextureSlot(material, 'metallicRoughness', texture);
          if (texture && textures.metallicRoughness) {
            this._trackMaterialForResource(
              textures.metallicRoughness,
              material
            );
          }
        } else {
          this._applyTextureSlot(
            material,
            'metallic',
            textures.metallic,
            getSlotUvTransform(settings, 'metallic')
          );
          this._applyTextureSlot(
            material,
            'roughness',
            textures.roughness,
            getSlotUvTransform(settings, 'roughness')
          );
        }
        this._applyTextureSlot(
          material,
          'normal',
          textures.normal,
          getSlotUvTransform(settings, 'normal')
        );
        this._applyTextureSlot(
          material,
          'ao',
          textures.ao,
          getSlotUvTransform(settings, 'ao')
        );
        this._applyTextureSlot(
          material,
          'emissive',
          textures.emissive,
          getSlotUvTransform(settings, 'emissive')
        );
        this._applyTextureSlot(
          material,
          'height',
          textures.height,
          getSlotUvTransform(settings, 'height')
        );
        this._applyTextureSlot(
          material,
          'opacity',
          textures.opacity,
          getSlotUvTransform(settings, 'opacity')
        );
      }
    }

    private _applyTextureSlot(
      material: THREE.Material,
      slotName: PBRTextureSlotName,
      resourceName: string | null | undefined,
      uvTransform?: PBRUvTransform
    ): void {
      if (resourceName === undefined) {
        // Keep the texture of the original material.
        return;
      }
      const texture = resourceName
        ? this._getUvTransformedTexture(
            material,
            resourceName,
            slotName === 'baseColor' || slotName === 'emissive',
            uvTransform
          )
        : null;
      this._setMaterialTextureSlot(material, slotName, texture);
      if (texture && resourceName) {
        this._trackMaterialForResource(resourceName, material);
      }
    }

    private _getTexture(
      imageManager: gdjs.PixiImageManager,
      resourceName: string,
      isColorData: boolean
    ): THREE.Texture | null {
      if (!resourceName) return null;
      // Only the color textures (albedo and emissive) are stored in the sRGB
      // color space: the other maps hold data and must be kept linear.
      const texture = imageManager.getThreeTexture(resourceName, {
        isColorData,
      });
      (texture as any)._gdjsResourceName = resourceName;
      return texture;
    }

    private _isPhysicalMaterial(material: THREE.Material): boolean {
      return (
        (material as THREE.MeshPhysicalMaterial).isMeshPhysicalMaterial === true
      );
    }

    private _getNormalFlipY(material: THREE.Material): boolean {
      return material.userData.gdjsNormalFlipY === true;
    }

    /**
     * Set whether the green channel of the normal map is flipped, keeping the
     * strength (`normalScale.x` always stays the positive strength).
     */
    private _setNormalFlipY(material: THREE.Material, value: boolean): void {
      material.userData.gdjsNormalFlipY = value;
      const standardMaterial = material as THREE.MeshStandardMaterial;
      if (!standardMaterial.normalScale) return;
      const strength = Math.abs(standardMaterial.normalScale.x);
      standardMaterial.normalScale.set(strength, value ? -strength : strength);
    }

    /**
     * Read the texture of a slot (the mapping of the slot names to the
     * Three.js material properties).
     */
    private _getMaterialTextureSlot(
      material: THREE.Material,
      slotName: PBRTextureSlotName
    ): THREE.Texture | null {
      const standardMaterial = material as THREE.MeshStandardMaterial;
      switch (slotName) {
        case 'baseColor':
          return standardMaterial.map;
        case 'metallicRoughness':
        case 'metallic':
          return standardMaterial.metalnessMap;
        case 'roughness':
          return standardMaterial.roughnessMap;
        case 'normal':
          return standardMaterial.normalMap;
        case 'ao':
          return standardMaterial.aoMap;
        case 'emissive':
          return standardMaterial.emissiveMap;
        case 'height':
          return standardMaterial.displacementMap;
        case 'opacity':
          return standardMaterial.alphaMap;
        default:
          return null;
      }
    }

    /**
     * Set the texture of a slot, releasing the UV transform clone previously
     * used by the material (a clone is never released when it is kept).
     */
    private _setMaterialTextureSlot(
      material: THREE.Material,
      slotName: PBRTextureSlotName,
      texture: THREE.Texture | null
    ): void {
      const standardMaterial = material as THREE.MeshStandardMaterial;
      switch (slotName) {
        case 'baseColor':
          if (standardMaterial.map !== texture) {
            this._releaseUvTransformTexture(material, standardMaterial.map);
          }
          standardMaterial.map = texture;
          break;
        case 'metallicRoughness':
          if (standardMaterial.metalnessMap !== texture) {
            this._releaseUvTransformTexture(
              material,
              standardMaterial.metalnessMap
            );
          }
          if (standardMaterial.roughnessMap !== texture) {
            this._releaseUvTransformTexture(
              material,
              standardMaterial.roughnessMap
            );
          }
          standardMaterial.metalnessMap = texture;
          standardMaterial.roughnessMap = texture;
          break;
        case 'metallic':
          if (standardMaterial.metalnessMap !== texture) {
            this._releaseUvTransformTexture(
              material,
              standardMaterial.metalnessMap
            );
          }
          standardMaterial.metalnessMap = texture;
          break;
        case 'roughness':
          if (standardMaterial.roughnessMap !== texture) {
            this._releaseUvTransformTexture(
              material,
              standardMaterial.roughnessMap
            );
          }
          standardMaterial.roughnessMap = texture;
          break;
        case 'normal':
          if (standardMaterial.normalMap !== texture) {
            this._releaseUvTransformTexture(
              material,
              standardMaterial.normalMap
            );
          }
          standardMaterial.normalMap = texture;
          break;
        case 'ao':
          if (standardMaterial.aoMap !== texture) {
            this._releaseUvTransformTexture(material, standardMaterial.aoMap);
          }
          standardMaterial.aoMap = texture;
          break;
        case 'emissive':
          if (standardMaterial.emissiveMap !== texture) {
            this._releaseUvTransformTexture(
              material,
              standardMaterial.emissiveMap
            );
          }
          standardMaterial.emissiveMap = texture;
          break;
        case 'height':
          if (standardMaterial.displacementMap !== texture) {
            this._releaseUvTransformTexture(
              material,
              standardMaterial.displacementMap
            );
          }
          standardMaterial.displacementMap = texture;
          break;
        case 'opacity':
          if (standardMaterial.alphaMap !== texture) {
            this._releaseUvTransformTexture(
              material,
              standardMaterial.alphaMap
            );
          }
          standardMaterial.alphaMap = texture;
          if (texture) {
            material.transparent = true;
          }
          break;
      }
    }

    /**
     * Return the texture to use for a slot: the shared texture of the image
     * manager when the transform is the identity, or a cached clone with the
     * UV transform applied (the shared texture is never modified).
     */
    private _getUvTransformedTexture(
      material: THREE.Material,
      resourceName: string,
      isColorData: boolean,
      transform: PBRUvTransform | undefined
    ): THREE.Texture | null {
      const originalTexture = this._getTexture(
        this._runtimeGame.getImageManager(),
        resourceName,
        isColorData
      );
      if (!originalTexture) return null;
      if (isDefaultUvTransform(transform) || !transform) {
        return originalTexture;
      }
      const key = getUvTransformCacheKey(resourceName, isColorData, transform);
      let entry = this._uvTransformedTextures.get(key);
      if (!entry) {
        const clone = originalTexture.clone();
        clone.wrapS = THREE.RepeatWrapping;
        clone.wrapT = THREE.RepeatWrapping;
        clone.center.set(0.5, 0.5);
        clone.repeat.set(
          transform.repeatX === undefined ? 1 : transform.repeatX,
          transform.repeatY === undefined ? 1 : transform.repeatY
        );
        clone.offset.set(
          transform.offsetX === undefined ? 0 : transform.offsetX,
          transform.offsetY === undefined ? 0 : transform.offsetY
        );
        clone.rotation = gdjs.toRad(
          transform.rotation === undefined ? 0 : transform.rotation
        );
        // Keep the color space and the anisotropic filtering of the original.
        clone.colorSpace = originalTexture.colorSpace;
        clone.anisotropy = originalTexture.anisotropy;
        (clone as any)._gdjsResourceName = resourceName;
        (clone as any)._gdjsUvTransformKey = key;
        (clone as any)._gdjsUvTransform = {
          repeatX: transform.repeatX === undefined ? 1 : transform.repeatX,
          repeatY: transform.repeatY === undefined ? 1 : transform.repeatY,
          offsetX: transform.offsetX === undefined ? 0 : transform.offsetX,
          offsetY: transform.offsetY === undefined ? 0 : transform.offsetY,
          rotation: transform.rotation === undefined ? 0 : transform.rotation,
        };
        // `Texture.clone()` already sets `needsUpdate` (see `Texture.copy` in
        // three r185), it is kept explicit for clarity.
        clone.needsUpdate = true;
        entry = { texture: clone, resourceName, users: new Set() };
        this._uvTransformedTextures.set(key, entry);
      }
      entry.users.add(material);
      return entry.texture;
    }

    /**
     * Release a material from a UV transform clone (disposing the clone when
     * its last user is gone). Textures that are not manager clones are left
     * untouched.
     */
    private _releaseUvTransformTexture(
      material: THREE.Material,
      texture: THREE.Texture | null | undefined
    ): void {
      if (!texture) return;
      const key = (texture as any)._gdjsUvTransformKey as string | undefined;
      if (!key) return;
      const entry = this._uvTransformedTextures.get(key);
      if (!entry) return;
      entry.users.delete(material);
      if (entry.users.size === 0) {
        entry.texture.dispose();
        this._uvTransformedTextures.delete(key);
      }
    }

    /**
     * Register a material as a user of every UV transform clone it references
     * (used when a material is copied: the copy shares the textures of the
     * original).
     */
    private _registerMaterialUvTransformTextures(
      material: THREE.Material
    ): void {
      const slots: Array<PBRTextureSlotName> = [
        'baseColor',
        'metallic',
        'roughness',
        'normal',
        'ao',
        'emissive',
        'height',
        'opacity',
      ];
      for (const slot of slots) {
        const texture = this._getMaterialTextureSlot(material, slot);
        if (!texture) continue;
        const key = (texture as any)._gdjsUvTransformKey as string | undefined;
        if (!key) continue;
        const entry = this._uvTransformedTextures.get(key);
        if (entry) entry.users.add(material);
      }
    }

    private _trackMaterialForResource(
      resourceName: string,
      material: THREE.Material
    ): void {
      let materials = this._materialsByResource.get(resourceName);
      if (!materials) {
        materials = new Set();
        this._materialsByResource.set(resourceName, materials);
      }
      materials.add(material);
    }

    private _forgetMaterial(material: THREE.Material): void {
      for (const entry of this._materialsByResource) {
        entry[1].delete(material);
      }
      // Release the UV transform clones used by this material (disposing the
      // ones that have no user anymore).
      for (const [key, entry] of this._uvTransformedTextures) {
        if (entry.users.delete(material) && entry.users.size === 0) {
          entry.texture.dispose();
          this._uvTransformedTextures.delete(key);
        }
      }
    }
  }

  const createThreeMaterial = (options: {
    materialType: PBRMaterialType;
    vertexColors: boolean;
    side: THREE.Side;
    transparent: boolean;
  }): THREE.Material => {
    if (options.materialType === 'basic') {
      return new THREE.MeshBasicMaterial({
        side: options.side,
        vertexColors: options.vertexColors,
        transparent: options.transparent,
      });
    }
    const material =
      options.materialType === 'physical'
        ? new THREE.MeshPhysicalMaterial({
            side: options.side,
            vertexColors: options.vertexColors,
            transparent: options.transparent,
          })
        : new THREE.MeshStandardMaterial({
            side: options.side,
            vertexColors: options.vertexColors,
            transparent: options.transparent,
          });
    // Start with neutral values so that an unconfigured material is visible.
    material.metalness = 0;
    material.roughness = 1;
    return material;
  };

  const copyCommonMaterialProperties = (
    from: THREE.Material,
    to: THREE.Material
  ): void => {
    to.name = from.name;
    to.opacity = from.opacity;
    to.transparent = from.transparent;
    to.side = from.side;
    to.vertexColors = from.vertexColors;
    to.alphaTest = from.alphaTest;
    to.depthWrite = from.depthWrite;
    to.depthTest = from.depthTest;
    const fromStandard = from as THREE.MeshStandardMaterial;
    const toStandard = to as THREE.MeshStandardMaterial;
    if (fromStandard.color && toStandard.color) {
      toStandard.color.copy(fromStandard.color);
    }
    if (fromStandard.map && toStandard.map !== undefined) {
      toStandard.map = fromStandard.map;
    }
  };

  /**
   * Copy every PBR field (textures, factors, ...) of a standard/physical
   * material into a new material of the other PBR type.
   *
   * `MeshPhysicalMaterial.prototype.copy` must not be called with a
   * `MeshStandardMaterial` source: it would copy the physical fields
   * (clearcoat, sheen, transmission, ...) as `undefined`. Calling
   * `MeshStandardMaterial.prototype.copy` copies the fields shared by both
   * types and leaves the physical fields to their defaults.
   */
  const copyStandardMaterialProperties = (
    from: THREE.Material,
    to: THREE.Material,
    targetType: PBRMaterialType
  ): void => {
    THREE.MeshStandardMaterial.prototype.copy.call(
      to as THREE.MeshStandardMaterial,
      from as THREE.MeshStandardMaterial
    );
    // `MeshStandardMaterial.prototype.copy` resets the defines to the standard
    // ones: restore the defines of the target type, otherwise a physical
    // material would lose the `PHYSICAL` define (and its shader features).
    (to as THREE.MeshStandardMaterial).defines =
      targetType === 'physical'
        ? { STANDARD: '', PHYSICAL: '' }
        : { STANDARD: '' };
  };

  const clearTextureSlotsForResource = (
    material: THREE.Material,
    resourceName: string
  ): void => {
    const standardMaterial = material as THREE.MeshStandardMaterial;
    const textureSlots: Array<keyof THREE.MeshStandardMaterial> = [
      'map',
      'metalnessMap',
      'roughnessMap',
      'normalMap',
      'aoMap',
      'emissiveMap',
      'displacementMap',
      'alphaMap',
    ];
    for (const slotName of textureSlots) {
      const texture = standardMaterial[slotName] as THREE.Texture | null;
      if (texture && (texture as any)._gdjsResourceName === resourceName) {
        (standardMaterial as any)[slotName] = null;
      }
    }
  };

  const getPBRMaterialManager = (
    runtimeScene: gdjs.RuntimeScene
  ): PBRMaterialManager => runtimeScene.getGame().getPBRMaterialManager();

  /**
   * Helpers for the events related to PBR materials and environment maps.
   *
   * @category Core Engine > Events interfacing
   */
  export namespace pbr {
    /**
     * Use 6 images as the environment map (image based lighting) of scenes.
     *
     * @param faceResourceNames the image resources in the order X+, X-, Y+, Y-, Z+, Z-.
     */
    export const setEnvironmentMapFromCubeImages = (
      runtimeScene: gdjs.RuntimeScene,
      xPositiveResourceName: string,
      xNegativeResourceName: string,
      yPositiveResourceName: string,
      yNegativeResourceName: string,
      zPositiveResourceName: string,
      zNegativeResourceName: string
    ) => {
      getPBRMaterialManager(runtimeScene).setEnvironmentMapFromCubeImages(
        runtimeScene,
        [
          xPositiveResourceName,
          xNegativeResourceName,
          yPositiveResourceName,
          yNegativeResourceName,
          zPositiveResourceName,
          zNegativeResourceName,
        ]
      );
    };

    /**
     * Use an equirectangular image as the environment map (image based
     * lighting) of scenes.
     */
    export const setEnvironmentMapFromEquirectangularImage = (
      runtimeScene: gdjs.RuntimeScene,
      resourceName: string
    ) => {
      getPBRMaterialManager(
        runtimeScene
      ).setEnvironmentMapFromEquirectangularImage(runtimeScene, resourceName);
    };

    /**
     * Remove the environment map (image based lighting) of scenes.
     */
    export const removeEnvironmentMap = (runtimeScene: gdjs.RuntimeScene) => {
      getPBRMaterialManager(runtimeScene).removeEnvironmentMap(runtimeScene);
    };

    /**
     * Set the intensity of the environment map (image based lighting).
     */
    export const setEnvironmentIntensity = (
      runtimeScene: gdjs.RuntimeScene,
      value: float
    ) => {
      getPBRMaterialManager(runtimeScene).setEnvironmentIntensity(
        runtimeScene,
        value
      );
    };

    /**
     * Get the intensity of the environment map (image based lighting).
     */
    export const getEnvironmentIntensity = (
      runtimeScene: gdjs.RuntimeScene
    ): float => getPBRMaterialManager(runtimeScene).getEnvironmentIntensity();

    /**
     * Check if an environment map (image based lighting) is set.
     */
    export const hasEnvironmentMap = (
      runtimeScene: gdjs.RuntimeScene
    ): boolean =>
      getPBRMaterialManager(runtimeScene).getEnvironmentTexture() !== null;

    /**
     * Set the maximum anisotropic filtering applied to the 3D textures of the
     * materials (16 by default). Lower it on weak devices.
     */
    export const setMaxAnisotropy = (
      runtimeScene: gdjs.RuntimeScene,
      value: float
    ) => {
      getPBRMaterialManager(runtimeScene).setMaxAnisotropy(value);
    };

    /**
     * Get the maximum anisotropic filtering applied to the 3D textures of the
     * materials.
     */
    export const getMaxAnisotropy = (runtimeScene: gdjs.RuntimeScene): float =>
      getPBRMaterialManager(runtimeScene).getMaxAnisotropy();
  }
}
