// @flow
import { Trans } from '@lingui/macro';
import * as React from 'react';
import { AssetStoreContext } from './AssetStoreContext';
import {
  type AssetShortHeader,
  type PublicAssetPack,
  isAssetPackAudioOnly,
} from '../Utils/GDevelopServices/Asset';
import { type PrivateAssetPackListingData } from '../Utils/GDevelopServices/Shop';
import { NoResultPlaceholder } from './NoResultPlaceholder';
import { clearAllFilters } from './AssetStoreFilterPanel';
import { GridList } from '@material-ui/core';
import {
  useResponsiveWindowWidth,
  type WidthType,
} from '../UI/Reponsive/ResponsiveWindowMeasurer';
import ScrollView, { type ScrollViewInterface } from '../UI/ScrollView';
import PlaceholderLoader from '../UI/PlaceholderLoader';
import PlaceholderError from '../UI/PlaceholderError';
import AuthenticatedUserContext from '../Profile/AuthenticatedUserContext';
import { mergeArraysPerGroup } from '../Utils/Array';
import {
  AssetCardTile,
  PrivateAssetPackTile,
  PublicAssetPackTile,
} from './AssetPackTiles';
import PrivateAssetPackAudioFilesDownloadButton from './PrivateAssets/PrivateAssetPackAudioFilesDownloadButton';

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

export type AssetsListInterface = {|
  getScrollPosition: () => number,
  scrollToPosition: (y: number) => void,
|};

type Props = {|
  assetShortHeaders: ?Array<AssetShortHeader>,
  privateAssetPackListingDatas?: ?Array<PrivateAssetPackListingData>,
  publicAssetPacks?: ?Array<PublicAssetPack>,
  onOpenDetails: (assetShortHeader: AssetShortHeader) => void,
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
      noResultsPlaceHolder,
      privateAssetPackListingDatas,
      publicAssetPacks,
      onPrivateAssetPackSelection,
      onPublicAssetPackSelection,
    }: Props,
    ref
  ) => {
    const {
      error,
      fetchAssetsAndFilters,
      assetFiltersState,
      navigationState,
    } = React.useContext(AssetStoreContext);
    const { receivedAssetPacks } = React.useContext(AuthenticatedUserContext);
    const currentPage = navigationState.getCurrentPage();
    const { openedAssetPack, filtersState } = currentPage;
    const chosenCategory = filtersState.chosenCategory;
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

    const folderTags = React.useMemo(
      () => {
        const firstLevelTags = new Set();
        if (!chosenCategory || !assetShortHeaders) return firstLevelTags;
        // We are in a pack, calculate first level folders based on asset tags.
        // Tags are stored from top to bottom, in the list of tags of an asset.
        // We first remove all tags that are either the chosen category (the pack)
        // or a tag that is applied to all assets (for example "pixel art")
        // and then we take the first tag of each asset.
        assetShortHeaders.forEach(assetShortHeader => {
          const tags = assetShortHeader.tags.filter(
            tag => tag !== chosenCategory.node.name
          );
          if (tags.length > 0) firstLevelTags.add(tags[0]);
        });

        console.log(firstLevelTags);

        // Then we remove the tags that are present in all assets, they're not useful, or not a folder.
        firstLevelTags.forEach(tag => {
          const allAssetsHaveThisTag = assetShortHeaders.every(asset =>
            asset.tags.includes(tag)
          );
          if (allAssetsHaveThisTag) firstLevelTags.delete(tag);
        });

        return firstLevelTags;
      },
      [chosenCategory, assetShortHeaders]
    );

    console.log(folderTags);

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
                  margin={cellSpacing / 2}
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
          isAssetPackAudioOnly(openedAssetPack) ? (
          <PrivateAssetPackAudioFilesDownloadButton
            assetPack={openedAssetPack}
          />
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
