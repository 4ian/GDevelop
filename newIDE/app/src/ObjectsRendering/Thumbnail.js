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
 * Data needed to render a spritesheet frame, extracted from PIXI texture.
 */
export type SpritesheetFrameData = {|
  /** The source URL of the spritesheet image */
  imageSrc: string,
  /** The frame rectangle in the spritesheet (x, y, width, height) */
  frame: {| x: number, y: number, width: number, height: number |},
  /** The original size of the frame (for trimmed sprites, this is the untrimmed size) */
  originalSize: {| width: number, height: number |},
  /** Whether the image should be rendered smooth or pixelated */
  isSmooth: boolean,
|};

/**
 * Calculates the CSS styles needed to display a spritesheet frame.
 * Uses a div container with overflow:hidden and transforms to crop/scale the image.
 */
export const getSpritesheetFrameStyles = (
  frameData: SpritesheetFrameData,
  maxWidth: ?number,
  maxHeight: ?number
): {|
  containerStyle: {|
    position: 'relative',
    overflow: 'hidden',
    width: number,
    height: number,
    display: 'inline-block',
    lineHeight: 0,
  |},
  imageStyle: {|
    position: 'absolute',
    top: 0,
    left: 0,
    display: 'block',
    transformOrigin: 'top left',
    transform: string,
    imageRendering: 'auto' | 'pixelated',
    maxWidth: 'none',
    maxHeight: 'none',
  |},
|} => {
  const { frame } = frameData;

  const baseW = frame.width;
  const baseH = frame.height;

  const scale =
    maxWidth != null && maxHeight != null
      ? Math.min(maxWidth / baseW, maxHeight / baseH, 1)
      : 1;

  // Calculate the offset to position the frame at (0,0) in the container
  const offsetX = frame.x * scale;
  const offsetY = frame.y * scale;

  return {
    containerStyle: {
      position: 'relative',
      overflow: 'hidden',
      width: Math.round(baseW * scale),
      height: Math.round(baseH * scale),
      display: 'inline-block',
      lineHeight: 0,
    },
    imageStyle: {
      position: 'absolute',
      top: 0,
      left: 0,
      display: 'block',
      transformOrigin: 'top left',
      transform: `translate(${-offsetX}px, ${-offsetY}px) scale(${scale})`,
      imageRendering: frameData.isSmooth ? 'auto' : 'pixelated',
      maxWidth: 'none',
      maxHeight: 'none',
    },
  };
};

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
