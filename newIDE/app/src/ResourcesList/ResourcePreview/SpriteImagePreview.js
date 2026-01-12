// @flow
import * as React from 'react';
import ImagePreview, {
  isProjectImageResourceSmooth,
  type SpritesheetFrameForPreview,
} from './ImagePreview';
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
 * For spritesheet frames, it loads the spritesheet and uses ImagePreview's
 * spritesheetFrame prop to display only the specific frame.
 */
const SpriteImagePreview = ({
  project,
  sprite,
  onImageSize,
  renderOverlay,
}: Props) => {
  const [spritesheetFrame, setSpritesheetFrame] = React.useState<?SpritesheetFrameForPreview>(
    null
  );
  const [spritesheetImageSrc, setSpritesheetImageSrc] = React.useState<string>(
    ''
  );
  const [isLoading, setIsLoading] = React.useState<boolean>(false);

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
        setSpritesheetFrame(null);
        setSpritesheetImageSrc('');
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
          setSpritesheetFrame(null);
          setSpritesheetImageSrc('');
          setIsLoading(false);
          return;
        }

        const texture = spritesheet.textures[frameName];
        if (!texture || !texture.frame) {
          setSpritesheetFrame(null);
          setSpritesheetImageSrc('');
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
          setSpritesheetFrame(null);
          setSpritesheetImageSrc('');
          setIsLoading(false);
          return;
        }

        setSpritesheetImageSrc(imageSrc);
        setSpritesheetFrame({
          x: texture.frame.x,
          y: texture.frame.y,
          width: texture.frame.width,
          height: texture.frame.height,
        });
        setIsLoading(false);
      })();

      return () => {
        cancelled = true;
      };
    },
    [project, usesSpritesheetFrame, spritesheetResourceName, frameName]
  );

  // For regular images, use ImagePreview directly
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

  // For spritesheet frames - loading state or missing data
  if (isLoading || !spritesheetFrame || !spritesheetImageSrc) {
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

  // Get the isSmooth setting from the spritesheet resource
  const isSmooth = isProjectImageResourceSmooth(project, spritesheetResourceName);

  // For spritesheet frames - use ImagePreview with spritesheetFrame prop
  return (
    <ImagePreview
      resourceName={`${spritesheetResourceName}:${frameName}`}
      imageResourceSource={spritesheetImageSrc}
      isImageResourceSmooth={isSmooth}
      onImageSize={onImageSize}
      renderOverlay={renderOverlay}
      spritesheetFrame={spritesheetFrame}
    />
  );
};

export default SpriteImagePreview;
