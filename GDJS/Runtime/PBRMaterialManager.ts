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
    | 'alphaCutoff';

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
    /** When true, the material is rendered on both faces. */
    doubleSided?: boolean;
    /** When above 0, the alpha cutoff used to discard transparent pixels. */
    alphaCutoff?: number;
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
    property === 'alphaCutoff';

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
    return merged;
  };

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
   * `true` when the settings need the physical material (that is slower to
   * render but supports transmission, ior and clearcoat).
   */
  const settingsNeedPhysicalMaterial = (
    settings: PBRMaterialSettings | undefined
  ): boolean =>
    !!settings &&
    (settings.transmission !== undefined ||
      settings.ior !== undefined ||
      settings.clearcoat !== undefined);

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

    constructor(runtimeGame: gdjs.RuntimeGame) {
      this._runtimeGame = runtimeGame;
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
      copyCommonMaterialProperties(material, newMaterial);
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
            standardMaterial.normalScale.setScalar(value);
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
          (material as THREE.MeshPhysicalMaterial).ior = value;
          break;
        case 'transmission':
          (material as THREE.MeshPhysicalMaterial).transmission = value;
          if (value > 0) material.transparent = true;
          break;
        case 'clearcoat':
          (material as THREE.MeshPhysicalMaterial).clearcoat = value;
          break;
      }
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
          return standardMaterial.normalScale
            ? standardMaterial.normalScale.x
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
      const standardMaterial = material as THREE.MeshStandardMaterial;
      let texture: THREE.Texture | null = null;
      switch (slotName) {
        case 'baseColor':
          texture = standardMaterial.map;
          break;
        case 'metallicRoughness':
        case 'metallic':
          texture = standardMaterial.metalnessMap;
          break;
        case 'roughness':
          texture = standardMaterial.roughnessMap;
          break;
        case 'normal':
          texture = standardMaterial.normalMap;
          break;
        case 'ao':
          texture = standardMaterial.aoMap;
          break;
        case 'emissive':
          texture = standardMaterial.emissiveMap;
          break;
        case 'height':
          texture = standardMaterial.displacementMap;
          break;
        case 'opacity':
          texture = standardMaterial.alphaMap;
          break;
      }
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
     * Prefilter an environment texture (a cube texture or an equirectangular
     * texture) with PMREM, so that it can be used as the `environment` of a
     * scene with a smooth roughness on every GPU.
     *
     * @returns the prefiltered texture, to dispose with
     * `disposeEnvironmentTexture` when not used anymore, or null when no 3D
     * renderer is available.
     */
    prefilterEnvironmentTexture(
      sourceTexture: THREE.Texture
    ): THREE.Texture | null {
      const threeRenderer = this._runtimeGame.getRenderer().getThreeRenderer();
      if (!threeRenderer) {
        logger.warn(
          'Cannot prefilter the environment texture: no 3D renderer is available.'
        );
        return null;
      }
      if (!this._pmremGenerator) {
        this._pmremGenerator = new THREE.PMREMGenerator(threeRenderer);
      }
      // PMREM prefiltering is needed for smooth roughness on every GPU
      // (see https://threejs.org/docs/#api/en/materials/MeshStandardMaterial).
      return (sourceTexture as THREE.CubeTexture).isCubeTexture
        ? this._pmremGenerator.fromCubemap(sourceTexture as THREE.CubeTexture)
            .texture
        : this._pmremGenerator.fromEquirectangular(sourceTexture).texture;
    }

    /**
     * Dispose a texture returned by `prefilterEnvironmentTexture`.
     */
    disposeEnvironmentTexture(texture: THREE.Texture): void {
      texture.dispose();
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
      const environmentTexture = this.prefilterEnvironmentTexture(
        sourceTexture
      );
      if (!environmentTexture) {
        return;
      }
      const previousTexture = this._environmentTexture;
      this._environmentTexture = environmentTexture;
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
      const imageManager = this._runtimeGame.getImageManager();
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
      if (settings.normalScale !== undefined && standardMaterial.normalScale) {
        standardMaterial.normalScale.setScalar(settings.normalScale);
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

      const textures = settings.textures;
      if (textures) {
        this._applyTextureSlot(material, 'baseColor', textures.baseColor);
        if (textures.metallicRoughness !== undefined) {
          // glTF packs the roughness in the green channel and the metallic
          // factor in the blue channel: one texture fills the 2 slots.
          const texture = this._getTexture(
            imageManager,
            textures.metallicRoughness,
            false
          );
          standardMaterial.metalnessMap = texture;
          standardMaterial.roughnessMap = texture;
          this._trackMaterialForResource(textures.metallicRoughness, material);
        } else {
          this._applyTextureSlot(material, 'metallic', textures.metallic);
          this._applyTextureSlot(material, 'roughness', textures.roughness);
        }
        this._applyTextureSlot(material, 'normal', textures.normal);
        this._applyTextureSlot(material, 'ao', textures.ao);
        this._applyTextureSlot(material, 'emissive', textures.emissive);
        this._applyTextureSlot(material, 'height', textures.height);
        this._applyTextureSlot(material, 'opacity', textures.opacity);
      }
    }

    private _applyTextureSlot(
      material: THREE.Material,
      slotName: PBRTextureSlotName,
      resourceName: string | null | undefined
    ): void {
      if (resourceName === undefined) {
        // Keep the texture of the original material.
        return;
      }
      const texture = resourceName
        ? this._getTexture(
            this._runtimeGame.getImageManager(),
            resourceName,
            slotName === 'baseColor' || slotName === 'emissive'
          )
        : null;
      const standardMaterial = material as THREE.MeshStandardMaterial;
      switch (slotName) {
        case 'baseColor':
          standardMaterial.map = texture;
          break;
        case 'metallic':
          standardMaterial.metalnessMap = texture;
          break;
        case 'roughness':
          standardMaterial.roughnessMap = texture;
          break;
        case 'normal':
          standardMaterial.normalMap = texture;
          break;
        case 'ao':
          standardMaterial.aoMap = texture;
          break;
        case 'emissive':
          standardMaterial.emissiveMap = texture;
          break;
        case 'height':
          standardMaterial.displacementMap = texture;
          break;
        case 'opacity':
          standardMaterial.alphaMap = texture;
          if (texture) {
            material.transparent = true;
          }
          break;
      }
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
  }
}
