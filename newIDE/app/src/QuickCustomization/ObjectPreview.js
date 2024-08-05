// @flow
import * as React from 'react';
import { AssetStoreContext } from '../AssetStore/AssetStoreContext';
import ObjectsRenderingService from '../ObjectsRendering/ObjectsRenderingService';
import { CorsAwareImage } from '../UI/CorsAwareImage';
import { textEllipsisStyle } from '../UI/TextEllipsis';
import Text from '../UI/Text';
import { AssetPreviewImage } from '../AssetStore/AssetPreviewImage';
import CheckeredBackground from '../ResourcesList/CheckeredBackground';

type Props = {|
  project: gdProject,
  object: gdObject,
|};

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
    height: 20,
  },
  title: {
    ...textEllipsisStyle,
    overflowWrap: 'break-word',
  },
};

export const ObjectPreview = ({ project, object }: Props) => {
  const size = 128;
  const { getAssetShortHeaderFromId } = React.useContext(AssetStoreContext);
  const assetStoreId = object.getAssetStoreId();
  const assetShortHeader = getAssetShortHeaderFromId(assetStoreId);

  return (
    <div style={{ ...styles.cardContainer, width: size, height: size }}>
      <div style={{ ...styles.previewContainer, width: size, height: size }}>
        <CheckeredBackground />
        {assetShortHeader ? (
          <AssetPreviewImage
            assetShortHeader={assetShortHeader}
            maxSize={128}
          />
        ) : (
          <CorsAwareImage
            alt=""
            src={ObjectsRenderingService.getThumbnail(
              project,
              object.getConfiguration()
            )}
            style={{ maxWidth: 120, maxHeight: 120 }}
          />
        )}
      </div>
      <div style={styles.titleContainer}>
        <Text noMargin style={styles.title} color="inherit">
          {object.getName()}
        </Text>
      </div>
    </div>
  );
};
