// @flow
import * as React from 'react';
import { t, Trans } from '@lingui/macro';
import ChevronArrowLeft from '../UI/CustomSvgIcons/ChevronArrowLeft';
import Tune from '../UI/CustomSvgIcons/Tune';
import SearchBar from '../UI/SearchBar';
import { Column, Line, Spacer } from '../UI/Grid';
import ScrollView from '../UI/ScrollView';
import Window from '../Utils/Window';
import {
  sendAssetOpened,
  sendAssetPackInformationOpened,
  sendAssetPackOpened,
} from '../Utils/Analytics/EventSender';
import {
  type AssetShortHeader,
  type PublicAssetPack,
  type PublicAssetPacks,
  type PrivateAssetPack,
  doesAssetPackContainAudio,
  isAssetPackAudioOnly,
} from '../Utils/GDevelopServices/Asset';
import { type PrivateAssetPackListingData } from '../Utils/GDevelopServices/Shop';
import {
  BoxSearchResults,
  type BoxSearchResultsInterface,
} from '../UI/Search/BoxSearchResults';
import { type SearchBarInterface } from '../UI/SearchBar';
import {
  AssetStoreFilterPanel,
  clearAllFilters,
} from './AssetStoreFilterPanel';
import { AssetStoreContext } from './AssetStoreContext';
import { AssetCard } from './AssetCard';
import { NoResultPlaceholder } from './NoResultPlaceholder';
import { useResponsiveWindowWidth } from '../UI/Reponsive/ResponsiveWindowMeasurer';
import { useShouldAutofocusInput } from '../UI/Reponsive/ScreenTypeMeasurer';
import Subheader from '../UI/Subheader';
import { AssetsHome, type AssetsHomeInterface } from './AssetsHome';
import TextButton from '../UI/TextButton';
import Text from '../UI/Text';
import IconButton from '../UI/IconButton';
import { AssetDetails, type AssetDetailsInterface } from './AssetDetails';
import PlaceholderLoader from '../UI/PlaceholderLoader';
import Home from '../UI/CustomSvgIcons/Home';
import PrivateAssetPackInformationPage from './PrivateAssets/PrivateAssetPackInformationPage';
import PlaceholderError from '../UI/PlaceholderError';
import AlertMessage from '../UI/AlertMessage';
import AuthenticatedUserContext from '../Profile/AuthenticatedUserContext';
import PrivateAssetPackPurchaseDialog from './PrivateAssets/PrivateAssetPackPurchaseDialog';
import { LineStackLayout } from '../UI/Layout';
import {
  isHomePage,
  isSearchResultPage,
  type AssetStorePageState,
} from './AssetStoreNavigator';
import RaisedButton from '../UI/RaisedButton';
import { ResponsivePaperOrDrawer } from '../UI/ResponsivePaperOrDrawer';
import PrivateAssetsAuthorizationContext from './PrivateAssets/PrivateAssetsAuthorizationContext';
import Music from '../UI/CustomSvgIcons/Music';

const capitalize = (str: string) => {
  return str ? str[0].toUpperCase() + str.substr(1) : '';
};

type Props = {||};

export type AssetStoreInterface = {|
  onClose: () => void,
|};

const identifyAssetPackKind = ({
  privateAssetPacks,
  publicAssetPacks,
  assetPack,
}: {|
  privateAssetPacks: ?Array<PrivateAssetPackListingData>,
  publicAssetPacks: ?PublicAssetPacks,
  assetPack: PrivateAssetPack | PublicAssetPack | null,
|}) => {
  if (!assetPack) return 'unknown';

  // We could simplify this if the asset packs have a "kind" or "type" in the future.
  // For now, we check their presence in the lists to ensure adding fields in the backend
  // won't break this detection in the future (for example, if public asset packs get an `id`,
  // this won't break).
  return assetPack.id &&
    privateAssetPacks &&
    !!privateAssetPacks.find(({ id }) => id === assetPack.id)
    ? 'private'
    : publicAssetPacks &&
      publicAssetPacks.starterPacks.find(({ tag }) => tag === assetPack.tag)
    ? 'public'
    : 'unknown';
};

