// @flow
import { Trans } from '@lingui/macro';
import * as React from 'react';
import { Column } from '../UI/Grid';
import { AssetStoreContext } from './AssetStoreContext';
import { AssetCard } from './AssetCard';
import {
  type AssetShortHeader,
  type PrivateAssetPack,
  type PublicAssetPack,
  isAssetPackAudioOnly,
} from '../Utils/GDevelopServices/Asset';
import { type PrivateAssetPackListingData } from '../Utils/GDevelopServices/Shop';
import AlertMessage from '../UI/AlertMessage';
import { NoResultPlaceholder } from './NoResultPlaceholder';
import { clearAllFilters } from './AssetStoreFilterPanel';
import {
  GridList,
  GridListTile,
  createStyles,
  makeStyles,
} from '@material-ui/core';
import {
  useResponsiveWindowWidth,
  type WidthType,
} from '../UI/Reponsive/ResponsiveWindowMeasurer';
import ScrollView, { type ScrollViewInterface } from '../UI/ScrollView';
import PlaceholderLoader from '../UI/PlaceholderLoader';
import PlaceholderError from '../UI/PlaceholderError';
import { shouldValidate } from '../UI/KeyboardShortcuts/InteractionKeys';
import AuthenticatedUserContext from '../Profile/AuthenticatedUserContext';
import { mergeArraysPerGroup } from '../Utils/Array';
import { PrivateAssetPackTile, PublicAssetPackTile } from './AssetPackTiles';

const ASSETS_DISPLAY_LIMIT = 100;

const getAssetSize = (windowWidth: WidthType) => {
  switch (windowWidth) {
    case 'small':
      return 80;
    case 'medium':
      return 120;
    case 'large':
    case 'xlarge':
      return 130;
    default:
      return 120;
  }
};

const getAssetPacksColumns = (windowWidth: WidthType) => {
  switch (windowWidth) {
    case 'small':
      return 1;
    case 'medium':
      return 2;
    case 'large':
      return 3;
    case 'xlarge':
      return 5;
    default:
      return 2;
  }
};

