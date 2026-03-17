// @flow
import { type AssetShortHeader } from '../Utils/GDevelopServices/Asset';

const gd: libGDevelop = global.gd;

export type ObjectSizeInfo = {|
  width: number,
  height: number,
  depth: number,
  originX: number,
  originY: number,
  originZ: number,
  centerX: number,
  centerY: number,
  centerZ: number,
|};

/**
 * Returns the default size, origin and center of an object as numeric values.
 * Uses PixiResourcesLoader to get the actual texture dimensions for Sprite objects.
 * Accepts an optional assetShortHeader for Sprite objects installed from the asset store,
 * where the texture may not yet be loaded in PixiResourcesLoader.
 * Always returns a value — falls back to 32x32x0 for unknown/unsupported types.
 */
export const getObjectSizeInfo = (
  object: gdObject,
  project: gdProject,
  pixiResourcesLoader: any,
  assetShortHeader?: AssetShortHeader | null
): ObjectSizeInfo => {
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
          depth: 0,
          originX,
          originY,
          originZ: 0,
          centerX,
          centerY,
          centerZ: 0,
        };
      }
    }
    return {
      width: 32,
      height: 32,
      depth: 0,
      originX: 0,
      originY: 0,
      originZ: 0,
      centerX: 16,
      centerY: 16,
      centerZ: 0,
    };
  }

  if (objectType === 'TiledSpriteObject::TiledSprite') {
    const config = gd.asTiledSpriteConfiguration(objectConfiguration);
    const width = config.getWidth();
    const height = config.getHeight();
    return {
      width,
      height,
      depth: 0,
      originX: 0,
      originY: 0,
      originZ: 0,
      centerX: width / 2,
      centerY: height / 2,
      centerZ: 0,
    };
  }

  if (objectType === 'PanelSpriteObject::PanelSprite') {
    const config = gd.asPanelSpriteConfiguration(objectConfiguration);
    const width = config.getWidth();
    const height = config.getHeight();
    return {
      width,
      height,
      depth: 0,
      originX: 0,
      originY: 0,
      originZ: 0,
      centerX: width / 2,
      centerY: height / 2,
      centerZ: 0,
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
    const width = maxX - minX || 48;
    const height = maxY - minY || 48;
    const depth = maxZ - minZ;

    return {
      width,
      height,
      depth,
      originX: -minX || 0,
      originY: -minY || 0,
      originZ: -minZ || 0,
      centerX: width / 2,
      centerY: height / 2,
      centerZ: depth / 2,
    };
  }

  return {
    width: 32,
    height: 32,
    depth: 0,
    originX: 0,
    originY: 0,
    originZ: 0,
    centerX: 16,
    centerY: 16,
    centerZ: 0,
  };
};
