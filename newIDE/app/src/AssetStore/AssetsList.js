// @flow
import { Trans } from '@lingui/macro';
import * as React from 'react';
import capitalize from 'lodash/capitalize';
import { AssetStoreContext } from './AssetStoreContext';
import {
  type AssetShortHeader,
  type PublicAssetPack,
  type Author,
  type License,
  isAssetPackAudioOnly,
} from '../Utils/GDevelopServices/Asset';
import {
  type PrivateAssetPackListingData,
  type PrivateGameTemplateListingData,
} from '../Utils/GDevelopServices/Shop';
import { NoResultPlaceholder } from './NoResultPlaceholder';
import GridList from '@material-ui/core/GridList';
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
  AssetFolderTile,
  PrivateAssetPackTile,
  PrivateGameTemplateTile,
  PublicAssetPackTile,
} from './ShopTiles';
import PrivateAssetPackAudioFilesDownloadButton from './PrivateAssets/PrivateAssetPackAudioFilesDownloadButton';
import { CorsAwareImage } from '../UI/CorsAwareImage';
import { Column, LargeSpacer, Line } from '../UI/Grid';
import Text from '../UI/Text';
import { ResponsiveLineStackLayout } from '../UI/Layout';
import {
  getUserPublicProfile,
  type UserPublicProfile,
} from '../Utils/GDevelopServices/User';
import Link from '../UI/Link';
import PublicProfileDialog from '../Profile/PublicProfileDialog';
import Window from '../Utils/Window';
import Breadcrumbs from '../UI/Breadcrumbs';
import { getFolderTagsFromAssetShortHeaders } from './TagsHelper';
import { PrivateGameTemplateStoreContext } from './PrivateGameTemplates/PrivateGameTemplateStoreContext';
import { type AssetStorePageState } from './AssetStoreNavigator';

const ASSETS_DISPLAY_LIMIT = 200;

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

