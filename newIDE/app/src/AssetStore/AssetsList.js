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
  type BundleListingData,
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
import { AssetCardTile, AssetFolderTile } from './ShopTiles';
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
import Window from '../Utils/Window';
import Breadcrumbs from '../UI/Breadcrumbs';
import { getFolderTagsFromAssetShortHeaders } from './TagsHelper';
import { PrivateGameTemplateStoreContext } from './PrivateGameTemplates/PrivateGameTemplateStoreContext';
import { type AssetStorePageState } from './AssetStoreNavigator';
import FlatButton from '../UI/FlatButton';
import HelpIcon from '../UI/HelpIcon';
import { OwnedProductLicense } from './ProductLicense/ProductLicenseOptions';
import { getUserProductPurchaseUsageType } from './ProductPageHelper';
import PublicProfileContext from '../Profile/PublicProfileContext';
import { BundleStoreContext } from './Bundles/BundleStoreContext';
import {
  getBundleTiles,
  getGameTemplateTiles,
  getAssetPackTiles,
  getPublicAssetPackTiles,
} from './AssetStoreUtils';
import { LARGE_WIDGET_SIZE } from '../MainFrame/EditorContainers/HomePage/CardWidget';

const ASSETS_DISPLAY_LIMIT = 60;

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
      return isLandscape ? 3 : 2;
    case 'medium':
      return 2;
    case 'large':
      return 4;
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

