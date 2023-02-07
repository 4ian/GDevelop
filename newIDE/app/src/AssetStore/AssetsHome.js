// @flow
import * as React from 'react';
import { Trans } from '@lingui/macro';
import { makeStyles, createStyles } from '@material-ui/core/styles';
import GridListTile from '@material-ui/core/GridListTile';
import GridList from '@material-ui/core/GridList';
import { CorsAwareImage } from '../UI/CorsAwareImage';
import Text from '../UI/Text';
import PriceTag from '../UI/PriceTag';
import type {
  PublicAssetPacks,
  PublicAssetPack,
} from '../Utils/GDevelopServices/Asset';
import { type PrivateAssetPackListingData } from '../Utils/GDevelopServices/Shop';
import { shouldValidate } from '../UI/KeyboardShortcuts/InteractionKeys';
import { Line, Column } from '../UI/Grid';
import ScrollView, { type ScrollViewInterface } from '../UI/ScrollView';
import { useResponsiveWindowWidth } from '../UI/Reponsive/ResponsiveWindowMeasurer';
import AuthenticatedUserContext from '../Profile/AuthenticatedUserContext';
import Paper from '../UI/Paper';
import { mergeArraysPerGroup } from '../Utils/Array';
import { textEllipsisStyle } from '../UI/TextEllipsis';
import { assetCategories } from '.';

const columns = 3;
const columnsForSmallWindow = 1;
const columnsForMediumWindow = 2;
const categoryColumns = 4;
const categoryColumnsForSmallWindow = 2;
const categoryColumnsForMediumWindow = 3;
const cellSpacing = 2;

const styles = {
  grid: { margin: '0 10px' },
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
  },
  cardContainer: {
    overflow: 'hidden',
    position: 'relative',
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
        border: `2px solid ${theme.palette.primary.main}`,
        outline: 'none',
      },
      '&:focus-visible': { outline: 'unset' },
    },
  })
);

const PublicAssetPackTile = ({
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
      <Paper elevation={2} style={styles.paper} background="light">
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
          <PriceTag
            value={assetPackListingData.prices[0].value}
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
              <Trans>{assetPackListingData.description}</Trans>
            </Text>
          </Line>
        </Column>
      </Paper>
    </GridListTile>
  );
};

export const CategoryTile = ({
  title,
  onSelect,
  style,
}: {|
  title: React.Node,
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
      <Paper elevation={2} style={styles.paper} background="light">
        {/* <CorsAwareImage
          style={styles.previewImage}
          src={assetPackListingData.thumbnailUrls[0]}
        /> */}
        <Column>
          <Line justifyContent="center" noMargin>
            <Text style={styles.packTitle} size="sub-title">
              {title}
            </Text>
          </Line>
        </Column>
      </Paper>
    </GridListTile>
  );
};

export type AssetsHomeInterface = {|
  getScrollPosition: () => number,
  scrollToPosition: (y: number) => void,
|};

type Props = {|
  publicAssetPacks: PublicAssetPacks,
  privateAssetPacksListingData: Array<PrivateAssetPackListingData>,
  assetPackRandomOrdering: Array<number>,
  onPublicAssetPackSelection: PublicAssetPack => void,
  onPrivateAssetPackSelection: PrivateAssetPackListingData => void,
  onCategorySelection: string => void,
  openedAssetCategory: string | null,
|};

export const AssetsHome = React.forwardRef<Props, AssetsHomeInterface>(
  (
    {
      publicAssetPacks: { starterPacks },
      privateAssetPacksListingData,
      assetPackRandomOrdering,
      onPublicAssetPackSelection,
      onPrivateAssetPackSelection,
      onCategorySelection,
      openedAssetCategory,
    }: Props,
    ref
  ) => {
    const windowWidth = useResponsiveWindowWidth();
    const { receivedAssetPacks } = React.useContext(AuthenticatedUserContext);

    const scrollView = React.useRef<?ScrollViewInterface>(null);
    React.useImperativeHandle(ref, () => ({
      /**
       * Return the scroll position.
       */
      getScrollPosition: () => {
        const scrollViewElement = scrollView.current;
        if (!scrollViewElement) return 0;

        return scrollViewElement.getScrollPosition();
      },
      scrollToPosition: (y: number) => {
        const scrollViewElement = scrollView.current;
        if (!scrollViewElement) return;

        scrollViewElement.scrollToPosition(y);
      },
    }));

    const starterPacksTiles: Array<React.Node> = starterPacks
      .map((assetPack, index) =>
        !openedAssetCategory ||
        assetPack.categories.includes(openedAssetCategory) ? (
          <PublicAssetPackTile
            assetPack={assetPack}
            onSelect={() => onPublicAssetPackSelection(assetPack)}
            key={`${assetPack.tag}-${index}`}
          />
        ) : null
      )
      .filter(Boolean);

    const privateAssetPacksTiles: Array<React.Node> = privateAssetPacksListingData
      .map(assetPackListingData =>
        !openedAssetCategory ||
        assetPackListingData.categories.includes(openedAssetCategory) ? (
          <PrivateAssetPackTile
            assetPackListingData={assetPackListingData}
            onSelect={() => {
              onPrivateAssetPackSelection(assetPackListingData);
            }}
            owned={
              !!receivedAssetPacks &&
              !!receivedAssetPacks.find(
                pack => pack.id === assetPackListingData.id
              )
            }
            key={assetPackListingData.id}
          />
        ) : null
      )
      .filter(Boolean);

    const allTiles = mergeArraysPerGroup(
      privateAssetPacksTiles,
      starterPacksTiles
        .map((tile, index) => ({ pos: assetPackRandomOrdering[index], tile }))
        .sort((a, b) => a.pos - b.pos)
        .map(sortObject => sortObject.tile),
      2,
      1
    );

    const categoryTiles = Object.entries(assetCategories).map(([id, title]) => (
      <CategoryTile
        key={id}
        // $FlowExpectedError - Object.entries does not infer well the type of the value.
        title={title}
        onSelect={() => {
          onCategorySelection(id);
        }}
      />
    ));

    const openedAssetCategoryTitle = openedAssetCategory
      ? assetCategories[openedAssetCategory]
      : null;

    return (
      <ScrollView ref={scrollView}>
        {openedAssetCategory ? null : (
          <>
            <Column>
              <Line>
                <Text size="block-title">
                  <Trans>Explore by category</Trans>
                </Text>
              </Line>
            </Column>
            <GridList
              cols={
                windowWidth === 'small'
                  ? categoryColumnsForSmallWindow
                  : windowWidth === 'medium'
                  ? categoryColumnsForMediumWindow
                  : categoryColumns
              }
              style={styles.grid}
              cellHeight="auto"
              spacing={cellSpacing}
            >
              {categoryTiles}
            </GridList>
          </>
        )}
        <Column>
          <Line>
            <Text size="block-title">
              {openedAssetCategoryTitle ? (
                openedAssetCategoryTitle
              ) : (
                <Trans>All asset packs</Trans>
              )}
            </Text>
          </Line>
        </Column>
        <GridList
          cols={
            windowWidth === 'small'
              ? columnsForSmallWindow
              : windowWidth === 'medium'
              ? columnsForMediumWindow
              : columns
          }
          style={styles.grid}
          cellHeight="auto"
          spacing={cellSpacing}
        >
          {allTiles}
        </GridList>
      </ScrollView>
    );
  }
);
