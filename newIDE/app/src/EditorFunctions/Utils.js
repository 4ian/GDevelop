// @flow
import { type AssetShortHeader } from '../Utils/GDevelopServices/Asset';
import { mapVector } from '../Utils/MapFor';
import { SafeExtractor } from '../Utils/SafeExtractor';
import { serializeToJSObject } from '../Utils/Serializer';
import { type EditorFunctionGenericOutput } from './index';

const gd: libGDevelop = global.gd;

export type ObjectSizeInfo = {|
  // `width`/`height`/`centerX`/`centerY` are `null` when size is not known.
  // `depth`/`originZ`/`centerZ` are `null` when the object is 2D.
  width: number | null,
  height: number | null,
  depth: number | null,
  originX: number,
  originY: number,
  originZ: number | null,
  centerX: number | null,
  centerY: number | null,
  centerZ: number | null,
|};

/**
 * Returns the default size, origin and center of an object as numeric values.
 * Uses PixiResourcesLoader to get the actual texture dimensions for Sprite objects.
 * Accepts an optional assetShortHeader for Sprite objects installed from the asset store,
 * where the texture may not yet be loaded in PixiResourcesLoader.
 * Returns 0 for width/height/depth when dimensions are not available.
 */
export const getObjectSizeInfo = (
  object: gdObject,
  project: gdProject,
  pixiResourcesLoader: any,
  assetShortHeader?: AssetShortHeader | null
): ObjectSizeInfo | null => {
  const objectConfiguration = object.getConfiguration();
  const objectType = object.getType();

  if (objectType === 'Sprite') {
    const spriteConfiguration = gd.asSpriteConfiguration(objectConfiguration);
    const animations = spriteConfiguration.getAnimations();
    const preScale = spriteConfiguration.getPreScale();
    if (
      animations.getAnimationsCount() > 0 &&
      animations.getAnimation(0).getDirectionsCount() > 0 &&
      animations
        .getAnimation(0)
        .getDirection(0)
        .getSpritesCount() > 0
    ) {
      const firstSprite = animations
        .getAnimation(0)
        .getDirection(0)
        .getSprite(0);
      const originX = firstSprite.getOrigin().getX();
      const originY = firstSprite.getOrigin().getY();

      // Determine texture dimensions: prefer assetShortHeader (reliable for freshly installed
      // assets whose texture may not be in PixiResourcesLoader yet), then fall back to the loader.
      let textureWidth = 0;
      let textureHeight = 0;
      if (assetShortHeader && assetShortHeader.width > 0) {
        textureWidth = assetShortHeader.width;
        textureHeight = assetShortHeader.height;
      } else {
        const texture = pixiResourcesLoader.getPIXITexture(
          project,
          firstSprite.getImageName()
        );
        if (texture && texture.valid && texture.width > 0) {
          textureWidth = texture.width;
          textureHeight = texture.height;
        }
      }

      if (textureWidth > 0) {
        const width = textureWidth * preScale;
        const height = textureHeight * preScale;
        const centerX = firstSprite.isDefaultCenterPoint()
          ? width / 2
          : firstSprite.getCenter().getX();
        const centerY = firstSprite.isDefaultCenterPoint()
          ? height / 2
          : firstSprite.getCenter().getY();
        return {
          width,
          height,
          depth: null,
          originX,
          originY,
          originZ: null,
          centerX,
          centerY,
          centerZ: null,
        };
      }
    }
    return null;
  }

  if (objectType === 'TiledSpriteObject::TiledSprite') {
    const config = gd.asTiledSpriteConfiguration(objectConfiguration);
    const width = config.getWidth();
    const height = config.getHeight();
    return {
      width,
      height,
      depth: null,
      originX: 0,
      originY: 0,
      originZ: null,
      centerX: width / 2,
      centerY: height / 2,
      centerZ: null,
    };
  }

  if (objectType === 'PanelSpriteObject::PanelSprite') {
    const config = gd.asPanelSpriteConfiguration(objectConfiguration);
    const width = config.getWidth();
    const height = config.getHeight();
    return {
      width,
      height,
      depth: null,
      originX: 0,
      originY: 0,
      originZ: null,
      centerX: width / 2,
      centerY: height / 2,
      centerZ: null,
    };
  }

  if (objectType === 'TextObject::Text') {
    return {
      width: null,
      height: null,
      depth: null,
      originX: 0,
      originY: 0,
      originZ: null,
      centerX: null,
      centerY: null,
      centerZ: null,
    };
  }

  if (objectType === 'TextInput::TextInputObject') {
    // Defaults match DEFAULT_WIDTH/DEFAULT_HEIGHT in Extensions/TextInput/JsExtension.js.
    const width = 300;
    const height = 30;
    return {
      width,
      height,
      depth: null,
      originX: 0,
      originY: 0,
      originZ: null,
      centerX: width / 2,
      centerY: height / 2,
      centerZ: null,
    };
  }

  if (objectType === 'Lighting::LightObject') {
    const properties = objectConfiguration.getProperties();
    const radius = properties.has('radius')
      ? parseFloat(properties.get('radius').getValue()) || 0
      : 0;
    const width = radius * 2;
    const height = radius * 2;
    return {
      width,
      height,
      depth: null,
      originX: radius,
      originY: radius,
      originZ: null,
      centerX: radius,
      centerY: radius,
      centerZ: null,
    };
  }

  if (objectType === 'Scene3D::Cube3DObject') {
    const properties = objectConfiguration.getProperties();
    const width = properties.has('width')
      ? parseFloat(properties.get('width').getValue()) || 0
      : 0;
    const height = properties.has('height')
      ? parseFloat(properties.get('height').getValue()) || 0
      : 0;
    const depth = properties.has('depth')
      ? parseFloat(properties.get('depth').getValue()) || 0
      : 0;
    return {
      width,
      height,
      depth,
      originX: 0,
      originY: 0,
      originZ: 0,
      centerX: width / 2,
      centerY: height / 2,
      centerZ: depth / 2,
    };
  }

  if (objectType === 'Scene3D::Model3DObject') {
    const config = gd.asModel3DConfiguration(objectConfiguration);
    const width = config.getWidth();
    const height = config.getHeight();
    const depth = config.getDepth();
    return {
      width,
      height,
      depth,
      originX: 0,
      originY: 0,
      originZ: 0,
      centerX: width / 2,
      centerY: height / 2,
      centerZ: depth / 2,
    };
  }

  // Events-based (custom) objects: derive size from their declared area.
  if (project.hasEventsBasedObject(objectType)) {
    const eventsBasedObject = project.getEventsBasedObject(objectType);
    const customObjectConfiguration = gd.asCustomObjectConfiguration(
      objectConfiguration
    );
    const variantName = customObjectConfiguration.getVariantName();

    const isRenderedIn3D = eventsBasedObject.isRenderedIn3D();
    const variant = eventsBasedObject.getVariants().hasVariantNamed(variantName)
      ? eventsBasedObject.getVariants().getVariant(variantName)
      : eventsBasedObject.getDefaultVariant();

    const minX = variant.getAreaMinX();
    const maxX = variant.getAreaMaxX();
    const minY = variant.getAreaMinY();
    const maxY = variant.getAreaMaxY();
    const minZ = isRenderedIn3D ? variant.getAreaMinZ() : 0;
    const maxZ = isRenderedIn3D ? variant.getAreaMaxZ() : 0;
    const width = maxX - minX;
    const height = maxY - minY;
    const depth = maxZ - minZ;

    return {
      width,
      height,
      depth: isRenderedIn3D ? depth : null,
      originX: -minX || 0,
      originY: -minY || 0,
      originZ: isRenderedIn3D ? -minZ || 0 : null,
      centerX: width / 2,
      centerY: height / 2,
      centerZ: isRenderedIn3D ? depth / 2 : null,
    };
  }

  return null;
};

