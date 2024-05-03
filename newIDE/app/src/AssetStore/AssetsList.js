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
  useResponsiveWindowSize,
  type WindowSizeType,
} from '../UI/Responsive/ResponsiveWindowMeasurer';
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
import { ResponsiveLineStackLayout, LineStackLayout } from '../UI/Layout';
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
import RaisedButton from '../UI/RaisedButton';
import FlatButton from '../UI/FlatButton';
import HelpIcon from '../UI/HelpIcon';
import { OwnedProductLicense } from './ProductLicense/ProductLicenseOptions';
import { getUserProductPurchaseUsageType } from './ProductPageHelper';

const ASSETS_DISPLAY_LIMIT = 250;

const getAssetSize = (windowSize: WindowSizeType) => {
  switch (windowSize) {
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

const getShopItemsColumns = (
  windowSize: WindowSizeType,
  isLandscape: boolean
) => {
  switch (windowSize) {
    case 'small':
      return isLandscape ? 3 : 1;
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

const getAssetFoldersColumns = (
  windowSize: WindowSizeType,
  isLandscape: boolean
) => {
  switch (windowSize) {
    case 'small':
      return isLandscape ? 2 : 1;
    case 'medium':
      return 1;
    case 'large':
    case 'xlarge':
      return 2;
    default:
      return 2;
  }
};

const getPageBreakAssetLowerIndex = (pageBreakIndex: number) =>
  ASSETS_DISPLAY_LIMIT * pageBreakIndex;
const getPageBreakAssetUpperIndex = (pageBreakIndex: number) =>
  ASSETS_DISPLAY_LIMIT * (pageBreakIndex + 1);

export const getAssetShortHeadersToDisplay = (
  allAssetShortHeaders: AssetShortHeader[],
  selectedFolders: string[],
  pageBreakIndex: number = 0
): AssetShortHeader[] => {
  let assetShortHeaders = allAssetShortHeaders.filter(assetShortHeader => {
    if (!selectedFolders.length) return true;
    const allAssetTags = assetShortHeader.tags;
    // Check that the asset has all the selected folders tags.
    return selectedFolders.every(folderTag => allAssetTags.includes(folderTag));
  });
  // Limit the number of displayed assets to avoid performance issues
  const pageBreakAssetLowerIndex = getPageBreakAssetLowerIndex(pageBreakIndex);
  const pageBreakAssetUpperIndex = Math.min(
    getPageBreakAssetUpperIndex(pageBreakIndex),
    assetShortHeaders.length
  );
  if (
    pageBreakAssetLowerIndex !== 0 ||
    pageBreakAssetUpperIndex !== assetShortHeaders.length
  ) {
    assetShortHeaders = assetShortHeaders.slice(
      pageBreakAssetLowerIndex,
      pageBreakAssetUpperIndex
    );
  }
  return assetShortHeaders;
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
  previewImageContainer: {
    display: 'flex',
    flex: 0.7,
    alignItems: 'flex-start',
  },
  previewImage: {
    width: '100%',
    // Prevent cumulative layout shift by enforcing
    // the 16:9 ratio.
    aspectRatio: '16 / 9',
    objectFit: 'contain',
    position: 'relative',
  },
  openProductContainer: {
    display: 'flex',
    paddingLeft: 32, // To align with licensing options.
    marginTop: 8,
    marginBottom: 8,
  },
};

type PageBreakNavigationProps = {|
  currentPage: AssetStorePageState,
  pageBreakIndex: number,
  setPageBreakIndex: number => void,
  assetShortHeaders: Array<AssetShortHeader>,
  scrollView: ?ScrollViewInterface,
|};

const PageBreakNavigation = ({
  currentPage,
  pageBreakIndex,
  setPageBreakIndex,
  assetShortHeaders,
  scrollView,
}: PageBreakNavigationProps) => {
  return (
    <Column>
      <LineStackLayout justifyContent="center">
        <FlatButton
          key="previous-assets"
          label={<Trans>Show previous assets</Trans>}
          onClick={() => {
            currentPage.pageBreakIndex = Math.max(
              0,
              (currentPage.pageBreakIndex || 0) - 1
            );
            setPageBreakIndex(currentPage.pageBreakIndex);
            scrollView && scrollView.scrollToPosition(0);
          }}
          disabled={pageBreakIndex <= 0}
        />
        <RaisedButton
          key="next-assets"
          primary
          label={<Trans>Show next assets</Trans>}
          onClick={() => {
            currentPage.pageBreakIndex = (currentPage.pageBreakIndex || 0) + 1;
            setPageBreakIndex(currentPage.pageBreakIndex);
            scrollView && scrollView.scrollToPosition(0);
          }}
          disabled={
            assetShortHeaders.length <
            getPageBreakAssetUpperIndex(pageBreakIndex)
          }
        />
      </LineStackLayout>
    </Column>
  );
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
    privateAssetPackListingData: PrivateAssetPackListingData,
    options?: {|
      forceProductPage?: boolean,
    |}
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
    const {
      receivedAssetPacks,
      receivedGameTemplates,
      assetPackPurchases,
    } = React.useContext(AuthenticatedUserContext);
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
    const { windowSize, isLandscape } = useResponsiveWindowSize();
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
          // public pack selected.
          !openedAssetPack.id
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

    const [pageBreakIndex, setPageBreakIndex] = React.useState<number>(
      (currentPage && currentPage.pageBreakIndex) || 0
    );

    const assetTiles = React.useMemo(
      () => {
        // Loading
        if (!assetShortHeaders) return null;
        // Don't show assets if filtering on asset packs.)
        if (hasAssetPackFiltersApplied && !openedAssetPack) return [];

        return getAssetShortHeadersToDisplay(
          assetShortHeaders,
          selectedFolders,
          pageBreakIndex
        ).map(assetShortHeader => (
          <AssetCardTile
            assetShortHeader={assetShortHeader}
            onOpenDetails={() => onOpenDetails(assetShortHeader)}
            size={getAssetSize(windowSize)}
            key={assetShortHeader.id}
            margin={cellSpacing / 2}
          />
        ));
      },
      [
        assetShortHeaders,
        hasAssetPackFiltersApplied,
        openedAssetPack,
        selectedFolders,
        pageBreakIndex,
        windowSize,
        onOpenDetails,
      ]
    );

    const publicPacksTiles: Array<React.Node> = React.useMemo(
      () => {
        if (
          !publicAssetPacks ||
          !onPublicAssetPackSelection ||
          // Don't show public packs if filtering on assets.
          hasAssetFiltersApplied
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
          // Don't show private packs if filtering on assets.
          hasAssetFiltersApplied
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
          // Don't show private game templates if filtering on assets.
          hasAssetFiltersApplied ||
          // Don't show private game templates if filtering on asset packs.
          hasAssetPackFiltersApplied
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

    const privateAssetPackLicense = React.useMemo(
      () =>
        getUserProductPurchaseUsageType({
          productId:
            openedAssetPack && openedAssetPack.id ? openedAssetPack.id : null,
          receivedProducts: receivedAssetPacks,
          productPurchases: assetPackPurchases,
          allProductListingDatas: allPrivateAssetPackListingDatas,
        }),
      [
        assetPackPurchases,
        openedAssetPack,
        allPrivateAssetPackListingDatas,
        receivedAssetPacks,
      ]
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
        {currentPage &&
          assetShortHeaders &&
          assetShortHeaders.length > getPageBreakAssetUpperIndex(0) &&
          pageBreakIndex > 0 && (
            <PageBreakNavigation
              currentPage={currentPage}
              pageBreakIndex={pageBreakIndex}
              setPageBreakIndex={setPageBreakIndex}
              assetShortHeaders={assetShortHeaders}
              scrollView={scrollView.current}
            />
          )}
        {!openedAssetPack &&
        gameTemplateTiles.length &&
        pageBreakIndex === 0 ? (
          <Line expand>
            <Column noMargin expand>
              <GridList
                cols={getShopItemsColumns(windowSize, isLandscape)}
                style={styles.grid}
                cellHeight="auto"
                spacing={cellSpacing / 2}
              >
                {gameTemplateTiles}
              </GridList>
            </Column>
          </Line>
        ) : null}
        {!openedAssetPack &&
        allBundlePackTiles.length &&
        pageBreakIndex === 0 ? (
          <Line expand>
            <Column noMargin expand>
              <GridList
                cols={getShopItemsColumns(windowSize, isLandscape)}
                style={styles.grid}
                cellHeight="auto"
                spacing={cellSpacing / 2}
              >
                {allBundlePackTiles}
              </GridList>
            </Column>
          </Line>
        ) : null}
        {!openedAssetPack &&
        allStandAlonePackTiles.length &&
        pageBreakIndex === 0 ? (
          <Line expand>
            <Column noMargin expand>
              <GridList
                cols={getShopItemsColumns(windowSize, isLandscape)}
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
                <div style={styles.previewImageContainer}>
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
                </div>
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
                {privateAssetPackLicense && onPrivateAssetPackSelection && (
                  <Column noMargin>
                    <Line noMargin>
                      <Text size="sub-title">
                        <Trans>Licensing</Trans>
                      </Text>
                      <HelpIcon
                        size="small"
                        helpPagePath="https://gdevelop.io/page/asset-store-license-agreement"
                      />
                    </Line>
                    <OwnedProductLicense
                      productType="asset-pack"
                      ownedLicense={privateAssetPackLicense}
                    />
                    <div style={styles.openProductContainer}>
                      <FlatButton
                        label={<Trans>Open in Store</Trans>}
                        onClick={() => {
                          // Ensure this is a private pack and we are on the store.
                          if (
                            !openedAssetPack.id ||
                            !allPrivateAssetPackListingDatas ||
                            !currentPage
                          )
                            return;
                          const assetPackListingData = allPrivateAssetPackListingDatas.find(
                            listingData => listingData.id === openedAssetPack.id
                          );
                          if (!assetPackListingData) return;
                          onPrivateAssetPackSelection(assetPackListingData, {
                            forceProductPage: true,
                          });
                        }}
                        primary
                      />
                    </div>
                  </Column>
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
              cols={getAssetFoldersColumns(windowSize, isLandscape)}
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
        {// loading is finished.
        assetTiles &&
          // No assets to show.
          !assetTiles.length &&
          // No bundles to show.
          !allBundlePackTiles.length &&
          // No packs to show.
          !allStandAlonePackTiles.length &&
          // no templates to show.
          !gameTemplateTiles.length &&
          (!openedAssetPack ||
            !openedAssetPack.content ||
            // It's not an audio pack.
            !isAssetPackAudioOnly(openedAssetPack)) &&
          noResultComponent}
        {onPrivateAssetPackSelection &&
          onPrivateGameTemplateSelection &&
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
              onGameTemplateOpen={gameTemplateListingData => {
                onPrivateGameTemplateSelection(gameTemplateListingData);
                setOpenAuthorPublicProfileDialog(false);
                setAuthorPublicProfile(null);
              }}
            />
          )}

        {currentPage &&
          assetShortHeaders &&
          assetShortHeaders.length > getPageBreakAssetUpperIndex(0) && (
            <PageBreakNavigation
              currentPage={currentPage}
              pageBreakIndex={pageBreakIndex}
              setPageBreakIndex={setPageBreakIndex}
              assetShortHeaders={assetShortHeaders}
              scrollView={scrollView.current}
            />
          )}
      </ScrollView>
    );
  }
);

export default AssetsList;
