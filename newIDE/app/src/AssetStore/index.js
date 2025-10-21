// @flow
import * as React from 'react';
import { I18n } from '@lingui/react';
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
  sendBundleInformationOpened,
  sendCourseInformationOpened,
  sendGameTemplateInformationOpened,
} from '../Utils/Analytics/EventSender';
import {
  type AssetShortHeader,
  type PublicAssetPack,
  type PublicAssetPacks,
  type PrivateAssetPack,
  type Course,
  doesAssetPackContainAudio,
  isAssetPackAudioOnly,
} from '../Utils/GDevelopServices/Asset';
import {
  type PrivateAssetPackListingData,
  type PrivateGameTemplateListingData,
  type BundleListingData,
  type CourseListingData,
} from '../Utils/GDevelopServices/Shop';
import { type SearchBarInterface } from '../UI/SearchBar';
import { AssetStoreFilterPanel } from './AssetStoreFilterPanel';
import { AssetStoreContext } from './AssetStoreContext';
import { useResponsiveWindowSize } from '../UI/Responsive/ResponsiveWindowMeasurer';
import { useShouldAutofocusInput } from '../UI/Responsive/ScreenTypeMeasurer';
import Subheader from '../UI/Subheader';
import {
  AssetsHome,
  gameTemplatesCategoryId,
  type AssetsHomeInterface,
} from './AssetsHome';
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
  AssetStoreNavigatorContext,
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
import { AssetSwappingAssetStoreSearchFilter } from './AssetStoreSearchFilter';
import { delay } from '../Utils/Delay';
import { BundleStoreContext } from './Bundles/BundleStoreContext';
import BundleInformationPage from './Bundles/BundleInformationPage';
import { type CourseCompletion } from '../MainFrame/EditorContainers/HomePage/UseCourses';
import { type SubscriptionPlanWithPricingSystems } from '../Utils/GDevelopServices/Usage';