const NO_INTRINSIC_SIZE_MESSAGE =
  "These objects have no intrinsic size (width/height = null in `objectSizeInfo`). For precise placement of instance(s), set the instance's size (e.g.: via `instances_size` in `put_2d_instances`). Also check origin X;Y (if 0;0, it means the instance position defines the top-left, not the center).";

/**
 * Build structured hints for an `objectSizeInfo` map.
 *
 * Returns at most one `no-intrinsic-size` entry per call, listing all objects
 * whose width/height is null. `depth` being null is normal for 2D objects —
 * not a hint trigger.
 */
export const getObjectSizeInfoHints = (objectSizeInfoByName: {
  [string]: ObjectSizeInfo | null,
}): Array<{|
  code: string,
  message: string,
  objectNames: Array<string>,
|}> => {
  const objectNames: Array<string> = [];
  for (const objectName in objectSizeInfoByName) {
    const info = objectSizeInfoByName[objectName];
    if (!info) continue;
    if (info.width === null || info.height === null) {
      objectNames.push(objectName);
    }
  }
  if (objectNames.length === 0) return [];
  return [
    {
      code: 'no-intrinsic-size',
      message: NO_INTRINSIC_SIZE_MESSAGE,
      objectNames,
    },
  ];
};

/**
 * Helper function to safely extract required string arguments.
 */
