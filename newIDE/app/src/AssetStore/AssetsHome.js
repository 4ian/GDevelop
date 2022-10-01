// @flow
import * as React from 'react';
import { Trans } from '@lingui/macro';
import { makeStyles, createStyles } from '@material-ui/core/styles';
import GridListTile from '@material-ui/core/GridListTile';
import GridList from '@material-ui/core/GridList';
import Paper from '@material-ui/core/Paper';
import { CorsAwareImage } from '../UI/CorsAwareImage';
import Text from '../UI/Text';
import type { AssetPacks, AssetPack } from '../Utils/GDevelopServices/Asset';
import { type PrivateAssetPackListingData } from '../Utils/GDevelopServices/Shop';
import { shouldValidate } from '../UI/KeyboardShortcuts/InteractionKeys';
import { Line, Column } from '../UI/Grid';
import ScrollView from '../UI/ScrollView';
import { useResponsiveWindowWidth } from '../UI/Reponsive/ResponsiveWindowMeasurer';
import ThemeContext from '../UI/Theme/ThemeContext';

const columns = 3;
const columnsForSmallWindow = 2;
const cellSpacing = 2;

const styles = {
  grid: { margin: '0 10px' },
  previewImage: {
    width: '100%',
    // Prevent cumulative layout shift by enforcing
    // the 16:9 ratio.
    aspectRatio: '16 / 9',
    objectFit: 'cover',
  },
  cardContainer: {
    overflow: 'hidden',
    position: 'relative',
  },
  paper: {
    margin: 4,
  },
  packTitle: {
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    overflowWrap: 'break-word',
    whiteSpace: 'nowrap',
  },
};

const useStylesForGridListItem = makeStyles(theme =>
  createStyles({
    root: {
      '&:focus': {
        border: `2px solid ${theme.palette.primary.main}`,
        outline: 'none',
      },
      '&:focus-visible': { outline: 'unset' },
    },
  })
);

const AssetPackTile = ({
  assetPack,
  onSelect,
  style,
}: {
  assetPack: AssetPack,
  onSelect: (tag: string) => void,
  /** Props needed so that GidList component can adjust tile size */
  style?: any,
}) => {
  const classesForGridListItem = useStylesForGridListItem();
  const gdevelopTheme = React.useContext(ThemeContext);

  return (
    <GridListTile
      classes={classesForGridListItem}
      key={assetPack.tag}
      tabIndex={0}
      onKeyPress={(event: SyntheticKeyboardEvent<HTMLLIElement>): void => {
        if (shouldValidate(event)) {
          onSelect(assetPack.tag);
        }
      }}
      style={style}
      onClick={() => onSelect(assetPack.tag)}
    >
      <Paper
        elevation={2}
        style={{
          ...styles.paper,
          backgroundColor: gdevelopTheme.list.itemsBackgroundColor,
        }}
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

const PrivateAssetPackTile = ({
  assetPack,
  onSelect,
  style,
}: {
  assetPack: PrivateAssetPackListingData,
  onSelect: (assetPack: PrivateAssetPackListingData) => void,
  /** Props needed so that GidList component can adjust tile size */
  style?: any,
}) => {
  const classesForGridListItem = useStylesForGridListItem();
  const gdevelopTheme = React.useContext(ThemeContext);
  return (
    <GridListTile
      classes={classesForGridListItem}
      key={assetPack.id}
      tabIndex={0}
      onKeyPress={(event: SyntheticKeyboardEvent<HTMLLIElement>): void => {
        if (shouldValidate(event)) {
          onSelect(assetPack);
        }
      }}
      style={style}
      onClick={() => onSelect(assetPack)}
    >
      <Paper
        elevation={2}
        style={{
          ...styles.paper,
          backgroundColor: gdevelopTheme.list.itemsBackgroundColor,
        }}
      >
        <CorsAwareImage
          key={assetPack.name}
          style={styles.previewImage}
          src={assetPack.thumbnailUrls[0]}
          alt={`Preview image of asset pack ${assetPack.name}`}
        />
        <Column>
          <Line justifyContent="space-between" noMargin>
            <Text style={styles.packTitle} size="body2">
              {assetPack.name}
            </Text>
            <Text style={styles.packTitle} color="primary" size="body2">
              <Trans>{assetPack.description}</Trans>
            </Text>
          </Line>
        </Column>
      </Paper>
    </GridListTile>
  );
};

type Props = {|
  assetPacks: AssetPacks,
  privateAssetPacks: Array<PrivateAssetPackListingData>,
  assetPackRandomOrdering: Array<number>,
  onPackSelection: string => void,
  onPrivateAssetPackSelection: PrivateAssetPackListingData => void,
|};

export const AssetsHome = ({
  assetPacks: { starterPacks },
  privateAssetPacks,
  assetPackRandomOrdering,
  onPackSelection,
  onPrivateAssetPackSelection,
}: Props) => {
  const windowWidth = useResponsiveWindowWidth();

  const starterPacksTiles = starterPacks.map(pack => (
    <AssetPackTile assetPack={pack} onSelect={onPackSelection} />
  ));

  const privateAssetPacksTiles = privateAssetPacks.map(pack => (
    <PrivateAssetPackTile
      assetPack={pack}
      onSelect={onPrivateAssetPackSelection}
    />
  ));

  const allTiles = starterPacksTiles
    .concat(privateAssetPacksTiles)
    .map((tile, index) => ({ pos: assetPackRandomOrdering[index], tile }))
    .sort((a, b) => a.pos - b.pos)
    .map(sortObject => sortObject.tile);

  return (
    <ScrollView>
      <GridList
        cols={windowWidth === 'small' ? columnsForSmallWindow : columns}
        style={styles.grid}
        cellHeight="auto"
        spacing={cellSpacing}
      >
        {allTiles}
      </GridList>
    </ScrollView>
  );
};