export const AssetStore = React.forwardRef<Props, AssetStoreInterface>(
  (props: Props, ref) => {
    const {
      publicAssetPacks,
      privateAssetPacks,
      searchResults,
      error,
      fetchAssetsAndFilters,
      navigationState,
      searchText,
      setSearchText,
      assetFiltersState,
      assetPackRandomOrdering,
    } = React.useContext(AssetStoreContext);
    const currentPage = navigationState.getCurrentPage();
    const {
      openedAssetPack,
      openedAssetShortHeader,
      openedAssetCategory,
      openedPrivateAssetPackListingData,
      filtersState,
    } = currentPage;
    const isOnHomePage = isHomePage(currentPage);
    const isOnSearchResultPage = isSearchResultPage(currentPage);
    const searchBar = React.useRef<?SearchBarInterface>(null);
    const shouldAutofocusSearchbar = useShouldAutofocusInput();

    const windowWidth = useResponsiveWindowWidth();

    const [isFiltersPanelOpen, setIsFiltersPanelOpen] = React.useState(
      !isOnHomePage && !openedAssetShortHeader
    );
    const openFiltersPanelIfAppropriate = React.useCallback(
      () => {
        if (windowWidth === 'small') {
          // Never open automatically the filters on small screens
          return;
        }

        setIsFiltersPanelOpen(true);
      },
      [windowWidth]
    );

    const [
      purchasingPrivateAssetPackListingData,
      setPurchasingPrivateAssetPackListingData,
    ] = React.useState<?PrivateAssetPackListingData>(null);
    const { onPurchaseSuccessful, receivedAssetPacks } = React.useContext(
      AuthenticatedUserContext
    );
    const { getPrivateAssetPackAudioArchiveUrl } = React.useContext(
      PrivateAssetsAuthorizationContext
    );
    const [
      isAudioArchiveUrlLoading,
      setIsAudioArchiveUrlLoading,
    ] = React.useState(false);

    // The saved scroll position must not be reset by a scroll event until it
    // has been applied.
    const hasAppliedSavedScrollPosition = React.useRef<boolean>(false);
    const isAssetDetailLoading = React.useRef<boolean>(
      openedAssetShortHeader != null
    );
    const setScrollUpdateIsNeeded = React.useCallback(
      (page: AssetStorePageState) => {
        hasAppliedSavedScrollPosition.current = false;
        isAssetDetailLoading.current = page.openedAssetShortHeader !== null;
      },
      []
    );

    const canShowFiltersPanel =
      !openedAssetShortHeader && // Don't show filters on asset page.
      !openedPrivateAssetPackListingData && // Don't show filters on private asset pack information page.
      !(
        openedAssetPack &&
        openedAssetPack.content &&
        // Don't show filters if opened asset pack contains audio only.
        isAssetPackAudioOnly(openedAssetPack)
      );
    const assetsHome = React.useRef<?AssetsHomeInterface>(null);
    const boxSearchResults = React.useRef<?BoxSearchResultsInterface>(null);
    const assetDetails = React.useRef<?AssetDetailsInterface>(null);
    const getScrollView = React.useCallback(() => {
      return (
        assetsHome.current || boxSearchResults.current || assetDetails.current
      );
    }, []);
    const saveScrollPosition = React.useCallback(
      () => {
        const scrollView = getScrollView();
        if (!scrollView) {
          return;
        }
        currentPage.scrollPosition = scrollView.getScrollPosition();
      },
      [getScrollView, currentPage]
    );
    // This is also called when the asset detail page has loaded.
    const applyBackScrollPosition = React.useCallback(
      () => {
        if (hasAppliedSavedScrollPosition.current) {
          return;
        }
        const scrollView = getScrollView();
        if (!scrollView) {
          return;
        }
        const scrollPosition = currentPage.scrollPosition;
        if (scrollPosition) scrollView.scrollToPosition(scrollPosition);
        // If no saved scroll position, force scroll to 0 in case the displayed component
        // is the same as the previous page so the scroll is naturally kept between pages
        // although the user navigated and the scroll should be reset.
        else scrollView.scrollToPosition(0);
        hasAppliedSavedScrollPosition.current = true;
      },
      [getScrollView, currentPage]
    );

    React.useImperativeHandle(ref, () => ({
      onClose: saveScrollPosition,
    }));

    const onOpenDetails = React.useCallback(
      (assetShortHeader: AssetShortHeader) => {
        const assetPackName = openedAssetPack ? openedAssetPack.name : null;
        const assetPackTag = openedAssetPack ? openedAssetPack.tag : null;
        const assetPackId =
          openedAssetPack && openedAssetPack.id ? openedAssetPack.id : null;
        const assetPackKind = identifyAssetPackKind({
          assetPack: openedAssetPack,
          publicAssetPacks,
          privateAssetPacks,
        });
        sendAssetOpened({
          id: assetShortHeader.id,
          name: assetShortHeader.name,
          assetPackName,
          assetPackTag,
          assetPackId,
          assetPackKind,
        });
        saveScrollPosition();
        navigationState.openDetailPage(assetShortHeader);
      },
      [
        openedAssetPack,
        publicAssetPacks,
        privateAssetPacks,
        saveScrollPosition,
        navigationState,
      ]
    );

    // When a pack is selected from the home page,
    // we set it as the chosen category and open the filters panel.
    const selectPublicAssetPack = React.useCallback(
      (assetPack: PublicAssetPack) => {
        sendAssetPackOpened({
          assetPackTag: assetPack.tag,
          assetPackId: null,
          assetPackName: assetPack.name,
          assetPackKind: 'public',
          source: 'store-home',
        });

        if (assetPack.externalWebLink) {
          Window.openExternalURL(assetPack.externalWebLink);
        } else {
          saveScrollPosition();
          setSearchText('');
          navigationState.openPackPage(assetPack);
          openFiltersPanelIfAppropriate();
        }
      },
      [
        navigationState,
        saveScrollPosition,
        setSearchText,
        openFiltersPanelIfAppropriate,
      ]
    );

    // When a private pack is selected from the home page,
    // if the user owns it, we set it as the chosen category,
    // otherwise we open the page to buy it.
    const selectPrivateAssetPack = React.useCallback(
      (assetPackListingData: PrivateAssetPackListingData) => {
        const receivedAssetPack = receivedAssetPacks
          ? receivedAssetPacks.find(pack => pack.id === assetPackListingData.id)
          : null;

        if (!receivedAssetPack) {
          // The user has not received the pack, open the page to buy it.
          sendAssetPackInformationOpened({
            assetPackName: assetPackListingData.name,
            assetPackId: assetPackListingData.id,
            assetPackKind: 'private',
          });

          setSearchText('');
          saveScrollPosition();
          navigationState.openPrivateAssetPackInformationPage(
            assetPackListingData
          );
          return;
        }

        // The user has received the pack, open it.
        setSearchText('');
        sendAssetPackOpened({
          assetPackName: assetPackListingData.name,
          assetPackId: assetPackListingData.id,
          assetPackTag: null,
          assetPackKind: 'private',
          source: 'store-home',
        });
        saveScrollPosition();
        navigationState.openPackPage(receivedAssetPack);
        openFiltersPanelIfAppropriate();
      },
      [
        receivedAssetPacks,
        saveScrollPosition,
        navigationState,
        setSearchText,
        openFiltersPanelIfAppropriate,
      ]
    );

    const selectAssetCategory = React.useCallback(
      (category: string) => {
        saveScrollPosition();
        navigationState.openAssetCategoryPage(category);
      },
      [navigationState, saveScrollPosition]
    );

    // If the user has received the pack they are currently viewing,
    // we update the window to show it if they are not already on the pack page.
    React.useEffect(
      () => {
        if (!purchasingPrivateAssetPackListingData) return;
        // Ensure the user is not already on the pack page, to trigger the effect only once.
        const isOnPrivatePackPage =
          currentPage.openedAssetPack &&
          currentPage.openedAssetPack.id &&
          currentPage.openedAssetPack.id ===
            purchasingPrivateAssetPackListingData.id;
        if (receivedAssetPacks && !isOnPrivatePackPage) {
          const receivedAssetPack = receivedAssetPacks.find(
            pack => pack.id === purchasingPrivateAssetPackListingData.id
          );
          if (receivedAssetPack) {
            // The user has received the pack, close the pack information dialog, and open the pack in the search.
            setSearchText('');
            openFiltersPanelIfAppropriate();
            saveScrollPosition();
            navigationState.openPackPage(receivedAssetPack);
          }
        }
      },
      [
        receivedAssetPacks,
        purchasingPrivateAssetPackListingData,
        navigationState,
        currentPage,
        saveScrollPosition,
        setSearchText,
        openFiltersPanelIfAppropriate,
      ]
    );

    // When a tag is selected from the asset details page,
    // first determine if it's a public or private pack,
    // then set it as the chosen category, clear old filters and open the filters panel.
    const selectTag = React.useCallback(
      (tag: string) => {
        const privateAssetPack =
          receivedAssetPacks &&
          receivedAssetPacks.find(pack => pack.tag === tag);
        const publicAssetPack =
          publicAssetPacks &&
          publicAssetPacks.starterPacks.find(pack => pack.tag === tag);
        saveScrollPosition();
        setSearchText('');
        if (privateAssetPack) {
          navigationState.openPackPage(privateAssetPack);
        } else if (publicAssetPack) {
          navigationState.openPackPage(publicAssetPack);
        } else {
          navigationState.openTagPage(tag);
        }
        clearAllFilters(assetFiltersState);
        openFiltersPanelIfAppropriate();
      },
      [
        setSearchText,
        receivedAssetPacks,
        publicAssetPacks,
        saveScrollPosition,
        assetFiltersState,
        navigationState,
        openFiltersPanelIfAppropriate,
      ]
    );

    const renderPrivateAssetPackAudioFilesDownloadButton = React.useCallback(
      (assetPack: PrivateAssetPack) => {
        return (
          <RaisedButton
            primary
            label={
              isAudioArchiveUrlLoading ? (
                <Trans>Loading...</Trans>
              ) : (
                <Trans>Download pack sounds</Trans>
              )
            }
            icon={<Music />}
            disabled={isAudioArchiveUrlLoading}
            onClick={async () => {
              setIsAudioArchiveUrlLoading(true);
              const url = await getPrivateAssetPackAudioArchiveUrl(
                assetPack.id
              );
              setIsAudioArchiveUrlLoading(false);
              if (!url) {
                console.error(
                  `Could not generate url for premium asset pack with name ${
                    assetPack.name
                  }`
                );
                return;
              }
              Window.openExternalURL(url);
            }}
          />
        );
      },
      [getPrivateAssetPackAudioArchiveUrl, isAudioArchiveUrlLoading]
    );

    React.useEffect(
      () => {
        if (shouldAutofocusSearchbar && searchBar.current) {
          searchBar.current.focus();
        }
      },
      [shouldAutofocusSearchbar]
    );

    React.useLayoutEffect(
      () => {
        // When going back to the homepage from a page where the asset filters
        // were open, we must first close the panel and then apply the scroll position.
        const applyEffect = async () => {
          if (isOnHomePage) {
            clearAllFilters(assetFiltersState);
            await setIsFiltersPanelOpen(false);
          }
          if (!isAssetDetailLoading.current) {
            applyBackScrollPosition();
          }
        };
        applyEffect();
      },
      // assetFiltersState is not stable, so don't list it.
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [isOnHomePage, applyBackScrollPosition]
    );

    const privateAssetPackFromSameCreator: ?Array<PrivateAssetPackListingData> = React.useMemo(
      () => {
        if (
          !openedPrivateAssetPackListingData ||
          !privateAssetPacks ||
          !receivedAssetPacks
        )
          return null;

        const receivedAssetPackIds = receivedAssetPacks.map(pack => pack.id);

        return privateAssetPacks
          .filter(
            pack =>
              pack.sellerId === openedPrivateAssetPackListingData.sellerId &&
              !receivedAssetPackIds.includes(pack.sellerId)
          )
          .sort((pack1, pack2) => pack1.name.localeCompare(pack2.name));
      },
      [openedPrivateAssetPackListingData, privateAssetPacks, receivedAssetPacks]
    );

    return (
      <Column expand noMargin useFullHeight noOverflowParent id="asset-store">
        <LineStackLayout>
          <IconButton
            id="home-button"
            key="back-discover"
            tooltip={t`Back to discover`}
            onClick={() => {
              setSearchText('');
              const page = navigationState.openHome();
              setScrollUpdateIsNeeded(page);
              clearAllFilters(assetFiltersState);
              setIsFiltersPanelOpen(false);
            }}
            size="small"
          >
            <Home />
          </IconButton>
          <Column expand useFullHeight noMargin>
            <SearchBar
              placeholder={t`Search assets`}
              value={searchText}
              onChange={
                isOnSearchResultPage
                  ? // An existing search is already being done: just update the
                    // search text and the asset store will update the search results.
                    setSearchText
                  : (newValue: string) => {
                      setSearchText(newValue);

                      // A new search is being initiated: navigate to the search page,
                      // and clear the history as a new search was launched.
                      if (!!newValue) {
                        navigationState.clearHistory();
                        navigationState.openSearchResultPage();
                        openFiltersPanelIfAppropriate();
                      }
                    }
              }
              onRequestSearch={() => {}}
              ref={searchBar}
              id="asset-store-search-bar"
            />
          </Column>
          <IconButton
            onClick={() => setIsFiltersPanelOpen(!isFiltersPanelOpen)}
            disabled={!canShowFiltersPanel}
            selected={canShowFiltersPanel && isFiltersPanelOpen}
            size="small"
          >
            <Tune />
          </IconButton>
        </LineStackLayout>
        <Spacer />
        <Column noMargin>
          <Line justifyContent="space-between" noMargin alignItems="center">
            {(!isOnHomePage || (isOnHomePage && !!openedAssetCategory)) && (
              <>
                <Column expand alignItems="flex-start" noMargin>
                  <TextButton
                    icon={<ChevronArrowLeft />}
                    label={<Trans>Back</Trans>}
                    primary={false}
                    onClick={() => {
                      const page = navigationState.backToPreviousPage();
                      setScrollUpdateIsNeeded(page);
                    }}
                  />
                </Column>
                {(openedAssetPack ||
                  openedPrivateAssetPackListingData ||
                  filtersState.chosenCategory) && (
                  <>
                    <Column expand alignItems="center">
                      <Text size="block-title" noMargin>
                        {openedAssetPack
                          ? openedAssetPack.name
                          : openedPrivateAssetPackListingData
                          ? openedPrivateAssetPackListingData.name
                          : filtersState.chosenCategory
                          ? capitalize(filtersState.chosenCategory.node.name)
                          : ''}
                      </Text>
                    </Column>
                    <Column
                      expand
                      alignItems="flex-end"
                      noMargin
                      justifyContent="center"
                    >
                      {openedAssetPack &&
                      openedAssetPack.content &&
                      doesAssetPackContainAudio(openedAssetPack) &&
                      !isAssetPackAudioOnly(openedAssetPack)
                        ? renderPrivateAssetPackAudioFilesDownloadButton(
                            openedAssetPack
                          )
                        : null}
                    </Column>
                  </>
                )}
              </>
            )}
          </Line>
        </Column>
        <Line
          expand
          noMargin
          overflow={
            'hidden' /* Somehow required on Chrome/Firefox to avoid children growing (but not on Safari) */
          }
        >
          {isOnHomePage ? (
            error ? (
              <PlaceholderError onRetry={fetchAssetsAndFilters}>
                <AlertMessage kind="error">
                  <Trans>
                    An error occurred when fetching the asset store content.
                    Please try again later.
                  </Trans>
                </AlertMessage>
              </PlaceholderError>
            ) : publicAssetPacks &&
              privateAssetPacks &&
              assetPackRandomOrdering ? (
              <AssetsHome
                ref={assetsHome}
                publicAssetPacks={publicAssetPacks}
                privateAssetPacksListingData={privateAssetPacks}
                assetPackRandomOrdering={assetPackRandomOrdering}
                onPublicAssetPackSelection={selectPublicAssetPack}
                onPrivateAssetPackSelection={selectPrivateAssetPack}
                onCategorySelection={selectAssetCategory}
                openedAssetCategory={openedAssetCategory}
              />
            ) : (
              <PlaceholderLoader />
            )
          ) : isOnSearchResultPage ? (
            <BoxSearchResults
              ref={boxSearchResults}
              baseSize={128}
              onRetry={fetchAssetsAndFilters}
              error={error}
              searchItems={searchResults}
              spacing={8}
              renderSearchItem={(assetShortHeader, size) => (
                <AssetCard
                  id={`asset-card-${assetShortHeader.name.replace(/\s/g, '-')}`}
                  size={size}
                  onOpenDetails={() => onOpenDetails(assetShortHeader)}
                  assetShortHeader={assetShortHeader}
                />
              )}
              noResultPlaceholder={
                openedAssetPack &&
                openedAssetPack.content &&
                isAssetPackAudioOnly(openedAssetPack) ? (
                  <Column expand justifyContent="center" alignItems="center">
                    <AlertMessage
                      kind="info"
                      renderRightButton={() =>
                        renderPrivateAssetPackAudioFilesDownloadButton(
                          openedAssetPack
                        )
                      }
                    >
                      <Trans>
                        Download all the sounds of the asset pack in one click
                        and use them in your project.
                      </Trans>
                    </AlertMessage>
                  </Column>
                ) : (
                  <NoResultPlaceholder
                    onClear={() => clearAllFilters(assetFiltersState)}
                  />
                )
              }
            />
          ) : openedAssetShortHeader ? (
            <AssetDetails
              ref={assetDetails}
              onTagSelection={selectTag}
              assetShortHeader={openedAssetShortHeader}
              onOpenDetails={onOpenDetails}
              onAssetLoaded={applyBackScrollPosition}
            />
          ) : !!openedPrivateAssetPackListingData ? (
            <PrivateAssetPackInformationPage
              privateAssetPackListingData={openedPrivateAssetPackListingData}
              onOpenPurchaseDialog={() =>
                setPurchasingPrivateAssetPackListingData(
                  openedPrivateAssetPackListingData
                )
              }
              isPurchaseDialogOpen={!!purchasingPrivateAssetPackListingData}
              onAssetPackOpen={selectPrivateAssetPack}
              privateAssetPacksFromSameCreatorListingData={
                privateAssetPackFromSameCreator
              }
            />
          ) : null}
          {!!purchasingPrivateAssetPackListingData && (
            <PrivateAssetPackPurchaseDialog
              privateAssetPackListingData={
                purchasingPrivateAssetPackListingData
              }
              onClose={() => setPurchasingPrivateAssetPackListingData(null)}
              onSuccessfulPurchase={onPurchaseSuccessful}
            />
          )}
          {canShowFiltersPanel && (
            <ResponsivePaperOrDrawer
              onClose={() => setIsFiltersPanelOpen(false)}
              open={isFiltersPanelOpen}
            >
              <ScrollView>
                <Column>
                  <Column noMargin>
                    <Line alignItems="center">
                      <Tune />
                      <Subheader>
                        <Trans>Object filters</Trans>
                      </Subheader>
                    </Line>
                  </Column>
                  <Line justifyContent="space-between" alignItems="center">
                    <AssetStoreFilterPanel
                      assetFiltersState={assetFiltersState}
                      onChoiceChange={() => {
                        navigationState.openSearchResultPage();
                      }}
                    />
                  </Line>
                </Column>
              </ScrollView>
            </ResponsivePaperOrDrawer>
          )}
        </Line>
      </Column>
    );
  }
);