export const extractRequiredString = (
  args: any,
  propertyName: string
): string => {
  const value = SafeExtractor.extractStringProperty(args, propertyName);
  if (value === null) {
    throw new Error(
      `Missing or invalid required string argument: ${propertyName}`
    );
  }
  return value;
};

export const makeGenericFailure = (
  message: string
): EditorFunctionGenericOutput => ({
  success: false,
  message,
});

export const shouldHideProperty = (property: gdPropertyDescriptor): boolean => {
  return (
    property.isHidden() ||
    property.isDeprecated() ||
    property.getType() === 'Behavior' // No need to mess around with the "required behaviors", they are automatically filled.
  );
};

// Compact unit string: prefer the short symbol (e.g. "px", "deg") if it's
// shorter than the full unit name (e.g. "Pixel", "DegreeAngle"). Returns null
// if the property has no unit.
const getShortMeasurementUnit = (
  measurementUnit: gdMeasurementUnit
): string | null => {
  if (measurementUnit.isUndefined()) return null;
  const name = measurementUnit.getName();
  let shortLabel = '';
  try {
    const elementsCount = measurementUnit.getElementsCount();
    for (let i = 0; i < elementsCount; i++) {
      const baseUnit = measurementUnit.getElementBaseUnit(i);
      const power = measurementUnit.getElementPower(i);
      const symbol = baseUnit.getSymbol();
      if (!symbol) continue;
      shortLabel +=
        (shortLabel ? '·' : '') + symbol + (power === 1 ? '' : `^${power}`);
    }
  } catch (_) {
    // Defensive: if anything goes wrong, fall back to the name.
    return name;
  }
  if (!shortLabel) return name;
  return shortLabel.length < name.length ? shortLabel : name;
};

const getPropertyChoices = (
  property: gdPropertyDescriptor
): Array<string> | null => {
  if (property.getType().toLowerCase() !== 'choice') return null;
  return [
    ...mapVector(property.getChoices(), choice => choice.getValue()),
    // TODO Remove this once we made sure no built-in extension still use `addExtraInfo` instead of `addChoice`.
    ...property.getExtraInfo().toJSArray(),
  ];
};

