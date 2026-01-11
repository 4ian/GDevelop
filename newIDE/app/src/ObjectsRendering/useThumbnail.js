// @flow
import * as React from 'react';
import PixiResourcesLoader from './PixiResourcesLoader';
import { type Thumbnail, type SpritesheetFrameData } from './Thumbnail';

export type ThumbnailResult = {|
  /** Whether the thumbnail is currently loading */
  isLoading: boolean,
  /** For regular images, this is the image src. For spritesheet frames, this is null (use frameData instead) */
  imageSrc: ?string,
  /** For spritesheet frames, this contains the data needed to render the frame */
  frameData: ?SpritesheetFrameData,
  /** Whether this is a spritesheet frame */
  isSpritesheetFrame: boolean,
|};

/**
 * A hook that loads thumbnail data for display.
 * For regular images, it returns the image src directly.
 * For spritesheet frames, it loads the spritesheet and returns the frame data.
 */
export const useThumbnail = (
  project: ?gdProject,
  thumbnail: ?Thumbnail
): ThumbnailResult => {
  const [isLoading, setIsLoading] = React.useState(false);
  const [frameData, setFrameData] = React.useState<?SpritesheetFrameData>(null);

  const spritesheetFrame = thumbnail ? thumbnail.spritesheetFrame : null;
  const spritesheetResourceName = spritesheetFrame
    ? spritesheetFrame.spritesheetResourceName
    : null;
  const frameName = spritesheetFrame ? spritesheetFrame.frameName : null;
  const isSpritesheetFrame = !!spritesheetFrame;

  React.useEffect(
    () => {
      if (!project || !spritesheetResourceName || !frameName) {
        setFrameData(null);
        return;
      }

      let cancelled = false;
      setIsLoading(true);

      (async () => {
        const spritesheetOrLoadingError = await PixiResourcesLoader.getSpritesheet(
          project,
          spritesheetResourceName
        );

        if (cancelled) return;

        const spritesheet = spritesheetOrLoadingError.spritesheet;
        if (!spritesheet) {
          setFrameData(null);
          setIsLoading(false);
          return;
        }

        const texture = spritesheet.textures[frameName];
        if (!texture || !texture.frame || !texture.orig) {
          setFrameData(null);
          setIsLoading(false);
          return;
        }

        // Get the image source from the base texture
        let imageSrc = '';
        if (
          texture.baseTexture &&
          texture.baseTexture.resource &&
          texture.baseTexture.resource.source instanceof HTMLImageElement
        ) {
          imageSrc = texture.baseTexture.resource.source.src;
        }

        if (!imageSrc) {
          setFrameData(null);
          setIsLoading(false);
          return;
        }

        // Spritesheets are typically pixel art, so default to not smooth
        const isSmooth = false;

        setFrameData({
          imageSrc,
          frame: {
            x: texture.frame.x,
            y: texture.frame.y,
            width: texture.frame.width,
            height: texture.frame.height,
          },
          originalSize: {
            width: texture.orig.width,
            height: texture.orig.height,
          },
          isSmooth,
        });
        setIsLoading(false);
      })();

      return () => {
        cancelled = true;
      };
    },
    [project, spritesheetResourceName, frameName]
  );

  // For regular images (no spritesheet frame)
  if (!isSpritesheetFrame) {
    return {
      isLoading: false,
      imageSrc: thumbnail ? thumbnail.thumbnailSrc : null,
      frameData: null,
      isSpritesheetFrame: false,
    };
  }

  // For spritesheet frames
  return {
    isLoading,
    imageSrc: null,
    frameData,
    isSpritesheetFrame: true,
  };
};
