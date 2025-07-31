// @flow
import * as React from 'react';
import { type FiltersState } from '../../UI/Search/FiltersChooser';
import { type Filters } from '../../Utils/GDevelopServices/Filters';
import { useSearchItem } from '../../UI/Search/UseSearchItem';
import {
  listListedBundles,
  type BundleListingData,
} from '../../Utils/GDevelopServices/Shop';
import { capitalize } from 'lodash';
import { AssetStoreNavigatorContext } from '../AssetStoreNavigator';
import { getBundleListingDataFromUserFriendlySlug } from '../AssetStoreUtils';
import useAlertDialog from '../../UI/Alert/useAlertDialog';
import { t } from '@lingui/macro';
import { sendBundleInformationOpened } from '../../Utils/Analytics/EventSender';
import { BUNDLES_FETCH_TIMEOUT } from '../../Utils/GlobalFetchTimeouts';
import AuthenticatedUserContext from '../../Profile/AuthenticatedUserContext';

const getBundleListingDataSearchTerms = (bundle: BundleListingData) =>
  bundle.name + '\n' + bundle.description + '\n' + bundle.categories.join('\n');

type BundleStoreState = {|
  bundleFilters: ?Filters,
  fetchBundles: () => void,
  bundleListingDatas: ?Array<BundleListingData>,
  error: ?Error,
  shop: {
    bundleListingDatasSearchResults: ?Array<BundleListingData>,
    filtersState: FiltersState,
    setInitialBundleUserFriendlySlug: string => void,
  },
|};

export const initialBundleStoreState: BundleStoreState = {
  bundleFilters: null,
  fetchBundles: () => {},
  bundleListingDatas: null,
  error: null,
  shop: {
    bundleListingDatasSearchResults: null,
    filtersState: {
      chosenFilters: new Set(),
      addFilter: () => {},
      removeFilter: () => {},
      chosenCategory: null,
      setChosenCategory: () => {},
    },
    setInitialBundleUserFriendlySlug: (
      initialBundleUserFriendlySlug: string
    ) => {},
  },
};

export const BundleStoreContext = React.createContext<BundleStoreState>(
  initialBundleStoreState
);

type BundleStoreStateProviderProps = {|
  children: React.Node,
|};

