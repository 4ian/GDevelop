// @flow
import { type AssetShortHeader } from '../Utils/GDevelopServices/Asset';

const gd: libGDevelop = global.gd;

export type ObjectSizeInfo = {|
  // `width`/`height`/`centerX`/`centerY` are `null` when the object has no
  // intrinsic size (e.g. TextObject, where width/height depend on the rendered
  // text and must be defined per-instance via `customSize`). The instance
  // position is still meaningful in that case — it is the object's origin.
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
    // TextObject has no intrinsic size: width/height depend on the rendered
    // text and the font, and the engine cannot know them without rendering.
    // Origin is the top-left of the object — instances should set their own
    // width/height (via `customSize`) to define a box the text lives in.
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

/**
 * Build hint strings for an `objectSizeInfo` map, intended to be surfaced to
 * the AI as a `hints` field on the tool result. The goal is to make the LLM
 * stop assuming "X,Y is the center" for objects whose size is not known
 * intrinsically (typically TextObject): when width/height is null, the
 * instance position is the object's origin (top-left for these objects), and
 * the instance MUST define its own width/height to have a well-defined box.
 */
export const getObjectSizeInfoHints = (objectSizeInfoByName: {
  [string]: ObjectSizeInfo | null,
}): Array<string> => {
  const hints: Array<string> = [];
  for (const objectName in objectSizeInfoByName) {
    const info = objectSizeInfoByName[objectName];
    if (!info) continue;
    // `depth` being null is normal for 2D objects — don't warn about that.
    if (info.width === null || info.height === null) {
      hints.push(
        `Object "${objectName}" has no intrinsic size (width/height are null in objectSizeInfo). Its instance position (X, Y) is the top-left of its origin; the instance should define its own width and height (e.g. via \`instances_size\` in put_2d_instances) so the box and any centered/aligned content is well-defined. Do not assume X, Y is the center of the rendered object.`
      );
    }
  }
  return hints;
};
