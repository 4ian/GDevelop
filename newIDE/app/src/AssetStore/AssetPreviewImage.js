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
    transition: 'opacity 0.1s ease-in-out',
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
  loading?: 'lazy',
|};

export const AssetPreviewImage = ({
  assetShortHeader,
  maxSize,
  loading,
}: Props) => {
  const previewImageUrl = assetShortHeader.previewImageUrls[0];
  const isPrivate = isPrivateAsset(assetShortHeader);
  const [isLoaded, setIsLoaded] = React.useState(false);
  const onLoad = React.useCallback(() => setIsLoaded(true), []);
  const style = React.useMemo(
    () => ({
      maxWidth: maxSize ? maxSize - 2 * paddingSize : '100%',
      maxHeight: maxSize ? maxSize - 2 * paddingSize : '100%',
      opacity: isLoaded ? 1 : 0,
      ...styles.previewImage,
      ...(isPixelArt(assetShortHeader)
        ? styles.previewImagePixelated
        : undefined),
    }),
    [isLoaded, maxSize, assetShortHeader]
  );

  return isPrivate ? (
    <AuthorizedAssetImage
      key={previewImageUrl}
      style={style}
      url={previewImageUrl}
      alt={assetShortHeader.name}
      onLoad={onLoad}
      loading={loading}
    />
  ) : (
    <CorsAwareImage
      key={previewImageUrl}
      style={style}
      src={previewImageUrl}
      alt={assetShortHeader.name}
      onLoad={onLoad}
      loading={loading}
    />
  );
};