const cellSpacing = 10;
const MAX_COLUMNS = getShopItemsColumns('xlarge', true);
const MAX_SECTION_WIDTH = (LARGE_WIDGET_SIZE + 2 * 5) * MAX_COLUMNS; // widget size + 5 padding per side
const styles = {
  grid: {
    // Avoid tiles taking too much space on large screens.
    maxWidth: MAX_SECTION_WIDTH,
    width: `calc(100% + ${cellSpacing}px)`, // This is needed to compensate for the `margin: -5px` added by MUI related to spacing.
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
        <FlatButton
          key="next-assets"
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
  setPageBreakIndex: (index: number) => void,
|};

type Props = {|
  assetShortHeaders: ?Array<AssetShortHeader>,
  privateAssetPackListingDatas?: ?Array<PrivateAssetPackListingData>,
  privateGameTemplateListingDatas?: ?Array<PrivateGameTemplateListingData>,
  bundleListingDatas?: ?Array<BundleListingData>,
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
  onBundleSelection?: (bundleListingData: BundleListingData) => void,
  onFolderSelection?: (folderTag: string) => void,
  onGoBackToFolderIndex?: (folderIndex: number) => void,
  noScroll?: boolean,
  // This component can either display the list of assets, packs, and game templates using the asset store navigator,
  // then currentPage is the current page of the navigator.
  // Or it can display arbitrary content, like the list of assets in a pack, or similar assets,
  // then currentPage is null.
  currentPage?: AssetStorePageState,
  onlyShowAssets?: boolean,
  hideDetails?: boolean,
|};

const AssetsList = React.forwardRef<Props, AssetsListInterface>(
  (
    {
      assetShortHeaders,
      onOpenDetails,
      noResultsPlaceHolder,
      privateAssetPackListingDatas,
      privateGameTemplateListingDatas,
      bundleListingDatas,
      publicAssetPacks,
      onPrivateAssetPackSelection,
      onPublicAssetPackSelection,
      onPrivateGameTemplateSelection,
      onBundleSelection,
      onFolderSelection,
      onGoBackToFolderIndex,
      noScroll,
      currentPage,
      onlyShowAssets,
      hideDetails,
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
      privateGameTemplateListingDatas: allPrivateGameTemplateListingDatas,
    } = React.useContext(PrivateGameTemplateStoreContext);
    const {
      error: bundleStoreError,
      fetchBundles,
      bundleListingDatas: allBundleListingDatas,
    } = React.useContext(BundleStoreContext);
    const {
      receivedAssetPacks,
      receivedGameTemplates,
      receivedBundles,
      assetPackPurchases,
      bundlePurchases,
    } = React.useContext(AuthenticatedUserContext);
    const [
      authorPublicProfile,
      setAuthorPublicProfile,
    ] = React.useState<?UserPublicProfile>(null);
    const { openUserPublicProfile } = React.useContext(PublicProfileContext);
    const [
      isNavigatingInsideFolder,
      setIsNavigatingInsideFolder,
    ] = React.useState<boolean>(false);
    const [pageBreakIndex, setPageBreakIndex] = React.useState<number>(
      (currentPage && currentPage.pageBreakIndex) || 0
    );
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
      setPageBreakIndex: (index: number) => {
        setPageBreakIndex(index);
      },
    }));

    const fetchAssetsAndGameTemplates = React.useCallback(
      () => {
        fetchAssetsAndFilters();
        fetchGameTemplates();
        fetchBundles();
      },
      [fetchAssetsAndFilters, fetchGameTemplates, fetchBundles]
    );

    const shopError =
      assetStoreError || gameTemplateStoreError || bundleStoreError;

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

    const assetTiles = React.useMemo(
      () => {
        // Loading
        if (!assetShortHeaders) return null;
        // Don't show assets if filtering on asset packs.)
        if (hasAssetPackFiltersApplied && !openedAssetPack) return [];
        const assetSize = getAssetSize(windowSize);

        return getAssetShortHeadersToDisplay(
          assetShortHeaders,
          selectedFolders,
          pageBreakIndex
        ).map(assetShortHeader => (
          <AssetCardTile
            assetShortHeader={assetShortHeader}
            onOpenDetails={() => onOpenDetails(assetShortHeader)}
            size={assetSize}
            key={assetShortHeader.id}
            margin={cellSpacing / 2}
            hideShortDescription={!!hideDetails}
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
        hideDetails,
      ]
    );

    const publicPackTiles: Array<React.Node> = React.useMemo(
      () =>
        getPublicAssetPackTiles({
          publicAssetPacks,
          onPublicAssetPackSelection,
          hasAssetFiltersApplied,
        }),
      [publicAssetPacks, onPublicAssetPackSelection, hasAssetFiltersApplied]
    );

    const {
      allAssetPackStandAloneTiles,
      allAssetPackBundleTiles,
    } = React.useMemo(
      () =>
        getAssetPackTiles({
          allPrivateAssetPackListingDatas,
          displayedPrivateAssetPackListingDatas: privateAssetPackListingDatas,
          onPrivateAssetPackSelection,
          publicAssetPackTiles: publicPackTiles,
          receivedAssetPacks,
          hasAssetFiltersApplied,
        }),
      [
        allPrivateAssetPackListingDatas,
        privateAssetPackListingDatas,
        onPrivateAssetPackSelection,
        publicPackTiles,
        receivedAssetPacks,
        hasAssetFiltersApplied,
      ]
    );

    const gameTemplateTiles = React.useMemo(
      () =>
        getGameTemplateTiles({
          allPrivateGameTemplateListingDatas,
          displayedPrivateGameTemplateListingDatas: privateGameTemplateListingDatas,
          onPrivateGameTemplateSelection,
          receivedGameTemplates,
          hasAssetFiltersApplied,
          hasAssetPackFiltersApplied,
          onlyShowAssets,
        }),
      [
        allPrivateGameTemplateListingDatas,
        privateGameTemplateListingDatas,
        onPrivateGameTemplateSelection,
        receivedGameTemplates,
        hasAssetFiltersApplied,
        hasAssetPackFiltersApplied,
        onlyShowAssets,
      ]
    );

    const bundleTiles = React.useMemo(
      () =>
        getBundleTiles({
          allBundleListingDatas: allBundleListingDatas,
          displayedBundleListingDatas: bundleListingDatas,
          onBundleSelection,
          receivedBundles,
          hasAssetFiltersApplied,
          onlyShowAssets,
        }),
      [
        allBundleListingDatas,
        bundleListingDatas,
        onBundleSelection,
        receivedBundles,
        hasAssetFiltersApplied,
        onlyShowAssets,
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
          receivedProducts: [
            ...(receivedAssetPacks || []),
            ...(receivedBundles || []),
          ],
          productPurchases: [
            ...(assetPackPurchases || []),
            ...(bundlePurchases || []),
          ],
          allProductListingDatas: [
            ...(allPrivateAssetPackListingDatas || []),
            ...(bundleListingDatas || []),
          ],
        }),
      [
        assetPackPurchases,
        bundlePurchases,
        openedAssetPack,
        allPrivateAssetPackListingDatas,
        bundleListingDatas,
        receivedAssetPacks,
        receivedBundles,
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
        {!openedAssetPack && bundleTiles.length && pageBreakIndex === 0 ? (
          <Line>
            <Column noMargin expand>
              <GridList
                cols={getShopItemsColumns(windowSize, isLandscape)}
                style={styles.grid}
                cellHeight="auto"
                spacing={cellSpacing}
              >
                {bundleTiles}
              </GridList>
            </Column>
          </Line>
        ) : null}
        {!openedAssetPack &&
        gameTemplateTiles.length &&
        pageBreakIndex === 0 ? (
          <Line>
            <Column noMargin expand>
              <GridList
                cols={getShopItemsColumns(windowSize, isLandscape)}
                style={styles.grid}
                cellHeight="auto"
                spacing={cellSpacing}
              >
                {gameTemplateTiles}
              </GridList>
            </Column>
          </Line>
        ) : null}
        {!openedAssetPack &&
        allAssetPackBundleTiles.length &&
        pageBreakIndex === 0 ? (
          <Line>
            <Column noMargin expand>
              <GridList
                cols={getShopItemsColumns(windowSize, isLandscape)}
                style={styles.grid}
                cellHeight="auto"
                spacing={cellSpacing}
              >
                {allAssetPackBundleTiles}
              </GridList>
            </Column>
          </Line>
        ) : null}
        {!openedAssetPack &&
        allAssetPackStandAloneTiles.length &&
        pageBreakIndex === 0 ? (
          <Line>
            <Column noMargin expand>
              <GridList
                cols={getShopItemsColumns(windowSize, isLandscape)}
                style={styles.grid}
                cellHeight="auto"
                spacing={cellSpacing}
              >
                {allAssetPackStandAloneTiles}
              </GridList>
            </Column>
          </Line>
        ) : null}
        {openedAssetPack && (
          <Column>
            <ResponsiveLineStackLayout noResponsiveLandscape>
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
                      onClick={() =>
                        openUserPublicProfile({
                          userId: authorPublicProfile.id,
                          callbacks: {
                            onAssetPackOpen: onPrivateAssetPackSelection
                              ? onPrivateAssetPackSelection
                              : undefined,
                            onGameTemplateOpen: onPrivateGameTemplateSelection
                              ? onPrivateGameTemplateSelection
                              : undefined,
                          },
                        })
                      }
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
          <Column justifyContent="center" noMargin>
            <GridList
              style={styles.grid}
              cellHeight="auto"
              cols={getAssetFoldersColumns(windowSize, isLandscape)}
              spacing={cellSpacing}
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
          !bundleTiles.length &&
          // No asset pack bundles to show.
          !allAssetPackBundleTiles.length &&
          // No packs to show.
          !allAssetPackStandAloneTiles.length &&
          // no templates to show.
          !gameTemplateTiles.length &&
          (!openedAssetPack ||
            !openedAssetPack.content ||
            // It's not an audio pack.
            !isAssetPackAudioOnly(openedAssetPack)) &&
          noResultComponent}
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
