// @flow
import * as React from 'react';
import {
  type AssetShortHeader,
} from '../Utils/GDevelopServices/Asset';
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
  size: number,
  assetShortHeader: AssetShortHeader,
|};

export const AssetCard = ({ id, assetShortHeader, size }: Props) => {
  return (
    <div id={id} style={{ ...styles.cardContainer, width: size, height: size }}>
      <div style={{ ...styles.previewContainer, width: size, height: size }}>
        <CheckeredBackground />
        <AssetPreviewImage assetShortHeader={assetShortHeader} maxSize={128} />
      </div>
      <div
        style={{
          ...styles.titleContainer,
          height: assetShortHeader.shortDescription ? 40 : 20,
        }}
      >
        <Text noMargin style={styles.title} color="inherit">
          {assetShortHeader.name}
        </Text>
        {assetShortHeader.shortDescription && (
          <Text noMargin style={styles.title} size="body2" color="inherit">
            {assetShortHeader.shortDescription}
          </Text>
        )}
      </div>
    </div>
  );
};
