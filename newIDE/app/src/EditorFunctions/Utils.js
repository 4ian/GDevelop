// @flow
import { type AssetShortHeader } from '../Utils/GDevelopServices/Asset';

const gd: libGDevelop = global.gd;

/**
 * Returns size, origin and center for an asset short header.
 * Returns null for object types where this information cannot be determined statically.
 */
export const getObjectSizeAndOriginInfo = (
  object: gdObject,
  project: gdProject,
  assetShortHeader?: AssetShortHeader | null
): {| size: string, origin: string, center: string |} | null => {
  const objectConfiguration = object.getConfiguration();
  const objectType = object.getType();

  if (objectType === 'Sprite') {
    const spriteConfiguration = gd.asSpriteConfiguration(objectConfiguration);
    const animations = spriteConfiguration.getAnimations();
    if (
      animations.getAnimationsCount() > 0 &&
      animations.getAnimation(0).getDirectionsCount() > 0 &&
      animations
        .getAnimation(0)
        .getDirection(0)
        .getSpritesCount() > 0
    ) {
      const sprite = animations
        .getAnimation(0)
        .getDirection(0)
        .getSprite(0);
      const origin = sprite.getOrigin();
      const originStr = `${origin.getX()};${origin.getY()}`;

      let centerStr;
      if (sprite.isDefaultCenterPoint()) {
        centerStr =
          assetShortHeader != null
            ? `${assetShortHeader.width / 2};${assetShortHeader.height / 2}`
            : 'center of image';
      } else {
        const center = sprite.getCenter();
        centerStr = `${center.getX()};${center.getY()}`;
      }

      const sizeStr =
        assetShortHeader != null
          ? `${assetShortHeader.width}x${assetShortHeader.height}`
          : 'unknown';

      return { size: sizeStr, origin: originStr, center: centerStr };
    }
    return null;
  }

  if (objectType === 'TiledSpriteObject::TiledSprite') {
    const config = gd.asTiledSpriteConfiguration(objectConfiguration);
    const width = config.getWidth();
    const height = config.getHeight();
    return {
      size: `${width}x${height}`,
      origin: '0;0',
      center: `${width / 2};${height / 2}`,
    };
  }

  if (objectType === 'PanelSpriteObject::PanelSprite') {
    const config = gd.asPanelSpriteConfiguration(objectConfiguration);
    const width = config.getWidth();
    const height = config.getHeight();
    return {
      size: `${width}x${height}`,
      origin: '0;0',
      center: `${width / 2};${height / 2}`,
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

    const origin = `${-minX};${-minY}${isRenderedIn3D ? `;${-minZ}` : ''}`;
    const center = `${width / 2};${height / 2}${
      isRenderedIn3D ? `;${depth / 2}` : ''
    }`;
    return {
      size: `${width}x${height}${isRenderedIn3D ? `x${depth}` : ''}`,
      origin,
      center,
    };
  }

  return null;
};
