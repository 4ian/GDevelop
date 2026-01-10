// @flow
import * as React from 'react';
import { CorsAwareImage } from '../UI/CorsAwareImage';
import {
  type ObjectThumbnail,
  getSpritesheetFrameImageStyle,
  useSpritesheetFrameData,
} from './Thumbnail';

type Props = {|
  thumbnail: ObjectThumbnail,
  size?: number,
  maxWidth?: number,
  maxHeight?: number,
  style?: Object,
  containerStyle?: Object,
  className?: string,
  alt?: string,
|};

const ObjectThumbnailImage = ({
  thumbnail,
  size,
  maxWidth,
  maxHeight,
  style,
  containerStyle,
  className,
  alt,
}: Props) => {
  const spritesheetFrameData = useSpritesheetFrameData(
    thumbnail.project,
    thumbnail.spritesheetResourceName,
    thumbnail.spritesheetFrameName
  );

  const displaySrc = spritesheetFrameData
    ? spritesheetFrameData.imageSrc
    : thumbnail.thumbnailSrc;

  const maxWidthValue = size || maxWidth;
  const maxHeightValue = size || maxHeight;

  const frameStyle = spritesheetFrameData
    ? getSpritesheetFrameImageStyle(
        spritesheetFrameData,
        maxWidthValue,
        maxHeightValue
      )
    : null;

  const imageStyle = frameStyle || {
    maxWidth: maxWidthValue,
    maxHeight: maxHeightValue,
  };

  const containerWidth =
    size || maxWidthValue || (frameStyle ? frameStyle.width : undefined);
  const containerHeight =
    size || maxHeightValue || (frameStyle ? frameStyle.height : undefined);

  const combinedImageStyle = frameStyle
    ? {
        ...style,
        ...frameStyle,
      }
    : {
        ...imageStyle,
        ...style,
      };

  return (
    <div
      className={className}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        width: containerWidth,
        height: containerHeight,
        ...containerStyle,
      }}
    >
      <CorsAwareImage
        alt={alt || ''}
        src={displaySrc}
        style={combinedImageStyle}
      />
    </div>
  );
};

export default ObjectThumbnailImage;
