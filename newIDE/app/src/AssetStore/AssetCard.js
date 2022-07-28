// @flow
import * as React from 'react';
import {
  type AssetShortHeader,
  isPixelArt,
} from '../Utils/GDevelopServices/Asset';
import { getPixelatedImageRendering } from '../Utils/CssHelpers';
import ButtonBase from '@material-ui/core/ButtonBase';
import Text from '../UI/Text';
import { CorsAwareImage } from '../UI/CorsAwareImage';
import CheckeredBackground from '../ResourcesList/CheckeredBackground';

const paddingSize = 10;
const styles = {
  previewContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
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
  icon: {
    color: '#fff',
  },
  cardContainer: {
    overflow: 'hidden',
    position: 'relative',
  },
  titleContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 48,
    color: '#fff',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    backgroundColor: 'rgb(0,0,0,0.5)',
  },
  title: {
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
};

type Props = {|
  size: number,
  assetShortHeader: AssetShortHeader,
  onOpenDetails: () => void,
|};

export const AssetCard = ({ assetShortHeader, onOpenDetails, size }: Props) => {
  return (
    <ButtonBase onClick={onOpenDetails} focusRipple>
      <div style={{ ...styles.cardContainer, width: size, height: size }}>
        <div style={{ ...styles.previewContainer, width: size, height: size }}>
          <CheckeredBackground />
          <CorsAwareImage
            key={assetShortHeader.previewImageUrls[0]}
            style={{
              maxWidth: 128 - 2 * paddingSize,
              maxHeight: 128 - 2 * paddingSize,
              ...styles.previewImage,
              ...(isPixelArt(assetShortHeader)
                ? styles.previewImagePixelated
                : undefined),
            }}
            src={assetShortHeader.previewImageUrls[0]}
            alt={assetShortHeader.name}
          />
        </div>
        <div style={styles.titleContainer}>
          <Text noMargin style={styles.title} color="inherit">
            {assetShortHeader.name}
          </Text>
          <Text noMargin style={styles.title} size="body2" color="inherit">
            {assetShortHeader.shortDescription}
          </Text>
        </div>
      </div>
    </ButtonBase>
  );
};
