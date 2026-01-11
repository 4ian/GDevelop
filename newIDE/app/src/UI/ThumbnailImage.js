// @flow
import * as React from 'react';
import { CorsAwareImage } from './CorsAwareImage';
import { type Thumbnail, getSpritesheetFrameStyles } from '../ObjectsRendering/Thumbnail';
import { useThumbnail } from '../ObjectsRendering/useThumbnail';

type Props = {|
  /** The project is required to load spritesheet data */
  project: ?gdProject,
  /** The thumbnail to display */
  thumbnail: ?Thumbnail,
  /** Alt text for the image */
  alt?: string,
  /** Tooltip for the image */
  title?: string,
  /** Maximum width for the thumbnail (used for scaling) */
  maxWidth?: number,
  /** Maximum height for the thumbnail (used for scaling) */
  maxHeight?: number,
  /** Additional styles for the image (for regular images) or container (for spritesheet frames) */
  style?: Object,
  /** Additional styles for the image element specifically */
  imageStyle?: Object,
  /** Filter to apply to the image (e.g., for dark mode) */
  filter?: string,
  /** Called when the image is loaded */
  onLoad?: () => void,
  /** Called when the image fails to load */
  onError?: () => void,
|};

/**
 * A component that displays a thumbnail, handling both regular images
 * and spritesheet frames. For spritesheet frames, it uses a div container
 * with proper CSS transforms to crop and scale the frame.
 */
const ThumbnailImage = ({
  project,
  thumbnail,
  alt,
  title,
  maxWidth,
  maxHeight,
  style,
  imageStyle,
  filter,
  onLoad,
  onError,
}: Props): React.Node => {
  const { isLoading, imageSrc, frameData, isSpritesheetFrame } = useThumbnail(
    project,
    thumbnail
  );

  // For spritesheet frames, render with container and transformed image
  if (isSpritesheetFrame) {
    if (isLoading || !frameData) {
      // Return a placeholder or nothing while loading
      return null;
    }

    const { containerStyle, imageStyle: frameImageStyle } = getSpritesheetFrameStyles(
      frameData,
      maxWidth,
      maxHeight
    );

    return (
      <div style={{ ...containerStyle, ...style }} title={title}>
        <CorsAwareImage
          alt={alt}
          src={frameData.imageSrc}
          style={{
            ...frameImageStyle,
            filter,
            ...imageStyle,
          }}
          onLoad={onLoad}
          onError={onError}
        />
      </div>
    );
  }

  // For regular images, render directly
  if (!imageSrc) {
    return null;
  }

  const regularImageStyle = {
    maxWidth: maxWidth,
    maxHeight: maxHeight,
    filter,
    ...imageStyle,
  };

  return (
    <CorsAwareImage
      alt={alt}
      title={title}
      src={imageSrc}
      style={{ ...regularImageStyle, ...style }}
      onLoad={onLoad}
      onError={onError}
    />
  );
};

export default ThumbnailImage;
