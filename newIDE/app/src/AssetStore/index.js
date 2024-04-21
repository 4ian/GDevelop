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
  sendGameTemplateInformationOpened,
} from '../Utils/Analytics/EventSender';
import {
  type AssetShortHeader,
  type PublicAssetPack,
  type PublicAssetPacks,
  type PrivateAssetPack,
  doesAssetPackContainAudio,
  isAssetPackAudioOnly,
} from '../Utils/GDevelopServices/Asset';
import {
  type PrivateAssetPackListingData,
  type PrivateGameTemplateListingData,
} from '../Utils/GDevelopServices/Shop';
import { type SearchBarInterface } from '../UI/SearchBar';
import { AssetStoreFilterPanel } from './AssetStoreFilterPanel';
import { AssetStoreContext } from './AssetStoreContext';
import { useResponsiveWindowSize } from '../UI/Responsive/ResponsiveWindowMeasurer';
import { useShouldAutofocusInput } from '../UI/Responsive/ScreenTypeMeasurer';
import Subheader from '../UI/Subheader';
import { AssetsHome, type AssetsHomeInterface } from './AssetsHome';
import TextButton from '../UI/TextButton';
import IconButton from '../UI/IconButton';
import { AssetDetails, type AssetDetailsInterface } from './AssetDetails';
import PlaceholderLoader from '../UI/PlaceholderLoader';
import Home from '../UI/CustomSvgIcons/Home';
import PrivateAssetPackInformationPage from './PrivateAssets/PrivateAssetPackInformationPage';
import PlaceholderError from '../UI/PlaceholderError';
import AlertMessage from '../UI/AlertMessage';
import AuthenticatedUserContext from '../Profile/AuthenticatedUserContext';
import { LineStackLayout } from '../UI/Layout';
import {
  isHomePage,
  isSearchResultPage,
  type AssetStorePageState,
} from './AssetStoreNavigator';
import { ResponsivePaperOrDrawer } from '../UI/ResponsivePaperOrDrawer';
import AssetsList, { type AssetsListInterface } from './AssetsList';
import PrivateAssetPackAudioFilesDownloadButton from './PrivateAssets/PrivateAssetPackAudioFilesDownloadButton';
import Text from '../UI/Text';
import { capitalize } from 'lodash';
import PrivateGameTemplateInformationPage from './PrivateGameTemplates/PrivateGameTemplateInformationPage';
import { PrivateGameTemplateStoreContext } from './PrivateGameTemplates/PrivateGameTemplateStoreContext';

type Props = {|
  hideGameTemplates?: boolean, // TODO: if we add more options, use an array instead.
  displayPromotions?: boolean,
  onOpenPrivateGameTemplateListingData?: (
    privateGameTemplateListingData: PrivateGameTemplateListingData
  ) => void,
|};

export type AssetStoreInterface = {|
  onClose: () => void,
|};

const identifyAssetPackKind = ({
  privateAssetPackListingDatas,
  publicAssetPacks,
  assetPack,
}: {|
  privateAssetPackListingDatas: ?Array<PrivateAssetPackListingData>,
  publicAssetPacks: ?PublicAssetPacks,
  assetPack: PrivateAssetPack | PublicAssetPack | null,
|}) => {
  if (!assetPack) return 'unknown';

  // We could simplify this if the asset packs have a "kind" or "type" in the future.
  // For now, we check their presence in the lists to ensure adding fields in the backend
  // won't break this detection in the future (for example, if public asset packs get an `id`,
  // this won't break).
  return assetPack.id &&
    privateAssetPackListingDatas &&
    !!privateAssetPackListingDatas.find(({ id }) => id === assetPack.id)
    ? 'private'
    : publicAssetPacks &&
      publicAssetPacks.starterPacks.find(({ tag }) => tag === assetPack.tag)
    ? 'public'
    : 'unknown';
};