// Builds a compact textual listing of properties optimized for LLM consumption:
// - Boolean values omit the type tag (the value already implies it).
// - Empty-valued properties are grouped at the end ("Empty: a, b (resource), c (string)").
// - Number units use a short symbol ("px") when shorter than the full name ("Pixel").
export const formatPropertiesList = (
  properties: gdMapStringPropertyDescriptor
): string => {
  const propertyNames = properties.keys().toJSArray();

  const nonEmptyParts: Array<string> = [];
  const emptyByType: Map<string, Array<string>> = new Map();

  for (const name of propertyNames) {
    const property = properties.get(name);
    if (shouldHideProperty(property)) continue;

    const rawType = property.getType();
    const type = rawType.toLowerCase();
    const value = property.getValue();
    const unit = getShortMeasurementUnit(property.getMeasurementUnit());
    const choices = getPropertyChoices(property);

    // Booleans are always "true"/"false" - never grouped as empty.
    if (type === 'boolean') {
      nonEmptyParts.push(`${name}: ${value || 'false'}`);
      continue;
    }

    if (value === '' || value === undefined) {
      // Group empty properties by their descriptor (type + optional unit/choices).
      const choicesText = choices
        ? `one of: [${choices.map(c => `"${c}"`).join(', ')}]`
        : null;
      const resourceKind =
        type === 'resource'
          ? (property.getExtraInfo().toJSArray()[0] || '').toLowerCase()
          : '';
      const emptyFontNote =
        resourceKind === 'font' ? ' — the default font is used' : '';
      const tag =
        [type, choicesText, unit].filter(Boolean).join(', ') + emptyFontNote;
      const list = emptyByType.get(tag) || [];
      list.push(name);
      emptyByType.set(tag, list);
      continue;
    }

    if (type === 'number') {
      nonEmptyParts.push(
        unit ? `${name}: ${value} (${unit})` : `${name}: ${value}`
      );
      continue;
    }

    const information = [
      type,
      choices ? `one of: [${choices.map(c => `"${c}"`).join(', ')}]` : null,
      unit,
    ]
      .filter(Boolean)
      .join(', ');
    nonEmptyParts.push(
      information ? `${name}: ${value} (${information})` : `${name}: ${value}`
    );
  }

  const emptyParts: Array<string> = [];
  for (const [tag, names] of emptyByType.entries()) {
    emptyParts.push(tag ? `${names.join(', ')} (${tag})` : names.join(', '));
  }

  const segments = [];
  if (nonEmptyParts.length > 0) segments.push(nonEmptyParts.join(', '));
  if (emptyParts.length > 0) segments.push(`Empty: ${emptyParts.join(', ')}`);

  return segments.join('. ');
};

/**
 * Serializes an instance the way `describe_instances` does (the
 * `SimplifiedInstance` shape declared by the script API), so every read of
 * instances - scenes and custom object variants alike - returns the same
 * fields. `defaultSize` is the size of the instance's object, used when the
 * instance has no custom size.
 */
export const getSimplifiedInstance = (
  instance: gdInitialInstance,
  defaultSize: {
    +width: number | null,
    +height: number | null,
    +depth: number | null,
    ...
  } | null
): Object => {
  const width = instance.hasCustomSize()
    ? instance.getCustomWidth()
    : defaultSize
    ? defaultSize.width
    : null;
  const height = instance.hasCustomSize()
    ? instance.getCustomHeight()
    : defaultSize
    ? defaultSize.height
    : null;
  const depth = instance.hasCustomDepth()
    ? instance.getCustomDepth()
    : defaultSize
    ? defaultSize.depth
    : null;

  const serializedInstance = serializeToJSObject(instance);
  return {
    ...serializedInstance,
    // Replace persistentUuid by id:
    persistentUuid: undefined,
    id: instance.getPersistentUuid().slice(0, 10),
    // The serializer omits z when it's 0 - always expose it for 3D objects:
    z: depth !== null ? instance.getZ() : undefined,
    // Actual computed dimensions (accounting for default size when no custom size is set):
    width,
    height,
    depth,
    // Expose the per-instance variables (overrides of the object
    // variables), but only when there are some, to keep the output
    // compact. Absence means the instance uses the object variables.
    initialVariables:
      serializedInstance.initialVariables &&
      serializedInstance.initialVariables.length > 0
        ? serializedInstance.initialVariables
        : undefined,
    // For now, don't expose these:
    numberProperties: undefined,
    stringProperties: undefined,
  };
};
