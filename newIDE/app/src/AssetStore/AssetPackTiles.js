// @flow
import * as React from 'react';
import {
  type PublicAssetPack,
  type AssetShortHeader,
} from '../Utils/GDevelopServices/Asset';
import { type PrivateAssetPackListingData } from '../Utils/GDevelopServices/Shop';
import { GridListTile, createStyles, makeStyles } from '@material-ui/core';
import { shouldValidate } from '../UI/KeyboardShortcuts/InteractionKeys';
import Paper from '../UI/Paper';
import { CorsAwareImage } from '../UI/CorsAwareImage';
import { textEllipsisStyle } from '../UI/TextEllipsis';
import { Column, Line } from '../UI/Grid';
import Text from '../UI/Text';
import { Trans } from '@lingui/macro';
import { PrivateAssetPackPriceTag } from './PrivateAssets/PrivateAssetPackPriceTag';
import { AssetCard } from './AssetCard';

const styles = {
  priceTagContainer: {
    position: 'absolute',
    top: 10,
    left: 10,
    cursor: 'default',
  },
  previewImage: {
    width: '100%',
    // Prevent cumulative layout shift by enforcing
    // the 16:9 ratio.
    aspectRatio: '16 / 9',
    objectFit: 'cover',
    position: 'relative',
    background: '#7147ed',
  },
  paper: {
    margin: 4,
  },
  packTitle: {
    ...textEllipsisStyle,
    overflowWrap: 'break-word',
  },
};

const useStylesForGridListItem = makeStyles(theme =>
  createStyles({
    root: {
      '&:focus': {
        outline: `2px solid ${theme.palette.primary.main}`,
      },
    },
  })
);

export const AssetCardTile = ({
  assetShortHeader,
  onOpenDetails,
  size,
  margin,
}: {|
  assetShortHeader: AssetShortHeader,
  onOpenDetails: () => void,
  size: number,
  margin?: number,
|}) => {
  const classesForGridListItem = useStylesForGridListItem();

  return (
    <GridListTile
      classes={classesForGridListItem}
      tabIndex={0}
      onKeyPress={(event: SyntheticKeyboardEvent<HTMLLIElement>): void => {
        if (shouldValidate(event)) {
          onOpenDetails();
        }
      }}
      onClick={onOpenDetails}
      style={{
        margin,
      }}
    >
      <AssetCard
        id={`asset-card-${assetShortHeader.name.replace(/\s/g, '-')}`}
        onOpenDetails={onOpenDetails}
        assetShortHeader={assetShortHeader}
        size={size}
      />
    </GridListTile>
  );
};

export const PublicAssetPackTile = ({
  assetPack,
  onSelect,
  style,
}: {|
  assetPack: PublicAssetPack,
  onSelect: () => void,
  /** Props needed so that GridList component can adjust tile size */
  style?: any,
|}) => {
  const classesForGridListItem = useStylesForGridListItem();
  return (
    <GridListTile
      classes={classesForGridListItem}
      tabIndex={0}
      onKeyPress={(event: SyntheticKeyboardEvent<HTMLLIElement>): void => {
        if (shouldValidate(event)) {
          onSelect();
        }
      }}
      style={style}
      onClick={onSelect}
    >
      <Paper
        id={`asset-pack-${assetPack.tag.replace(/\s/g, '-')}`}
        elevation={2}
        style={styles.paper}
        background="light"
      >
        <CorsAwareImage
          key={assetPack.name}
          style={styles.previewImage}
          src={assetPack.thumbnailUrl}
          alt={`Preview image of asset pack ${assetPack.name}`}
        />
        <Column>
          <Line justifyContent="space-between" noMargin>
            <Text style={styles.packTitle} size="body2">
              {assetPack.name}
            </Text>
            <Text style={styles.packTitle} color="primary" size="body2">
              <Trans>{assetPack.assetsCount} Assets</Trans>
              {assetPack.userFriendlyPrice
                ? ' - ' + assetPack.userFriendlyPrice
                : null}
            </Text>
          </Line>
        </Column>
      </Paper>
    </GridListTile>
  );
};

export const PrivateAssetPackTile = ({
  assetPackListingData,
  onSelect,
  style,
  owned,
}: {|
  assetPackListingData: PrivateAssetPackListingData,
  onSelect: () => void,
  /** Props needed so that GidList component can adjust tile size */
  style?: any,
  owned: boolean,
|}) => {
  const classesForGridListItem = useStylesForGridListItem();
  return (
    <GridListTile
      classes={classesForGridListItem}
      tabIndex={0}
      onKeyPress={(event: SyntheticKeyboardEvent<HTMLLIElement>): void => {
        if (shouldValidate(event)) {
          onSelect();
        }
      }}
      style={style}
      onClick={onSelect}
    >
      <Paper elevation={2} style={styles.paper} background="light">
        <CorsAwareImage
          key={assetPackListingData.name}
          style={styles.previewImage}
          src={assetPackListingData.thumbnailUrls[0]}
          alt={`Preview image of asset pack ${assetPackListingData.name}`}
        />
        <div style={styles.priceTagContainer}>
          <PrivateAssetPackPriceTag
            privateAssetPackListingData={assetPackListingData}
            withOverlay
            owned={owned}
          />
        </div>
        <Column>
          <Line justifyContent="space-between" noMargin>
            <Text style={styles.packTitle} size="body2">
              {assetPackListingData.name}
            </Text>
            <Text style={styles.packTitle} color="primary" size="body2">
              {assetPackListingData.description}
            </Text>
          </Line>
        </Column>
      </Paper>
    </GridListTile>
  );
};
