// @flow
import * as React from 'react';
import { type AssetShortHeader } from '../Utils/GDevelopServices/Asset';
import Text from '../UI/Text';
import CheckeredBackground from '../ResourcesList/CheckeredBackground';
import { textEllipsisStyle } from '../UI/TextEllipsis';
import { AssetPreviewImage } from './AssetPreviewImage';

const styles = {
  previewContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContainer: {
    overflow: 'hidden',
    position: 'relative',
    borderRadius: 8,
  },
  titleContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    color: '#fff',
    backgroundColor: 'rgb(0,0,0,0.5)',
    display: 'inline-block', // Necessary to have the text ellipsis working.
    textAlign: 'center',
    flexDirection: 'column',
  },
  title: {
    ...textEllipsisStyle,
    overflowWrap: 'break-word',
  },
};

type Props = {|
  id?: string,
  // If a size is given, the card is displayed at this fixed (square) size.
  // Otherwise, it fills the width of its container and stays square.
  size?: number,
  assetShortHeader: AssetShortHeader,
  hideShortDescription?: boolean,
|};

export const AssetCard = ({
  id,
  assetShortHeader,
  size,
  hideShortDescription,
}: Props): React.MixedElement => {
  const displayShortDescription =
    !hideShortDescription && !!assetShortHeader.shortDescription;

  const sizeStyle =
    size != null
      ? { width: size, height: size }
      : { width: '100%', aspectRatio: '1 / 1' };

  return (
    <div id={id} style={{ ...styles.cardContainer, ...sizeStyle }}>
      <div
        style={{ ...styles.previewContainer, width: '100%', height: '100%' }}
      >
        <CheckeredBackground />
        <AssetPreviewImage
          assetShortHeader={assetShortHeader}
          maxSize={size}
          loading="lazy"
        />
      </div>
      <div
        style={{
          ...styles.titleContainer,
          height: displayShortDescription ? 40 : 20,
        }}
      >
        <Text noMargin style={styles.title} color="inherit">
          {assetShortHeader.name}
        </Text>
        {displayShortDescription && (
          <Text noMargin style={styles.title} size="body2" color="inherit">
            {assetShortHeader.shortDescription}
          </Text>
        )}
      </div>
    </div>
  );
};
