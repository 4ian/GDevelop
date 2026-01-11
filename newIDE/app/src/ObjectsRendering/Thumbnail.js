// @flow

/**
 * Represents a thumbnail that can be either a full image or a spritesheet frame.
 */
export type Thumbnail = {|
  /** The URL of the image to display (for regular images, or the spritesheet image for spritesheet frames) */
  thumbnailSrc: string,
  /**
   * If set, indicates this is a spritesheet frame.
   * The spritesheet resource name and frame name are stored for loading the spritesheet data.
   */
  spritesheetFrame?: {|
    spritesheetResourceName: string,
    frameName: string,
  |},
|};

/**
 * Gets the image URL and optional spritesheet frame info from a sprite.
 * This is a helper to extract thumbnail information from a gdSprite.
 */
export const getThumbnailFromSprite = (
  sprite: gdSprite,
  resourcesLoader: {
    +getResourceFullUrl: (project: gdProject, resourceName: string, options: any) => string,
    ...
  },
  project: gdProject
): Thumbnail => {
  if (sprite.usesSpritesheetFrame()) {
    const spritesheetResourceName = sprite.getSpritesheetResourceName();
    const frameName = sprite.getSpritesheetFrameName();

    // Return the spritesheet resource name (for loading the spritesheet to get the frame)
    // We use a placeholder URL for thumbnailSrc - it will be replaced when the spritesheet is loaded
    return {
      // Use a placeholder - the actual image URL will be loaded from the spritesheet
      thumbnailSrc: 'res/unknown32.png',
      spritesheetFrame: {
        spritesheetResourceName,
        frameName,
      },
    };
  }

  // Regular image resource
  return {
    thumbnailSrc: resourcesLoader.getResourceFullUrl(
      project,
      sprite.getImageName(),
      {}
    ),
  };
};

/**
 * Create a simple thumbnail from just a URL.
 */
export const makeThumbnailFromUrl = (thumbnailSrc: string): Thumbnail => ({
  thumbnailSrc,
});

/**
 * Helper type for representing sprite image information
 * that can be used for displaying the sprite in editors.
 */
export type SpriteImageInfo = {|
  /** The resource name to display (either the image resource or a derived name) */
  resourceName: string,
  /**
   * If set, indicates this is a spritesheet frame.
   */
  spritesheetFrame?: {|
    spritesheetResourceName: string,
    frameName: string,
  |},
|};

/**
 * Gets the image information from a sprite for display purposes.
 * This can be used in editors like CollisionMasksEditor and PointsEditor.
 */
export const getSpriteImageInfo = (sprite: gdSprite): SpriteImageInfo => {
  if (sprite.usesSpritesheetFrame()) {
    return {
      resourceName: `${sprite.getSpritesheetResourceName()}:${sprite.getSpritesheetFrameName()}`,
      spritesheetFrame: {
        spritesheetResourceName: sprite.getSpritesheetResourceName(),
        frameName: sprite.getSpritesheetFrameName(),
      },
    };
  }

  return {
    resourceName: sprite.getImageName(),
  };
};