type Props = {|
  onlyShowAssets?: boolean, // TODO: if we add more options, use an array instead.
  displayPromotions?: boolean,
  onOpenPrivateGameTemplateListingData?: (
    privateGameTemplateListingData: PrivateGameTemplateListingData
  ) => void,
  onOpenProfile?: () => void,
  courses?: ?Array<Course>,
  onCourseOpen?: (courseId: string) => void,
  getSubscriptionPlansWithPricingSystems?: () => Array<SubscriptionPlanWithPricingSystems> | null,
  getCourseCompletion?: (courseId: string) => CourseCompletion | null,
  assetSwappedObject?: ?gdObject,
  minimalUI?: boolean,
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
      onlyShowAssets,
      displayPromotions,
      onOpenPrivateGameTemplateListingData,
      onOpenProfile,
      courses,
      onCourseOpen,
      getSubscriptionPlansWithPricingSystems,
      getCourseCompletion,
      assetSwappedObject,
      minimalUI,
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
      clearAllFilters: clearAllAssetStoreFilters,
      assetFiltersState,
      getAssetShortHeaderFromId,
    } = React.useContext(AssetStoreContext);

    const shopNavigationState = React.useContext(AssetStoreNavigatorContext);
    const {
      searchText,
      setSearchText: setAssetStoreSearchText,
    } = shopNavigationState;

    const assetSwappedObjectPtr = React.useRef<number | null>(null);
    React.useEffect(
      () => {
        if (assetSwappedObject) {
          if (assetSwappedObjectPtr.current !== assetSwappedObject.ptr) {
            shopNavigationState.openAssetSwapping();
            setAssetStoreSearchText('');
            clearAllAssetStoreFilters();
            const assetShortHeader = getAssetShortHeaderFromId(
              assetSwappedObject.getAssetStoreId()
            );
            assetFiltersState.setAssetSwappingFilter(
              new AssetSwappingAssetStoreSearchFilter(
                assetSwappedObject,
                assetShortHeader
              )
            );
            const assetsListInterface = assetsList.current;
            if (assetsListInterface) {
              assetsListInterface.scrollToPosition(0);
              assetsListInterface.setPageBreakIndex(0);
            }
          }
          assetSwappedObjectPtr.current = assetSwappedObject.ptr;
        }
      },
      [
        assetFiltersState,
        assetSwappedObject,
        clearAllAssetStoreFilters,
        getAssetShortHeaderFromId,
        setAssetStoreSearchText,
        shopNavigationState,
      ]
    );

    const {
      privateGameTemplateListingDatas,
      error: privateGameTemplateStoreError,
      fetchGameTemplates,
      shop: { privateGameTemplateListingDatasSearchResults },
    } = React.useContext(PrivateGameTemplateStoreContext);
    const {
      bundleListingDatas,
      error: bundleStoreError,
      fetchBundles,
      shop: { bundleListingDatasSearchResults },
    } = React.useContext(BundleStoreContext);

    const currentPage = shopNavigationState.getCurrentPage();
    const {
      openedAssetPack,
      openedAssetShortHeader,
      openedShopCategory,
      openedPrivateAssetPackListingData,
      openedPrivateGameTemplateListingData,
      openedBundleListingData,
      filtersState,
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
      },
      [setAssetStoreSearchText]
    );

    const fetchAssetsAndGameTemplates = React.useCallback(
      () => {
        fetchAssetsAndFilters();
        fetchGameTemplates();
        fetchBundles();
      },
      [fetchAssetsAndFilters, fetchGameTemplates, fetchBundles]
    );

    const storeError =
      assetStoreError || privateGameTemplateStoreError || bundleStoreError;

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
      !openedBundleListingData && // Don't show filters on bundle information page.
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
        shopNavigationState.openAssetDetailPage({
          assetShortHeader,
          storeSearchText: true,
          clearSearchText: false,
        });
      },
      [
        openedAssetPack,
        publicAssetPacks,
        privateAssetPackListingDatas,
        saveScrollPosition,
        shopNavigationState,
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
          shopNavigationState.openPackPage({
            assetPack,
            storeSearchText: true,
            clearSearchText: true,
          });
          openFiltersPanelIfAppropriate();
        }
      },
      [shopNavigationState, saveScrollPosition, openFiltersPanelIfAppropriate]
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
          const priceForUsageType = privateAssetPackListingData.prices.find(
            price => price.usageType === 'default'
          );

          sendAssetPackInformationOpened({
            assetPackName: privateAssetPackListingData.name,
            assetPackId: privateAssetPackListingData.id,
            assetPackKind: 'private',
            priceValue: priceForUsageType && priceForUsageType.value,
            priceCurrency: priceForUsageType && priceForUsageType.currency,
          });
          saveScrollPosition();
          shopNavigationState.openPrivateAssetPackInformationPage({
            privateAssetPackListingData,
            storeSearchText: true,
            clearSearchText: true,
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
        shopNavigationState.openPackPage({
          assetPack: receivedAssetPack,
          storeSearchText: true,
          clearSearchText: true,
        });
        openFiltersPanelIfAppropriate();
      },
      [
        receivedAssetPacks,
        saveScrollPosition,
        shopNavigationState,
        openFiltersPanelIfAppropriate,
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
        const priceForUsageType = privateGameTemplateListingData.prices.find(
          price => price.usageType === 'default'
        );
        sendGameTemplateInformationOpened({
          gameTemplateName: privateGameTemplateListingData.name,
          gameTemplateId: privateGameTemplateListingData.id,
          source: 'store',
          priceValue: priceForUsageType && priceForUsageType.value,
          priceCurrency: priceForUsageType && priceForUsageType.currency,
        });
        saveScrollPosition();
        shopNavigationState.openPrivateGameTemplateInformationPage({
          privateGameTemplateListingData,
          storeSearchText: true,
          clearSearchText: true,
        });
      },
      [saveScrollPosition, shopNavigationState]
    );

    const selectBundle = React.useCallback(
      (bundleListingData: BundleListingData) => {
        const priceForUsageType = bundleListingData.prices.find(
          price => price.usageType === 'default'
        );
        sendBundleInformationOpened({
          bundleName: bundleListingData.name,
          bundleId: bundleListingData.id,
          source: 'store',
          priceValue: priceForUsageType && priceForUsageType.value,
          priceCurrency: priceForUsageType && priceForUsageType.currency,
        });
        saveScrollPosition();
        shopNavigationState.openBundleInformationPage({
          bundleListingData,
          storeSearchText: true,
          clearSearchText: true,
        });
      },
      [saveScrollPosition, shopNavigationState]
    );

    const selectCourse = React.useCallback(
      (courseListingData: CourseListingData) => {
        const priceForUsageType = courseListingData.prices.find(
          price => price.usageType === 'default'
        );
        sendCourseInformationOpened({
          courseName: courseListingData.name,
          courseId: courseListingData.id,
          source: 'store',
          priceValue: priceForUsageType && priceForUsageType.value,
          priceCurrency: priceForUsageType && priceForUsageType.currency,
        });
        if (onCourseOpen) onCourseOpen(courseListingData.id);
      },
      [onCourseOpen]
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
        if (privateAssetPack) {
          shopNavigationState.openPackPage({
            assetPack: privateAssetPack,
            storeSearchText: false,
            clearSearchText: true,
          });
        } else if (publicAssetPack) {
          shopNavigationState.openPackPage({
            assetPack: publicAssetPack,
            storeSearchText: false,
            clearSearchText: true,
          });
        } else {
          shopNavigationState.openTagPage(tag);
        }
        clearAllAssetStoreFilters();
        openFiltersPanelIfAppropriate();
      },
      [
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

    // Ensure we prevent a user being on a game template category or has opened a
    // game template when the game templates are hidden.
    React.useEffect(
      () => {
        if (
          onlyShowAssets &&
          (openedShopCategory === gameTemplatesCategoryId ||
            openedPrivateGameTemplateListingData ||
            openedBundleListingData)
        ) {
          shopNavigationState.openHome();
        }
      },
      [
        openedShopCategory,
        openedPrivateGameTemplateListingData,
        openedBundleListingData,
        onlyShowAssets,
        shopNavigationState,
      ]
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

    const onBack = React.useCallback(
      async () => {
        const page = shopNavigationState.backToPreviousPage();
        const isUpdatingSearchtext = reApplySearchTextIfNeeded(page);
        if (isUpdatingSearchtext) {
          // Updating the search is not instant, so we cannot apply the scroll position
          // right away. We force a wait as there's no easy way to know when results are completely updated.
          await delay(500);
          setScrollUpdateIsNeeded(page);
          applyBackScrollPosition(page); // We apply it manually, because the layout effect won't be called again.
        } else {
          setScrollUpdateIsNeeded(page);
        }
      },
      [
        shopNavigationState,
        reApplySearchTextIfNeeded,
        setScrollUpdateIsNeeded,
        applyBackScrollPosition,
      ]
    );

    return (
      <I18n>
        {({ i18n }) => (
          <Column
            expand
            noMargin
            useFullHeight
            noOverflowParent
            id="asset-store"
          >
            <>
              <LineStackLayout>
                {!(assetSwappedObject && minimalUI) && (
                  <IconButton
                    id="home-button"
                    key="back-discover"
                    tooltip={t`Back to discover`}
                    onClick={() => {
                      setSearchText('');
                      const page = assetSwappedObject
                        ? shopNavigationState.openAssetSwapping()
                        : shopNavigationState.openHome();
                      setScrollUpdateIsNeeded(page);
                      clearAllAssetStoreFilters();
                      setIsFiltersPanelOpen(false);
                    }}
                    size="small"
                  >
                    <Home />
                  </IconButton>
                )}
                <Column expand useFullHeight noMargin>
                  <SearchBar
                    placeholder={
                      onlyShowAssets ? t`Search assets` : t`Search the shop`
                    }
                    value={searchText}
                    onChange={(newValue: string) => {
                      if (searchText === newValue || newValue.length === 1) {
                        return;
                      }
                      setSearchText(newValue);
                      if (isOnSearchResultPage) {
                        // An existing search is already being done: just move to the
                        // top search results.
                        shopNavigationState.openSearchResultPage();
                        const assetsListInterface = assetsList.current;
                        if (assetsListInterface) {
                          assetsListInterface.scrollToPosition(0);
                          assetsListInterface.setPageBreakIndex(0);
                        }
                      } else {
                        // A new search is being initiated: navigate to the search page,
                        // and clear the history as a new search was launched.
                        if (!!newValue) {
                          shopNavigationState.clearHistory();
                          shopNavigationState.openSearchResultPage();
                          openFiltersPanelIfAppropriate();
                        }
                      }
                    }}
                    onRequestSearch={() => {}}
                    ref={searchBar}
                    id="asset-store-search-bar"
                  />
                </Column>
                {!(assetSwappedObject && minimalUI) && (
                  <IconButton
                    onClick={() => setIsFiltersPanelOpen(!isFiltersPanelOpen)}
                    disabled={!canShowFiltersPanel}
                    selected={canShowFiltersPanel && isFiltersPanelOpen}
                    size="small"
                  >
                    <Tune />
                  </IconButton>
                )}
              </LineStackLayout>
              <Spacer />
            </>
            <Column noMargin>
              <Line justifyContent="space-between" noMargin alignItems="center">
                {(!isOnHomePage || !!openedShopCategory) &&
                  !(assetSwappedObject && minimalUI) && (
                    <>
                      {shopNavigationState.isRootPage ||
                      // Don't show back action on bundle pages, as it's handled by the page itself.
                      openedBundleListingData ? null : (
                        <Column expand alignItems="flex-start" noMargin>
                          <TextButton
                            icon={<ChevronArrowLeft />}
                            label={<Trans>Back</Trans>}
                            onClick={onBack}
                          />
                        </Column>
                      )}
                      {(openedAssetPack ||
                        openedPrivateAssetPackListingData ||
                        filtersState.chosenCategory) && (
                        <>
                          {!openedAssetPack &&
                            !openedPrivateAssetPackListingData && (
                              // Only show the category name if we're not on an asset pack page.
                              <Column expand alignItems="center">
                                <Text size="block-title" noMargin>
                                  {filtersState.chosenCategory
                                    ? capitalize(
                                        filtersState.chosenCategory.node.name
                                      )
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
                        An error occurred when fetching the store content.
                        Please try again later.
                      </Trans>
                    </AlertMessage>
                  </PlaceholderError>
                ) : publicAssetPacks &&
                  privateAssetPackListingDatas &&
                  privateGameTemplateListingDatas &&
                  bundleListingDatas ? (
                  <AssetsHome
                    ref={assetsHome}
                    publicAssetPacks={publicAssetPacks}
                    privateAssetPackListingDatas={privateAssetPackListingDatas}
                    privateGameTemplateListingDatas={
                      privateGameTemplateListingDatas
                    }
                    bundleListingDatas={bundleListingDatas}
                    onPublicAssetPackSelection={selectPublicAssetPack}
                    onPrivateAssetPackSelection={selectPrivateAssetPack}
                    onPrivateGameTemplateSelection={selectPrivateGameTemplate}
                    onBundleSelection={selectBundle}
                    onCategorySelection={selectShopCategory}
                    openedShopCategory={openedShopCategory}
                    onlyShowAssets={onlyShowAssets}
                    displayPromotions={displayPromotions}
                    onOpenProfile={onOpenProfile}
                  />
                ) : (
                  <PlaceholderLoader />
                )
              ) : isOnSearchResultPage ? (
                <AssetsList
                  publicAssetPacks={
                    assetSwappedObject ? [] : publicAssetPacksSearchResults
                  }
                  privateAssetPackListingDatas={
                    assetSwappedObject
                      ? []
                      : privateAssetPackListingDatasSearchResults
                  }
                  privateGameTemplateListingDatas={
                    assetSwappedObject
                      ? []
                      : privateGameTemplateListingDatasSearchResults
                  }
                  bundleListingDatas={
                    assetSwappedObject ? [] : bundleListingDatasSearchResults
                  }
                  assetShortHeaders={assetShortHeadersSearchResults}
                  ref={assetsList}
                  error={storeError}
                  onOpenDetails={onOpenDetails}
                  onPrivateAssetPackSelection={selectPrivateAssetPack}
                  onPublicAssetPackSelection={selectPublicAssetPack}
                  onPrivateGameTemplateSelection={selectPrivateGameTemplate}
                  onBundleSelection={selectBundle}
                  onFolderSelection={selectFolder}
                  onGoBackToFolderIndex={goBackToFolderIndex}
                  currentPage={shopNavigationState.getCurrentPage()}
                  onlyShowAssets={onlyShowAssets}
                  hideDetails={!!assetSwappedObject && !!minimalUI}
                />
              ) : // Do not show the asset details if we're swapping an asset.
              openedAssetShortHeader && !(assetSwappedObject && minimalUI) ? (
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
                  privateAssetPackListingData={
                    openedPrivateAssetPackListingData
                  }
                  onAssetPackOpen={selectPrivateAssetPack}
                  onGameTemplateOpen={selectPrivateGameTemplate}
                  onBundleOpen={selectBundle}
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
                  onBundleOpen={selectBundle}
                  privateGameTemplateListingDatasFromSameCreator={
                    privateGameTemplateListingDatasFromSameCreator
                  }
                />
              ) : !!openedBundleListingData &&
                getSubscriptionPlansWithPricingSystems &&
                getCourseCompletion ? (
                <BundleInformationPage
                  bundleListingData={openedBundleListingData}
                  noPadding
                  onBack={onBack}
                  onBundleOpen={selectBundle}
                  onGameTemplateOpen={selectPrivateGameTemplate}
                  onAssetPackOpen={selectPrivateAssetPack}
                  onCourseOpen={selectCourse}
                  getSubscriptionPlansWithPricingSystems={
                    getSubscriptionPlansWithPricingSystems
                  }
                  courses={courses}
                  getCourseCompletion={getCourseCompletion}
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
                        <AssetStoreFilterPanel
                          assetSwappedObject={assetSwappedObject}
                        />
                      </Line>
                    </Column>
                  </ScrollView>
                </ResponsivePaperOrDrawer>
              )}
            </Line>
          </Column>
        )}
      </I18n>
    );
  }
);