export const AssetStore = React.forwardRef<Props, AssetStoreInterface>(
  (
    {
      hideGameTemplates,
      displayPromotions,
      onOpenPrivateGameTemplateListingData,
    }: Props,
    ref
  ) => {
    const {
      assetShortHeadersSearchResults,
      publicAssetPacksSearchResults,
      privateAssetPackListingDatasSearchResults,
      publicAssetPacks,
      privateAssetPackListingDatas,
      error: assetStoreError,
      fetchAssetsAndFilters,
      shopNavigationState,
      searchText,
      setSearchText: setAssetStoreSearchText,
      clearAllFilters: clearAllAssetStoreFilters,
    } = React.useContext(AssetStoreContext);
    const {
      privateGameTemplateListingDatas,
      error: privateGameTemplateStoreError,
      fetchGameTemplates,
      shop: {
        privateGameTemplateListingDatasSearchResults,
        setSearchText: setPrivateGameTemplateSearchText,
      },
    } = React.useContext(PrivateGameTemplateStoreContext);
    const currentPage = shopNavigationState.getCurrentPage();
    const {
      openedAssetPack,
      openedAssetShortHeader,
      openedShopCategory,
      openedPrivateAssetPackListingData,
      openedPrivateGameTemplateListingData,
      filtersState, // how to have a filtersstate for both store?
    } = currentPage;
    const isOnHomePage = isHomePage(currentPage);
    const isOnSearchResultPage = isSearchResultPage(currentPage);
    const searchBar = React.useRef<?SearchBarInterface>(null);
    const shouldAutofocusSearchbar = useShouldAutofocusInput();

    const { isMobile } = useResponsiveWindowSize();

    // Don't open the filters panel automatically.
    const [isFiltersPanelOpen, setIsFiltersPanelOpen] = React.useState(false);
    const openFiltersPanelIfAppropriate = React.useCallback(
      () => {
        if (isMobile) {
          // Never open automatically the filters on small screens
          return;
        }

        setIsFiltersPanelOpen(true);
      },
      [isMobile]
    );

    const { receivedAssetPacks, receivedGameTemplates } = React.useContext(
      AuthenticatedUserContext
    );

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

    // We search in both the asset store and the game templates stores.
    const setSearchText = React.useCallback(
      (newSearchText: string) => {
        setAssetStoreSearchText(newSearchText);
        setPrivateGameTemplateSearchText(newSearchText);
      },
      [setAssetStoreSearchText, setPrivateGameTemplateSearchText]
    );

    const fetchAssetsAndGameTemplates = React.useCallback(
      () => {
        fetchAssetsAndFilters();
        fetchGameTemplates();
      },
      [fetchAssetsAndFilters, fetchGameTemplates]
    );

    const storeError = assetStoreError || privateGameTemplateStoreError;

    const reApplySearchTextIfNeeded = React.useCallback(
      (page: AssetStorePageState): boolean => {
        const previousSearchText = page.searchText || '';
        if (searchText !== previousSearchText) {
          setSearchText(previousSearchText);
          return true;
        }
        return false;
      },
      [searchText, setSearchText]
    );

    const canShowFiltersPanel =
      !openedAssetShortHeader && // Don't show filters on asset page.
      !openedPrivateAssetPackListingData && // Don't show filters on private asset pack information page.
      !openedPrivateGameTemplateListingData && // Don't show filters on private game template information page.
      !(
        openedAssetPack &&
        openedAssetPack.content &&
        // Don't show filters if opened asset pack contains audio only.
        isAssetPackAudioOnly(openedAssetPack)
      );
    const assetsHome = React.useRef<?AssetsHomeInterface>(null);
    const assetDetails = React.useRef<?AssetDetailsInterface>(null);
    const assetsList = React.useRef<?AssetsListInterface>(null);
    const getScrollView = React.useCallback(() => {
      return assetsHome.current || assetDetails.current || assetsList.current;
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
      (page: AssetStorePageState) => {
        if (hasAppliedSavedScrollPosition.current) {
          return;
        }
        const scrollView = getScrollView();
        if (!scrollView) {
          return;
        }
        const scrollPosition = page.scrollPosition;
        if (scrollPosition) scrollView.scrollToPosition(scrollPosition);
        // If no saved scroll position, force scroll to 0 in case the displayed component
        // is the same as the previous page so the scroll is naturally kept between pages
        // although the user navigated and the scroll should be reset.
        else scrollView.scrollToPosition(0);
        hasAppliedSavedScrollPosition.current = true;
      },
      [getScrollView]
    );

    React.useLayoutEffect(
      () => {
        // When going back to the homepage from a page where the asset filters
        // were open, we must first close the panel and then apply the scroll position.
        const applyEffect = async () => {
          if (isOnHomePage) {
            clearAllAssetStoreFilters();
            await setIsFiltersPanelOpen(false);
          }
          if (!isAssetDetailLoading.current) {
            applyBackScrollPosition(currentPage);
          }
        };
        applyEffect();
      },
      // clearAllFilters is not stable, so don't list it.
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [isOnHomePage, applyBackScrollPosition, currentPage]
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
          privateAssetPackListingDatas,
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
        const previousSearchText = searchText;
        // Don't reset search text when opening an asset as the search bar is not active.
        // This helps speeding up the navigation when going back to the results page.
        shopNavigationState.openAssetDetailPage({
          assetShortHeader,
          previousSearchText,
        });
      },
      [
        openedAssetPack,
        publicAssetPacks,
        privateAssetPackListingDatas,
        saveScrollPosition,
        shopNavigationState,
        searchText,
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
          const previousSearchText = searchText;
          setSearchText(''); // Reset search text when opening a pack.
          shopNavigationState.openPackPage({ assetPack, previousSearchText });
          openFiltersPanelIfAppropriate();
        }
      },
      [
        shopNavigationState,
        searchText,
        saveScrollPosition,
        setSearchText,
        openFiltersPanelIfAppropriate,
      ]
    );

    // When a private pack is selected from the home page,
    // if the user owns it, we set it as the chosen category,
    // otherwise we open the page to buy it.
    const selectPrivateAssetPack = React.useCallback(
      (
        privateAssetPackListingData: PrivateAssetPackListingData,
        options?: {|
          forceProductPage?: boolean,
        |}
      ) => {
        const receivedAssetPack = receivedAssetPacks
          ? receivedAssetPacks.find(
              pack => pack.id === privateAssetPackListingData.id
            )
          : null;

        if (!receivedAssetPack || (options && options.forceProductPage)) {
          // The user has not received the pack, open the page to buy it.
          sendAssetPackInformationOpened({
            assetPackName: privateAssetPackListingData.name,
            assetPackId: privateAssetPackListingData.id,
            assetPackKind: 'private',
          });
          saveScrollPosition();
          const previousSearchText = searchText;
          setSearchText(''); // Reset search text when opening a pack.
          shopNavigationState.openPrivateAssetPackInformationPage({
            privateAssetPackListingData,
            previousSearchText,
          });
          return;
        }

        // The user has received the pack, open it.
        sendAssetPackOpened({
          assetPackName: privateAssetPackListingData.name,
          assetPackId: privateAssetPackListingData.id,
          assetPackTag: null,
          assetPackKind: 'private',
          source: 'store-home',
        });
        saveScrollPosition();
        const previousSearchText = searchText;
        setSearchText(''); // Reset search text when opening a pack.
        shopNavigationState.openPackPage({
          assetPack: receivedAssetPack,
          previousSearchText,
        });
        openFiltersPanelIfAppropriate();
      },
      [
        receivedAssetPacks,
        saveScrollPosition,
        shopNavigationState,
        setSearchText,
        openFiltersPanelIfAppropriate,
        searchText,
      ]
    );

    const selectFolder = React.useCallback(
      (folderTag: string) => {
        shopNavigationState.navigateInsideFolder(folderTag);
      },
      [shopNavigationState]
    );

    const goBackToFolderIndex = React.useCallback(
      (folderIndex: number) => {
        shopNavigationState.goBackToFolderIndex(folderIndex);
      },
      [shopNavigationState]
    );

    const selectPrivateGameTemplate = React.useCallback(
      (privateGameTemplateListingData: PrivateGameTemplateListingData) => {
        sendGameTemplateInformationOpened({
          gameTemplateName: privateGameTemplateListingData.name,
          gameTemplateId: privateGameTemplateListingData.id,
          source: 'store',
        });
        saveScrollPosition();
        const previousSearchText = searchText;
        setSearchText(''); // Reset search text when opening a template.
        shopNavigationState.openPrivateGameTemplateInformationPage({
          privateGameTemplateListingData,
          previousSearchText,
        });
      },
      [saveScrollPosition, setSearchText, searchText, shopNavigationState]
    );

    const selectShopCategory = React.useCallback(
      (category: string) => {
        saveScrollPosition();
        shopNavigationState.openShopCategoryPage(category);
      },
      [shopNavigationState, saveScrollPosition]
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
          shopNavigationState.openPackPage({
            assetPack: privateAssetPack,
            previousSearchText: '', // We were on an asset page.
          });
        } else if (publicAssetPack) {
          shopNavigationState.openPackPage({
            assetPack: publicAssetPack,
            previousSearchText: '', // We were on an asset page.
          });
        } else {
          shopNavigationState.openTagPage(tag);
        }
        clearAllAssetStoreFilters();
        openFiltersPanelIfAppropriate();
      },
      [
        setSearchText,
        receivedAssetPacks,
        publicAssetPacks,
        saveScrollPosition,
        clearAllAssetStoreFilters,
        shopNavigationState,
        openFiltersPanelIfAppropriate,
      ]
    );

    React.useEffect(
      () => {
        if (shouldAutofocusSearchbar && searchBar.current) {
          searchBar.current.focus();
        }
      },
      [shouldAutofocusSearchbar]
    );

    const privateAssetPackListingDatasFromSameCreator: ?Array<PrivateAssetPackListingData> = React.useMemo(
      () => {
        if (
          !openedPrivateAssetPackListingData ||
          !privateAssetPackListingDatas ||
          !receivedAssetPacks
        )
          return null;

        const receivedAssetPackIds = receivedAssetPacks.map(pack => pack.id);

        return privateAssetPackListingDatas
          .filter(
            pack =>
              pack.sellerId === openedPrivateAssetPackListingData.sellerId &&
              !receivedAssetPackIds.includes(pack.sellerId)
          )
          .sort((pack1, pack2) => pack1.name.localeCompare(pack2.name));
      },
      [
        openedPrivateAssetPackListingData,
        privateAssetPackListingDatas,
        receivedAssetPacks,
      ]
    );

    const privateGameTemplateListingDatasFromSameCreator: ?Array<PrivateGameTemplateListingData> = React.useMemo(
      () => {
        if (
          !openedPrivateGameTemplateListingData ||
          !privateGameTemplateListingDatas ||
          !receivedGameTemplates
        )
          return null;

        const receivedGameTemplateIds = receivedGameTemplates.map(
          template => template.id
        );

        return privateGameTemplateListingDatas
          .filter(
            template =>
              template.sellerId ===
                openedPrivateGameTemplateListingData.sellerId &&
              !receivedGameTemplateIds.includes(template.sellerId)
          )
          .sort((template1, template2) =>
            template1.name.localeCompare(template2.name)
          );
      },
      [
        openedPrivateGameTemplateListingData,
        privateGameTemplateListingDatas,
        receivedGameTemplates,
      ]
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
              const page = shopNavigationState.openHome();
              setScrollUpdateIsNeeded(page);
              clearAllAssetStoreFilters();
              setIsFiltersPanelOpen(false);
            }}
            size="small"
          >
            <Home />
          </IconButton>
          <Column expand useFullHeight noMargin>
            <SearchBar
              placeholder={
                hideGameTemplates ? t`Search assets` : `Search the shop`
              }
              value={searchText}
              onChange={
                isOnSearchResultPage
                  ? // An existing search is already being done: just update the
                    // search text and the store will update the search results.
                    setSearchText
                  : (newValue: string) => {
                      setSearchText(newValue);

                      // A new search is being initiated: navigate to the search page,
                      // and clear the history as a new search was launched.
                      if (!!newValue) {
                        shopNavigationState.clearHistory();
                        shopNavigationState.openSearchResultPage();
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
            {(!isOnHomePage || !!openedShopCategory) && (
              <>
                <Column expand alignItems="flex-start" noMargin>
                  <TextButton
                    icon={<ChevronArrowLeft />}
                    label={<Trans>Back</Trans>}
                    onClick={async () => {
                      const page = shopNavigationState.backToPreviousPage();
                      const isUpdatingSearchtext = reApplySearchTextIfNeeded(
                        page
                      );
                      if (isUpdatingSearchtext) {
                        // Updating the search is not instant, so we cannot apply the scroll position
                        // right away. We force a wait as there's no easy way to know when results are completely updated.
                        await new Promise(resolve => setTimeout(resolve, 500));
                        setScrollUpdateIsNeeded(page);
                        applyBackScrollPosition(page); // We apply it manually, because the layout effect won't be called again.
                      } else {
                        setScrollUpdateIsNeeded(page);
                      }
                    }}
                  />
                </Column>
                {(openedAssetPack ||
                  openedPrivateAssetPackListingData ||
                  filtersState.chosenCategory) && (
                  <>
                    {!openedAssetPack && !openedPrivateAssetPackListingData && (
                      // Only show the category name if we're not on an asset pack page.
                      <Column expand alignItems="center">
                        <Text size="block-title" noMargin>
                          {filtersState.chosenCategory
                            ? capitalize(filtersState.chosenCategory.node.name)
                            : ''}
                        </Text>
                      </Column>
                    )}
                    <Column
                      expand
                      alignItems="flex-end"
                      noMargin
                      justifyContent="center"
                    >
                      {openedAssetPack &&
                      openedAssetPack.content &&
                      doesAssetPackContainAudio(openedAssetPack) &&
                      !isAssetPackAudioOnly(openedAssetPack) ? (
                        <PrivateAssetPackAudioFilesDownloadButton
                          assetPack={openedAssetPack}
                        />
                      ) : null}
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
            storeError ? (
              <PlaceholderError onRetry={fetchAssetsAndGameTemplates}>
                <AlertMessage kind="error">
                  <Trans>
                    An error occurred when fetching the store content. Please
                    try again later.
                  </Trans>
                </AlertMessage>
              </PlaceholderError>
            ) : publicAssetPacks &&
              privateAssetPackListingDatas &&
              privateGameTemplateListingDatas ? (
              <AssetsHome
                ref={assetsHome}
                publicAssetPacks={publicAssetPacks}
                privateAssetPackListingDatas={privateAssetPackListingDatas}
                privateGameTemplateListingDatas={
                  privateGameTemplateListingDatas
                }
                onPublicAssetPackSelection={selectPublicAssetPack}
                onPrivateAssetPackSelection={selectPrivateAssetPack}
                onPrivateGameTemplateSelection={selectPrivateGameTemplate}
                onCategorySelection={selectShopCategory}
                openedShopCategory={openedShopCategory}
                hideGameTemplates={hideGameTemplates}
                displayPromotions={displayPromotions}
              />
            ) : (
              <PlaceholderLoader />
            )
          ) : isOnSearchResultPage ? (
            <AssetsList
              publicAssetPacks={publicAssetPacksSearchResults}
              privateAssetPackListingDatas={
                privateAssetPackListingDatasSearchResults
              }
              privateGameTemplateListingDatas={
                privateGameTemplateListingDatasSearchResults
              }
              assetShortHeaders={assetShortHeadersSearchResults}
              ref={assetsList}
              error={storeError}
              onOpenDetails={onOpenDetails}
              onPrivateAssetPackSelection={selectPrivateAssetPack}
              onPublicAssetPackSelection={selectPublicAssetPack}
              onPrivateGameTemplateSelection={selectPrivateGameTemplate}
              onFolderSelection={selectFolder}
              onGoBackToFolderIndex={goBackToFolderIndex}
              currentPage={shopNavigationState.getCurrentPage()}
            />
          ) : openedAssetShortHeader ? (
            <AssetDetails
              ref={assetDetails}
              onTagSelection={selectTag}
              assetShortHeader={openedAssetShortHeader}
              onOpenDetails={onOpenDetails}
              onAssetLoaded={() => applyBackScrollPosition(currentPage)}
              onPrivateAssetPackSelection={selectPrivateAssetPack}
              onPrivateGameTemplateSelection={selectPrivateGameTemplate}
            />
          ) : !!openedPrivateAssetPackListingData ? (
            <PrivateAssetPackInformationPage
              privateAssetPackListingData={openedPrivateAssetPackListingData}
              onAssetPackOpen={selectPrivateAssetPack}
              onGameTemplateOpen={selectPrivateGameTemplate}
              privateAssetPackListingDatasFromSameCreator={
                privateAssetPackListingDatasFromSameCreator
              }
            />
          ) : !!openedPrivateGameTemplateListingData ? (
            <PrivateGameTemplateInformationPage
              privateGameTemplateListingData={
                openedPrivateGameTemplateListingData
              }
              onCreateWithGameTemplate={() => {
                onOpenPrivateGameTemplateListingData &&
                  onOpenPrivateGameTemplateListingData(
                    openedPrivateGameTemplateListingData
                  );
              }}
              onAssetPackOpen={selectPrivateAssetPack}
              onGameTemplateOpen={selectPrivateGameTemplate}
              privateGameTemplateListingDatasFromSameCreator={
                privateGameTemplateListingDatasFromSameCreator
              }
            />
          ) : null}
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
                    <AssetStoreFilterPanel />
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
