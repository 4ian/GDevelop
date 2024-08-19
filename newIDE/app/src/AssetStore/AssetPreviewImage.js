// @flow
import * as React from 'react';
import {
  type AssetShortHeader,
  isPixelArt,
  isPrivateAsset,
} from '../Utils/GDevelopServices/Asset';
import { getPixelatedImageRendering } from '../Utils/CssHelpers';
import { CorsAwareImage } from '../UI/CorsAwareImage';
import AuthorizedAssetImage from './PrivateAssets/AuthorizedAssetImage';

const paddingSize = 10;
const styles = {
  previewImage: {
    position: 'relative',
    objectFit: 'contain',
    verticalAlign: 'middle',
    pointerEvents: 'none',
  },
  previewImagePixelated: {
    width: '100%',
    imageRendering: getPixelatedImageRendering(),
    padding: 15,
  },
};

type Props = {|
  assetShortHeader: AssetShortHeader,
  maxSize?: number,
|};

export const AssetPreviewImage = ({ assetShortHeader, maxSize }: Props) => {
  const previewImageUrl = assetShortHeader.previewImageUrls[0];
  const isPrivate = isPrivateAsset(assetShortHeader);
  const style = {
    maxWidth: maxSize ? maxSize - 2 * paddingSize : '100%',
    maxHeight: maxSize ? maxSize - 2 * paddingSize : '100%',
    ...styles.previewImage,
    ...(isPixelArt(assetShortHeader)
      ? styles.previewImagePixelated
      : undefined),
  };
  return isPrivate ? (
    <AuthorizedAssetImage
      key={previewImageUrl}
      style={style}
      url={previewImageUrl}
      alt={assetShortHeader.name}
    />
  ) : (
    <CorsAwareImage
      key={previewImageUrl}
      style={style}
      src={previewImageUrl}
      alt={assetShortHeader.name}
    />
  );
};