const cellSpacing = 8;
const styles = {
  grid: {
    margin: 0, // Remove the default margin of the grid.
    // Remove the scroll capability of the grid, the scroll view handles it.
    overflow: 'unset',
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

const AssetCardTile = ({
  assetShortHeader,
  onOpenDetails,
  size,
}: {|
  assetShortHeader: AssetShortHeader,
  onOpenDetails: () => void,
  size: number,
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
        margin: cellSpacing / 2,
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

export type AssetsListInterface = {|
  getScrollPosition: () => number,
  scrollToPosition: (y: number) => void,
|};

type Props = {|
  assetShortHeaders: ?Array<AssetShortHeader>,
  privateAssetPackListingDatas?: ?Array<PrivateAssetPackListingData>,
  publicAssetPacks?: ?Array<PublicAssetPack>,
  onOpenDetails: (assetShortHeader: AssetShortHeader) => void,
  renderPrivateAssetPackAudioFilesDownloadButton?: (
    assetPack: PrivateAssetPack
  ) => React.Node,
  noResultsPlaceHolder?: React.Node,
  error?: ?Error,
  onPrivateAssetPackSelection?: (
    assetPack: PrivateAssetPackListingData
  ) => void,
  onPublicAssetPackSelection?: (assetPack: PublicAssetPack) => void,
|};

const AssetsList = React.forwardRef<Props, AssetsListInterface>(
  (
    {
      assetShortHeaders,
      onOpenDetails,
      renderPrivateAssetPackAudioFilesDownloadButton,
      noResultsPlaceHolder,
      privateAssetPackListingDatas,
      publicAssetPacks,
      onPrivateAssetPackSelection,
      onPublicAssetPackSelection,
    }: Props,
    ref
  ) => {
    console.log(publicAssetPacks, privateAssetPackListingDatas);
    const {
      error,
      fetchAssetsAndFilters,
      assetFiltersState,
      navigationState,
    } = React.useContext(AssetStoreContext);
    const { receivedAssetPacks } = React.useContext(AuthenticatedUserContext);
    const currentPage = navigationState.getCurrentPage();
    const { openedAssetPack } = currentPage;
    const windowWidth = useResponsiveWindowWidth();
    const scrollView = React.useRef<?ScrollViewInterface>(null);
    React.useImperativeHandle(ref, () => ({
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

    console.log(assetShortHeaders);

    const assetTiles = React.useMemo(
      () =>
        assetShortHeaders
          ? assetShortHeaders
              .map(assetShortHeader => (
                <AssetCardTile
                  assetShortHeader={assetShortHeader}
                  onOpenDetails={() => onOpenDetails(assetShortHeader)}
                  size={getAssetSize(windowWidth)}
                  key={assetShortHeader.id}
                />
              ))
              .splice(0, ASSETS_DISPLAY_LIMIT) // Limit the number of displayed assets to avoid performance issues
          : null,
      [assetShortHeaders, onOpenDetails, windowWidth]
    );

    const publicPacksTiles: Array<React.Node> = React.useMemo(
      () => {
        if (!publicAssetPacks || !onPublicAssetPackSelection) return [];
        return publicAssetPacks.map((assetPack, index) => (
          <PublicAssetPackTile
            assetPack={assetPack}
            onSelect={() => onPublicAssetPackSelection(assetPack)}
            key={`${assetPack.tag}-${index}`}
          />
        ));
      },
      [publicAssetPacks, onPublicAssetPackSelection]
    );

    const { allStandAlonePackTiles, allBundlePackTiles } = React.useMemo(
      () => {
        const privateAssetPackStandAloneTiles: Array<React.Node> = [];
        const privateOwnedAssetPackStandAloneTiles: Array<React.Node> = [];
        const privateAssetPackBundleTiles: Array<React.Node> = [];
        const privateOwnedAssetPackBundleTiles: Array<React.Node> = [];

        if (!privateAssetPackListingDatas || !receivedAssetPacks) {
          return {
            allStandAlonePackTiles: [],
            allBundlePackTiles: [],
          };
        }

        !!onPrivateAssetPackSelection &&
          privateAssetPackListingDatas.forEach(assetPackListingData => {
            const isPackOwned =
              !!receivedAssetPacks &&
              !!receivedAssetPacks.find(
                pack => pack.id === assetPackListingData.id
              );
            const tile = (
              <PrivateAssetPackTile
                assetPackListingData={assetPackListingData}
                onSelect={() => {
                  onPrivateAssetPackSelection(assetPackListingData);
                }}
                owned={isPackOwned}
                key={assetPackListingData.id}
              />
            );
            if (
              assetPackListingData.includedListableProductIds &&
              !!assetPackListingData.includedListableProductIds.length
            ) {
              if (isPackOwned) {
                privateOwnedAssetPackBundleTiles.push(tile);
              } else {
                privateAssetPackBundleTiles.push(tile);
              }
            } else {
              if (isPackOwned) {
                privateOwnedAssetPackStandAloneTiles.push(tile);
              } else {
                privateAssetPackStandAloneTiles.push(tile);
              }
            }
          });

        const allBundlePackTiles = [
          ...privateOwnedAssetPackBundleTiles, // Display owned bundles first.
          ...privateAssetPackBundleTiles,
        ];

        const allStandAlonePackTiles = [
          ...privateOwnedAssetPackStandAloneTiles, // Display owned packs first.
          ...mergeArraysPerGroup(
            privateAssetPackStandAloneTiles,
            publicPacksTiles,
            2,
            1
          ),
        ];

        return { allStandAlonePackTiles, allBundlePackTiles };
      },
      [
        privateAssetPackListingDatas,
        onPrivateAssetPackSelection,
        publicPacksTiles,
        receivedAssetPacks,
      ]
    );

    return (
      <ScrollView ref={scrollView} id="asset-store-listing">
        {!assetTiles && !error && <PlaceholderLoader />}
        {!assetTiles && error && (
          <PlaceholderError onRetry={fetchAssetsAndFilters}>
            <Trans>
              Can't load the results. Verify your internet connection or retry
              later.
            </Trans>
          </PlaceholderError>
        )}
        {!openedAssetPack && allBundlePackTiles.length ? (
          <GridList
            cols={getAssetPacksColumns(windowWidth)}
            style={styles.grid}
            cellHeight="auto"
            spacing={cellSpacing}
          >
            {allBundlePackTiles}
          </GridList>
        ) : null}
        {!openedAssetPack && allStandAlonePackTiles.length ? (
          <GridList
            cols={getAssetPacksColumns(windowWidth)}
            style={styles.grid}
            cellHeight="auto"
            spacing={cellSpacing}
          >
            {allStandAlonePackTiles}
          </GridList>
        ) : null}
        {assetTiles && assetTiles.length ? (
          <GridList style={styles.grid} cellHeight="auto">
            {assetTiles}
          </GridList>
        ) : openedAssetPack &&
          openedAssetPack.content &&
          isAssetPackAudioOnly(openedAssetPack) &&
          renderPrivateAssetPackAudioFilesDownloadButton ? (
          <Column expand justifyContent="center" alignItems="center">
            <AlertMessage
              kind="info"
              renderRightButton={() =>
                renderPrivateAssetPackAudioFilesDownloadButton(openedAssetPack)
              }
            >
              <Trans>
                Download all the sounds of the asset pack in one click and use
                them in your project.
              </Trans>
            </AlertMessage>
          </Column>
        ) : (
          noResultsPlaceHolder || (
            <NoResultPlaceholder
              onClear={() => clearAllFilters(assetFiltersState)}
            />
          )
        )}
      </ScrollView>
    );
  }
);

export default AssetsList;
