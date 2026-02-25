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
    const minX = eventsBasedObject.getAreaMinX();
    const maxX = eventsBasedObject.getAreaMaxX();
    const minY = eventsBasedObject.getAreaMinY();
    const maxY = eventsBasedObject.getAreaMaxY();
    const width = maxX - minX;
    const height = maxY - minY;
    return {
      size: `${width}x${height}`,
      origin: '0;0',
      center: `${(minX + maxX) / 2};${(minY + maxY) / 2}`,
    };
  }

  return null;
};
