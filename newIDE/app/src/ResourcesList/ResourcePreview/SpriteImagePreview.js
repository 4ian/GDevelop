// @flow
import * as React from 'react';
import ImagePreview, { isProjectImageResourceSmooth } from './ImagePreview';
import PixiResourcesLoader from '../../ObjectsRendering/PixiResourcesLoader';
import ResourcesLoader from '../../ResourcesLoader';

type Props = {|
  project: gdProject,
  sprite: gdSprite,
  onImageSize?: ([number, number]) => void,
  renderOverlay?: ({|
    imageWidth: number,
    imageHeight: number,
    imageOffsetTop: number,
    imageOffsetLeft: number,
    imageZoomFactor: number,
    forcedCursor: string | null,
    deactivateControls?: boolean,
  |}) => React.Node,
|};

/**
 * A component that displays a sprite image, handling both regular images
 * and spritesheet frames. For regular images, it uses ImagePreview directly.
 * For spritesheet frames, it loads the spritesheet and displays the
 * specific frame.
 */
const SpriteImagePreview = ({
  project,
  sprite,
  onImageSize,
  renderOverlay,
}: Props) => {
  const [imageSource, setImageSource] = React.useState<string>('');
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [frameSize, setFrameSize] = React.useState<[number, number] | null>(
    null
  );

  const usesSpritesheetFrame = sprite.usesSpritesheetFrame();
  const spritesheetResourceName = usesSpritesheetFrame
    ? sprite.getSpritesheetResourceName()
    : '';
  const frameName = usesSpritesheetFrame ? sprite.getSpritesheetFrameName() : '';
  const resourceName = usesSpritesheetFrame ? '' : sprite.getImageName();

  // Load spritesheet data if this is a spritesheet frame
  React.useEffect(
    () => {
      if (!usesSpritesheetFrame) {
        setImageSource('');
        setFrameSize(null);
        return;
      }

      let cancelled = false;
      setIsLoading(true);

      (async () => {
        const spritesheetData = await PixiResourcesLoader.getSpritesheet(
          project,
          spritesheetResourceName
        );
        if (cancelled) return;

        if (spritesheetData && spritesheetData.spritesheet) {
          const texture = spritesheetData.spritesheet.textures[frameName];
          if (texture && texture.frame && texture.orig) {
            // Get the image source from the base texture
            if (
              texture.baseTexture &&
              texture.baseTexture.resource &&
              texture.baseTexture.resource.source instanceof HTMLImageElement
            ) {
              setImageSource(texture.baseTexture.resource.source.src);
              setFrameSize([texture.orig.width, texture.orig.height]);
            }
          }
        }
        setIsLoading(false);
      })();

      return () => {
        cancelled = true;
      };
    },
    [project, usesSpritesheetFrame, spritesheetResourceName, frameName]
  );

  // Handle the image size callback to return the frame size for spritesheet frames
  const handleImageSize = React.useCallback(
    (size: [number, number]) => {
      // For spritesheet frames, the actual size is the frame size
      if (usesSpritesheetFrame && onImageSize && frameSize) {
        onImageSize(frameSize);
      } else if (onImageSize) {
        onImageSize(size);
      }
    },
    [onImageSize, frameSize, usesSpritesheetFrame]
  );

  // Create a wrapper for the overlay that uses the frame dimensions for spritesheet frames
  const renderOverlayWithFrameSize = React.useCallback(
    overlayProps => {
      if (!renderOverlay) return null;

      if (usesSpritesheetFrame && frameSize) {
        return renderOverlay({
          ...overlayProps,
          imageWidth: frameSize[0],
          imageHeight: frameSize[1],
        });
      }
      return renderOverlay(overlayProps);
    },
    [renderOverlay, frameSize, usesSpritesheetFrame]
  );

  // For regular images
  if (!usesSpritesheetFrame) {
    const imageResourceSource = ResourcesLoader.getResourceFullUrl(
      project,
      resourceName,
      {}
    );
    const isSmooth = isProjectImageResourceSmooth(project, resourceName);

    return (
      <ImagePreview
        resourceName={resourceName}
        imageResourceSource={imageResourceSource}
        isImageResourceSmooth={isSmooth}
        onImageSize={onImageSize}
        renderOverlay={renderOverlay}
      />
    );
  }

  // For spritesheet frames - loading state
  if (isLoading || !imageSource) {
    return (
      <ImagePreview
        resourceName=""
        imageResourceSource=""
        isImageResourceSmooth={false}
        onImageSize={onImageSize}
        renderOverlay={renderOverlay}
      />
    );
  }

  // For spritesheet frames - loaded
  return (
    <ImagePreview
      resourceName={`${spritesheetResourceName}:${frameName}`}
      imageResourceSource={imageSource}
      isImageResourceSmooth={false}
      onImageSize={handleImageSize}
      renderOverlay={renderOverlayWithFrameSize}
    />
  );
};

export default SpriteImagePreview;