export const BundleStoreStateProvider = ({
  children,
}: BundleStoreStateProviderProps) => {
  const shopNavigationState = React.useContext(AssetStoreNavigatorContext);
  const {
    searchText: shopSearchText,
    setSearchText: setShopSearchText,
  } = shopNavigationState;
  const { limits } = React.useContext(AuthenticatedUserContext);

  const [bundleFilters, setBundleFilters] = React.useState<?Filters>(null);
  const [error, setError] = React.useState<?Error>(null);
  const [
    bundleListingDatas,
    setBundleListingDatas,
  ] = React.useState<?Array<BundleListingData>>(null);
  const [
    initialBundleUserFriendlySlug,
    setInitialBundleUserFriendlySlug,
  ] = React.useState<?string>(null);
  const initialBundleOpened = React.useRef<boolean>(false);

  const isLoading = React.useRef<boolean>(false);
  const { showAlert } = useAlertDialog();

  const hidePremiumProducts =
    !!limits &&
    !!limits.capabilities.classrooms &&
    limits.capabilities.classrooms.hidePremiumProducts;

  const fetchBundles = React.useCallback(
    () => {
      // If the bundles are already loaded, don't load them again.
      if (isLoading.current || bundleListingDatas) return;

      (async () => {
        setError(null);
        isLoading.current = true;

        try {
          const fetchedBundleListingDatas = await listListedBundles();

          console.info(
            `Loaded ${
              fetchedBundleListingDatas ? fetchedBundleListingDatas.length : 0
            } bundles from the store.`
          );

          setBundleListingDatas(fetchedBundleListingDatas);
          const defaultTags = fetchedBundleListingDatas.reduce(
            (allCategories, bundleListingData) => {
              return allCategories.concat(
                bundleListingData.categories.map(category =>
                  capitalize(category)
                )
              );
            },
            []
          );
          const uniqueDefaultTags = Array.from(new Set(defaultTags));
          const bundleFilters: Filters = {
            allTags: [],
            defaultTags: uniqueDefaultTags,
            tagsTree: [],
          };
          setBundleFilters(bundleFilters);
        } catch (error) {
          console.error(`Unable to load the bundles from the store:`, error);
          setError(error);
        }

        isLoading.current = false;
      })();
    },
    [bundleListingDatas]
  );

  // When the bundles are loaded,
  // open the bundle with the slug that was asked to be initially loaded.
  React.useEffect(
    () => {
      if (!initialBundleUserFriendlySlug || initialBundleOpened.current) {
        // If there is no initial bundle or
        // if the bundle was already opened, don't re-open it again even
        // if the effect run again.
        return;
      }

      if (bundleListingDatas && initialBundleUserFriendlySlug) {
        initialBundleOpened.current = true;

        // Open the information page of a the bundle.
        const bundleListingData = getBundleListingDataFromUserFriendlySlug({
          bundleListingDatas,
          userFriendlySlug: initialBundleUserFriendlySlug,
        });

        if (bundleListingData) {
          sendBundleInformationOpened({
            bundleName: bundleListingData.name,
            bundleId: bundleListingData.id,
            source: 'web-link',
          });
          shopNavigationState.openBundleInformationPage({
            bundleListingData,
            storeSearchText: true,
            clearSearchText: false,
          });
          initialBundleOpened.current = false; // Allow to open the bundle again if the effect run again.
          setInitialBundleUserFriendlySlug(null);
          return;
        }

        showAlert({
          title: t`Bundle not found`,
          message: t`The link to the bundle you've followed seems outdated. Why not take a look at the other bundles in the store?`,
        });
      }
    },
    [
      bundleListingDatas,
      shopNavigationState,
      showAlert,
      initialBundleUserFriendlySlug,
    ]
  );

  React.useEffect(
    () => {
      if (isLoading.current) return;

      const timeoutId = setTimeout(() => {
        console.info('Pre-fetching bundles from the store...');
        fetchBundles();
      }, BUNDLES_FETCH_TIMEOUT);
      return () => clearTimeout(timeoutId);
    },
    [fetchBundles]
  );

  const bundleListingDatasById = React.useMemo(
    () => {
      if (!bundleListingDatas) {
        return null;
      }
      const bundleListingDatasById = {};
      if (hidePremiumProducts) return bundleListingDatasById;
      bundleListingDatas.forEach(bundleListingData => {
        const id = bundleListingData.id;
        if (bundleListingDatasById[id]) {
          console.warn(`Multiple bundles with the same id: ${id}`);
        }
        bundleListingDatasById[id] = bundleListingData;
      });
      return bundleListingDatasById;
    },
    [bundleListingDatas, hidePremiumProducts]
  );

  const currentPage = shopNavigationState.getCurrentPage();

  const bundleListingDatasSearchResultsForShop: ?Array<BundleListingData> = useSearchItem(
    bundleListingDatasById,
    getBundleListingDataSearchTerms,
    shopSearchText,
    currentPage.filtersState.chosenCategory,
    currentPage.filtersState.chosenFilters
  );

  const BundleStoreState = React.useMemo(
    () => ({
      bundleListingDatas: hidePremiumProducts ? [] : bundleListingDatas,
      error,
      bundleFilters,
      fetchBundles,
      shop: {
        bundleListingDatasSearchResults: hidePremiumProducts
          ? []
          : bundleListingDatasSearchResultsForShop,
        searchText: shopSearchText,
        setSearchText: setShopSearchText,
        filtersState: currentPage.filtersState,
        setInitialBundleUserFriendlySlug,
      },
    }),
    [
      hidePremiumProducts,
      bundleListingDatas,
      error,
      bundleFilters,
      fetchBundles,
      bundleListingDatasSearchResultsForShop,
      shopSearchText,
      setShopSearchText,
      currentPage.filtersState,
    ]
  );

  return (
    <BundleStoreContext.Provider value={BundleStoreState}>
      {children}
    </BundleStoreContext.Provider>
  );
};