const getShopItemsColumns = (windowWidth: WidthType) => {
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

const getAssetFoldersColumns = (windowWidth: WidthType) => {
  switch (windowWidth) {
    case 'small':
    case 'medium':
      return 1;
    case 'large':
    case 'xlarge':
      return 2;
    default:
      return 2;
  }
};

export const getAssetShortHeadersToDisplay = (
  allAssetShortHeaders: AssetShortHeader[],
  selectedFolders: string[]
): AssetShortHeader[] => {
  return allAssetShortHeaders
    .filter(assetShortHeader => {
      if (!selectedFolders.length) return true;
      const allAssetTags = assetShortHeader.tags;
      // Check that the asset has all the selected folders tags.
      return selectedFolders.every(folderTag =>
        allAssetTags.includes(folderTag)
      );
    })
    .splice(0, ASSETS_DISPLAY_LIMIT); // Limit the number of displayed assets to avoid performance issues
};

const cellSpacing = 8;
const styles = {
  grid: {
    margin: '0 2px', // Remove the default margin of the grid but keep the horizontal padding for focus outline.
    // Remove the scroll capability of the grid, the scroll view handles it.
    overflow: 'unset',
  },
  scrollView: {
    display: 'flex',
    flexDirection: 'column',
  },
  previewImage: {
    width: 200,
    // Prevent cumulative layout shift by enforcing
    // the 16:9 ratio.
    aspectRatio: '16 / 9',
    objectFit: 'cover',
    position: 'relative',
  },
};

export type AssetsListInterface = {|
  getScrollPosition: () => number,
  scrollToPosition: (y: number) => void,
|};

type Props = {|
  assetShortHeaders: ?Array<AssetShortHeader>,
  privateAssetPackListingDatas?: ?Array<PrivateAssetPackListingData>,
  privateGameTemplateListingDatas?: ?Array<PrivateGameTemplateListingData>,
  publicAssetPacks?: ?Array<PublicAssetPack>,
  onOpenDetails: (assetShortHeader: AssetShortHeader) => void,
  noResultsPlaceHolder?: React.Node,
  error?: ?Error,
  onPrivateAssetPackSelection?: (
    privateAssetPackListingData: PrivateAssetPackListingData
  ) => void,
  onPublicAssetPackSelection?: (assetPack: PublicAssetPack) => void,
  onPrivateGameTemplateSelection?: (
    privateGameTemplateListingData: PrivateGameTemplateListingData
  ) => void,
  onFolderSelection?: (folderTag: string) => void,
  onGoBackToFolderIndex?: (folderIndex: number) => void,
  noScroll?: boolean,
  // This component can either display the list of assets, packs, and game templates using the asset store navigator,
  // then currentPage is the current page of the navigator.
  // Or it can display arbitrary content, like the list of assets in a pack, or similar assets,
  // then currentPage is null.
  currentPage?: AssetStorePageState,
|};

const AssetsList = React.forwardRef<Props, AssetsListInterface>(
  (
    {
      assetShortHeaders,
      onOpenDetails,
      noResultsPlaceHolder,
      privateAssetPackListingDatas,
      privateGameTemplateListingDatas,
      publicAssetPacks,
      onPrivateAssetPackSelection,
      onPublicAssetPackSelection,
      onPrivateGameTemplateSelection,
      onFolderSelection,
      onGoBackToFolderIndex,
      noScroll,
      currentPage,
    }: Props,
    ref
  ) => {
    const {
      error: assetStoreError,
      fetchAssetsAndFilters,
      clearAllFilters: clearAllAssetFilters,
      licenses,
      authors,
      assetFiltersState,
      assetPackFiltersState,
      privateAssetPackListingDatas: allPrivateAssetPackListingDatas,
    } = React.useContext(AssetStoreContext);
    const {
      error: gameTemplateStoreError,
      fetchGameTemplates,
    } = React.useContext(PrivateGameTemplateStoreContext);
    const { receivedAssetPacks, receivedGameTemplates } = React.useContext(
      AuthenticatedUserContext
    );
    const [
      authorPublicProfile,
      setAuthorPublicProfile,
    ] = React.useState<?UserPublicProfile>(null);
    const [
      openAuthorPublicProfileDialog,
      setOpenAuthorPublicProfileDialog,
    ] = React.useState<boolean>(false);
    const [
      isNavigatingInsideFolder,
      setIsNavigatingInsideFolder,
    ] = React.useState<boolean>(false);
    const { openedAssetPack, selectedFolders } = React.useMemo(
      () => {
        if (!currentPage) {
          return { openedAssetPack: null, selectedFolders: [] };
        }
        return {
          openedAssetPack: currentPage.openedAssetPack,
          selectedFolders: currentPage.selectedFolders,
        };
      },
      [currentPage]
    );
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

    const fetchAssetsAndGameTemplates = React.useCallback(
      () => {
        fetchAssetsAndFilters();
        fetchGameTemplates();
      },
      [fetchAssetsAndFilters, fetchGameTemplates]
    );

    const shopError = assetStoreError || gameTemplateStoreError;

    const hasAssetPackFiltersApplied = React.useMemo(
      // When a pack is opened, the asset pack filters are not hidden, but not relevant either.
      () => !openedAssetPack && assetPackFiltersState.typeFilter.hasFilters(),
      [assetPackFiltersState, openedAssetPack]
    );

    const hasAssetFiltersApplied = React.useMemo(
      () =>
        assetFiltersState.animatedFilter.hasFilters() ||
        assetFiltersState.viewpointFilter.hasFilters() ||
        assetFiltersState.colorFilter.hasFilters() ||
        assetFiltersState.dimensionFilter.hasFilters() ||
        assetFiltersState.licenseFilter.hasFilters() ||
        assetFiltersState.objectTypeFilter.hasFilters(),
      [assetFiltersState]
    );

    const hasOnlySelectedOwnedAssetPacks = React.useMemo(
      () =>
        // When a pack is opened, the asset pack filters are not hidden, but not relevant either.
        !openedAssetPack &&
        assetPackFiltersState.typeFilter.isOwned &&
        !assetPackFiltersState.typeFilter.isPremium &&
        !assetPackFiltersState.typeFilter.isFree &&
        !hasAssetFiltersApplied,
      [assetPackFiltersState, hasAssetFiltersApplied, openedAssetPack]
    );
    const noResultComponent = noResultsPlaceHolder ? (
      noResultsPlaceHolder
    ) : hasOnlySelectedOwnedAssetPacks ? (
      <NoResultPlaceholder
        message={<Trans>You don't own any pack yet!</Trans>}
        onClear={clearAllAssetFilters}
      />
    ) : hasAssetPackFiltersApplied && hasAssetFiltersApplied ? (
      <NoResultPlaceholder
        message={
          <Trans>
            Cannot filter on both asset packs and assets at the same time. Try
            clearing one of the filters!
          </Trans>
        }
        onClear={clearAllAssetFilters}
      />
    ) : (
      <NoResultPlaceholder onClear={clearAllAssetFilters} />
    );

    // When selected folders change, set a flag to know that we are navigating inside a folder.
    // This allows showing a fake loading indicator.
    React.useEffect(
      () => {
        setIsNavigatingInsideFolder(true);
        const timeoutId = setTimeout(
          () => setIsNavigatingInsideFolder(false),
          100
        );
        return () => clearTimeout(timeoutId);
      },
      // Apply the effect only when the selected folders change.
      [selectedFolders]
    );

    const folderTags: Array<string> = React.useMemo(
      () => {
        // When inside an asset pack, it will automatically select a folder.
        // So if the list is empty or if the assets are not loaded, we don't load the tags.
        if (!selectedFolders.length || !assetShortHeaders) return [];
        return getFolderTagsFromAssetShortHeaders({
          assetShortHeaders,
          selectedFolders,
        });
      },
      [assetShortHeaders, selectedFolders]
    );

    const folderTiles = React.useMemo(
      () => {
        // Don't show folders if we are searching.
        if (!folderTags.length || !onFolderSelection) return [];
        return folderTags.map(folderTag => (
          <AssetFolderTile
            tag={folderTag}
            key={folderTag}
            onSelect={() => {
              onFolderSelection(folderTag);
            }}
          />
        ));
      },
      [folderTags, onFolderSelection]
    );

    const selectedPrivateAssetPackListingData = React.useMemo(
      () => {
        if (
          !allPrivateAssetPackListingDatas ||
          !openedAssetPack ||
          !openedAssetPack.id // public pack selected.
        )
          return null;

        // As the list should already been fetched, we can find the selected pack
        // if it is a private pack.
        return allPrivateAssetPackListingDatas.find(
          privateAssetPackListingData =>
            privateAssetPackListingData.id === openedAssetPack.id
        );
      },
      [allPrivateAssetPackListingDatas, openedAssetPack]
    );

    const assetTiles = React.useMemo(
      () => {
        if (!assetShortHeaders) return null; // Loading
        if (hasAssetPackFiltersApplied && !openedAssetPack) return []; // Don't show assets if filtering on asset packs.)

        return getAssetShortHeadersToDisplay(
          assetShortHeaders,
          selectedFolders
        ).map(assetShortHeader => (
          <AssetCardTile
            assetShortHeader={assetShortHeader}
            onOpenDetails={() => onOpenDetails(assetShortHeader)}
            size={getAssetSize(windowWidth)}
            key={assetShortHeader.id}
            margin={cellSpacing / 2}
          />
        ));
      },
      [
        assetShortHeaders,
        onOpenDetails,
        windowWidth,
        selectedFolders,
        hasAssetPackFiltersApplied,
        openedAssetPack,
      ]
    );

    const publicPacksTiles: Array<React.Node> = React.useMemo(
      () => {
        if (
          !publicAssetPacks ||
          !onPublicAssetPackSelection ||
          hasAssetFiltersApplied // Don't show public packs if filtering on assets.
        )
          return [];
        return publicAssetPacks.map((assetPack, index) => (
          <PublicAssetPackTile
            assetPack={assetPack}
            onSelect={() => onPublicAssetPackSelection(assetPack)}
            key={`${assetPack.tag}-${index}`}
          />
        ));
      },
      [publicAssetPacks, onPublicAssetPackSelection, hasAssetFiltersApplied]
    );

    const { allStandAlonePackTiles, allBundlePackTiles } = React.useMemo(
      () => {
        const privateAssetPackStandAloneTiles: Array<React.Node> = [];
        const privateOwnedAssetPackStandAloneTiles: Array<React.Node> = [];
        const privateAssetPackBundleTiles: Array<React.Node> = [];
        const privateOwnedAssetPackBundleTiles: Array<React.Node> = [];

        if (
          !privateAssetPackListingDatas ||
          !receivedAssetPacks ||
          hasAssetFiltersApplied // Don't show private packs if filtering on assets.
        ) {
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
        hasAssetFiltersApplied,
      ]
    );

    const gameTemplateTiles = React.useMemo(
      () => {
        if (
          !privateGameTemplateListingDatas ||
          !onPrivateGameTemplateSelection ||
          hasAssetFiltersApplied || // Don't show private game templates if filtering on assets.
          hasAssetPackFiltersApplied // Don't show private game templates if filtering on asset packs.
        )
          return [];

        return privateGameTemplateListingDatas.map(
          (privateGameTemplateListingData, index) => (
            <PrivateGameTemplateTile
              privateGameTemplateListingData={privateGameTemplateListingData}
              onSelect={() => {
                onPrivateGameTemplateSelection(privateGameTemplateListingData);
              }}
              owned={
                !!receivedGameTemplates &&
                !!receivedGameTemplates.find(
                  pack => pack.id === privateGameTemplateListingData.id
                )
              }
              key={privateGameTemplateListingData.id}
            />
          )
        );
      },
      [
        privateGameTemplateListingDatas,
        onPrivateGameTemplateSelection,
        receivedGameTemplates,
        hasAssetFiltersApplied,
        hasAssetPackFiltersApplied,
      ]
    );

    const packMainImageUrl = openedAssetPack
      ? openedAssetPack.thumbnailUrl
        ? openedAssetPack.thumbnailUrl
        : openedAssetPack.previewImageUrls
        ? openedAssetPack.previewImageUrls[0]
        : null
      : null;

    React.useEffect(
      () => {
        (async () => {
          if (!selectedPrivateAssetPackListingData) {
            setAuthorPublicProfile(null);
            return;
          }
          try {
            const authorProfile = await getUserPublicProfile(
              selectedPrivateAssetPackListingData.sellerId
            );

            setAuthorPublicProfile(authorProfile);
          } catch (error) {
            console.error(error);
            // Do not block the UI if the author profile can't be fetched.
          }
        })();
      },
      [selectedPrivateAssetPackListingData]
    );

    const publicAssetPackAuthors: ?Array<Author> = React.useMemo(
      () =>
        openedAssetPack && authors && openedAssetPack.authors
          ? openedAssetPack.authors
              .map(author => {
                return authors.find(({ name }) => name === author.name);
              })
              .filter(Boolean)
          : [],
      [openedAssetPack, authors]
    );

    const publicAssetPackLicenses: ?Array<License> = React.useMemo(
      () =>
        openedAssetPack && licenses && openedAssetPack.licenses
          ? openedAssetPack.licenses
              .map(license => {
                return licenses.find(({ name }) => name === license.name);
              })
              .filter(Boolean)
          : [],
      [openedAssetPack, licenses]
    );

    return (
      <ScrollView
        ref={scrollView}
        id="asset-store-listing"
        style={{
          ...styles.scrollView,
          ...(noScroll ? { overflow: 'hidden' } : {}),
        }}
      >
        {!assetTiles && !shopError && <PlaceholderLoader />}
        {!assetTiles && shopError && (
          <PlaceholderError onRetry={fetchAssetsAndGameTemplates}>
            <Trans>
              Can't load the results. Verify your internet connection or retry
              later.
            </Trans>
          </PlaceholderError>
        )}
        {!openedAssetPack && gameTemplateTiles.length ? (
          <Line expand>
            <Column noMargin expand>
              <GridList
                cols={getShopItemsColumns(windowWidth)}
                style={styles.grid}
                cellHeight="auto"
                spacing={cellSpacing / 2}
              >
                {gameTemplateTiles}
              </GridList>
            </Column>
          </Line>
        ) : null}
        {!openedAssetPack && allBundlePackTiles.length ? (
          <Line expand>
            <Column noMargin expand>
              <GridList
                cols={getShopItemsColumns(windowWidth)}
                style={styles.grid}
                cellHeight="auto"
                spacing={cellSpacing / 2}
              >
                {allBundlePackTiles}
              </GridList>
            </Column>
          </Line>
        ) : null}
        {!openedAssetPack && allStandAlonePackTiles.length ? (
          <Line expand>
            <Column noMargin expand>
              <GridList
                cols={getShopItemsColumns(windowWidth)}
                style={styles.grid}
                cellHeight="auto"
                spacing={cellSpacing / 2}
              >
                {allStandAlonePackTiles}
              </GridList>
            </Column>
          </Line>
        ) : null}
        {openedAssetPack && (
          <Column>
            <ResponsiveLineStackLayout>
              {packMainImageUrl && (
                <Line>
                  <CorsAwareImage
                    key={openedAssetPack.name}
                    style={styles.previewImage}
                    src={
                      openedAssetPack.thumbnailUrl
                        ? openedAssetPack.thumbnailUrl
                        : openedAssetPack.previewImageUrls
                        ? openedAssetPack.previewImageUrls[0]
                        : ''
                    }
                    alt={`Preview image of asset pack ${openedAssetPack.name}`}
                  />
                  <LargeSpacer />
                </Line>
              )}
              <Column noMargin alignItems="flex-start" expand>
                <Text size="bold-title">{openedAssetPack.name}</Text>
                {!!publicAssetPackAuthors && publicAssetPackAuthors.length > 0 && (
                  <Text size="body" displayInlineAsSpan>
                    <Trans>by</Trans>{' '}
                    {publicAssetPackAuthors.map((author, index) => (
                      <React.Fragment key={author.name}>
                        {index > 0 && <>, </>}
                        <Link
                          key={author.name}
                          href={author.website}
                          onClick={() => Window.openExternalURL(author.website)}
                        >
                          {author.name}
                        </Link>
                      </React.Fragment>
                    ))}
                  </Text>
                )}

                {!!publicAssetPackLicenses &&
                  publicAssetPackLicenses.length > 0 && (
                    <Text size="body">
                      <Trans>
                        Type of License:{' '}
                        {
                          <Link
                            href={publicAssetPackLicenses[0].website}
                            onClick={() =>
                              Window.openExternalURL(
                                publicAssetPackLicenses[0].website
                              )
                            }
                          >
                            {publicAssetPackLicenses[0].name}
                          </Link>
                        }
                      </Trans>
                    </Text>
                  )}
                {authorPublicProfile && (
                  <Text displayInlineAsSpan size="sub-title">
                    <Trans>by</Trans>{' '}
                    <Link
                      onClick={() => setOpenAuthorPublicProfileDialog(true)}
                      href="#"
                    >
                      {authorPublicProfile.username || ''}
                    </Link>
                  </Text>
                )}
              </Column>
            </ResponsiveLineStackLayout>
          </Column>
        )}
        {openedAssetPack &&
        (folderTiles.length || (assetTiles && assetTiles.length)) ? (
          <Column>
            <Text size="section-title">
              <Trans>Content</Trans>
            </Text>
          </Column>
        ) : null}
        {selectedFolders.length > 1 && onGoBackToFolderIndex ? (
          <Column>
            <Line>
              <Breadcrumbs
                steps={selectedFolders.map((folder, index) => {
                  if (index === selectedFolders.length - 1) {
                    return {
                      label: capitalize(folder),
                    };
                  }
                  return {
                    label: capitalize(folder),
                    onClick: () => {
                      onGoBackToFolderIndex(index);
                    },
                    href: '#',
                  };
                })}
              />
            </Line>
          </Column>
        ) : null}
        {openedAssetPack && folderTiles.length ? (
          <Column justifyContent="center">
            <GridList
              style={styles.grid}
              cellHeight="auto"
              cols={getAssetFoldersColumns(windowWidth)}
              spacing={cellSpacing / 2}
            >
              {folderTiles}
            </GridList>
            <LargeSpacer />
          </Column>
        ) : null}
        {isNavigatingInsideFolder ? (
          <PlaceholderLoader />
        ) : assetTiles && assetTiles.length ? (
          <GridList style={styles.grid} cellHeight="auto">
            {assetTiles}
          </GridList>
        ) : openedAssetPack &&
          openedAssetPack.content &&
          isAssetPackAudioOnly(openedAssetPack) ? (
          <PrivateAssetPackAudioFilesDownloadButton
            assetPack={openedAssetPack}
          />
        ) : null}
        {assetTiles && // loading is finished.
        !assetTiles.length && // No assets to show.
        !allBundlePackTiles.length && // No bundles to show.
        !allStandAlonePackTiles.length && // No packs to show.
        !gameTemplateTiles.length && // no templates to show.
        (!openedAssetPack ||
          !openedAssetPack.content ||
          !isAssetPackAudioOnly(openedAssetPack)) && // It's not an audio pack.
          noResultComponent}
        {onPrivateAssetPackSelection &&
          openAuthorPublicProfileDialog &&
          authorPublicProfile && (
            <PublicProfileDialog
              userId={authorPublicProfile.id}
              onClose={() => setOpenAuthorPublicProfileDialog(false)}
              onAssetPackOpen={assetPackListingData => {
                onPrivateAssetPackSelection(assetPackListingData);
                setOpenAuthorPublicProfileDialog(false);
                setAuthorPublicProfile(null);
              }}
            />
          )}
      </ScrollView>
    );
  }
);

export default AssetsList;
