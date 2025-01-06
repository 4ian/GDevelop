// @flow
import * as React from 'react';
import { type FiltersState, useFilters } from '../../UI/Search/FiltersChooser';
import { type Filters } from '../../Utils/GDevelopServices/Filters';
import {
  useSearchStructuredItem,
  type SearchMatch,
} from '../../UI/Search/UseSearchStructuredItem';
import { useSearchItem } from '../../UI/Search/UseSearchItem';
import {
  listListedPrivateGameTemplates,
  type PrivateGameTemplateListingData,
} from '../../Utils/GDevelopServices/Shop';
import { capitalize } from 'lodash';
import { AssetStoreNavigatorContext } from '../AssetStoreNavigator';
import { getPrivateGameTemplateListingDataFromUserFriendlySlug } from '../AssetStoreUtils';
import useAlertDialog from '../../UI/Alert/useAlertDialog';
import { t } from '@lingui/macro';
import { sendGameTemplateInformationOpened } from '../../Utils/Analytics/EventSender';
import { PRIVATE_GAME_TEMPLATES_FETCH_TIMEOUT } from '../../Utils/GlobalFetchTimeouts';
import AuthenticatedUserContext from '../../Profile/AuthenticatedUserContext';

const defaultSearchText = '';
const excludedTiers = new Set(); // No tiers for game templates.
const firstGameTemplateIds = [];

const getPrivateGameTemplateListingDataSearchTerms = (
  privateGameTemplate: PrivateGameTemplateListingData
) =>
  privateGameTemplate.name +
  '\n' +
  privateGameTemplate.description +
  '\n' +
  privateGameTemplate.categories.join('\n');

type PrivateGameTemplateStoreState = {|
  gameTemplateFilters: ?Filters,
  fetchGameTemplates: () => void,
  privateGameTemplateListingDatas: ?Array<PrivateGameTemplateListingData>,
  error: ?Error,
  shop: {
    privateGameTemplateListingDatasSearchResults: ?Array<PrivateGameTemplateListingData>,
    filtersState: FiltersState,
    setInitialGameTemplateUserFriendlySlug: string => void,
  },
  exampleStore: {
    privateGameTemplateListingDatasSearchResults: ?Array<{|
      item: PrivateGameTemplateListingData,
      matches: SearchMatch[],
    |}>,
    searchText: string,
    setSearchText: string => void,
    filtersState: FiltersState,
  },
|};

export const initialPrivateGameTemplateStoreState: PrivateGameTemplateStoreState = {
  gameTemplateFilters: null,
  fetchGameTemplates: () => {},
  privateGameTemplateListingDatas: null,
  error: null,
  shop: {
    privateGameTemplateListingDatasSearchResults: null,
    filtersState: {
      chosenFilters: new Set(),
      addFilter: () => {},
      removeFilter: () => {},
      chosenCategory: null,
      setChosenCategory: () => {},
    },
    setInitialGameTemplateUserFriendlySlug: (
      initialGameTemplateUserFriendlySlug: string
    ) => {},
  },
  exampleStore: {
    privateGameTemplateListingDatasSearchResults: null,
    searchText: '',
    setSearchText: () => {},
    filtersState: {
      chosenFilters: new Set(),
      addFilter: () => {},
      removeFilter: () => {},
      chosenCategory: null,
      setChosenCategory: () => {},
    },
  },
};

export const PrivateGameTemplateStoreContext = React.createContext<PrivateGameTemplateStoreState>(
  initialPrivateGameTemplateStoreState
);

type PrivateGameTemplateStoreStateProviderProps = {|
  children: React.Node,
|};

export const PrivateGameTemplateStoreStateProvider = ({
  children,
}: PrivateGameTemplateStoreStateProviderProps) => {
  const shopNavigationState = React.useContext(AssetStoreNavigatorContext);
  const {
    searchText: shopSearchText,
    setSearchText: setShopSearchText,
  } = shopNavigationState;
  const { limits } = React.useContext(AuthenticatedUserContext);

  const [
    gameTemplateFilters,
    setGameTemplateFilters,
  ] = React.useState<?Filters>(null);
  const [error, setError] = React.useState<?Error>(null);
  const [
    privateGameTemplateListingDatas,
    setPrivateGameTemplateListingDatas,
  ] = React.useState<?Array<PrivateGameTemplateListingData>>(null);
  const [
    initialGameTemplateUserFriendlySlug,
    setInitialGameTemplateUserFriendlySlug,
  ] = React.useState<?string>(null);
  const initialGameTemplateOpened = React.useRef<boolean>(false);

  const isLoading = React.useRef<boolean>(false);
  const { showAlert } = useAlertDialog();

  const [exampleStoreSearchText, setExampleStoreSearchText] = React.useState(
    defaultSearchText
  );
  const filtersStateForExampleStore = useFilters();

  const hidePremiumProducts =
    !!limits &&
    !!limits.capabilities.classrooms &&
    limits.capabilities.classrooms.hidePremiumProducts;

  const fetchGameTemplates = React.useCallback(
    () => {
      // If the game templates are already loaded, don't load them again.
      if (isLoading.current || privateGameTemplateListingDatas) return;

      (async () => {
        setError(null);
        isLoading.current = true;

        try {
          const fetchedPrivateGameTemplateListingDatas = await listListedPrivateGameTemplates();

          console.info(
            `Loaded ${
              fetchedPrivateGameTemplateListingDatas
                ? fetchedPrivateGameTemplateListingDatas.length
                : 0
            } game templates from the store.`
          );

          setPrivateGameTemplateListingDatas(
            fetchedPrivateGameTemplateListingDatas
          );
          const defaultTags = fetchedPrivateGameTemplateListingDatas.reduce(
            (allCategories, privateGameTemplateListingData) => {
              return allCategories.concat(
                privateGameTemplateListingData.categories.map(category =>
                  capitalize(category)
                )
              );
            },
            []
          );
          const uniqueDefaultTags = Array.from(new Set(defaultTags));
          const gameTemplateFilters: Filters = {
            allTags: [],
            defaultTags: uniqueDefaultTags,
            tagsTree: [],
          };
          setGameTemplateFilters(gameTemplateFilters);
        } catch (error) {
          console.error(
            `Unable to load the game templates from the store:`,
            error
          );
          setError(error);
        }

        isLoading.current = false;
      })();
    },
    [privateGameTemplateListingDatas]
  );

  // When the game templates are loaded,
  // open the game template with the slug that was asked to be initially loaded.
  React.useEffect(
    () => {
      if (
        !initialGameTemplateUserFriendlySlug ||
        initialGameTemplateOpened.current
      ) {
        // If there is no initial game template or
        // if the game template was already opened, don't re-open it again even
        // if the effect run again.
        return;
      }

      if (
        privateGameTemplateListingDatas &&
        initialGameTemplateUserFriendlySlug
      ) {
        initialGameTemplateOpened.current = true;

        // Open the information page of a the game template.
        const privateGameTemplateListingData = getPrivateGameTemplateListingDataFromUserFriendlySlug(
          {
            privateGameTemplateListingDatas,
            userFriendlySlug: initialGameTemplateUserFriendlySlug,
          }
        );

        if (privateGameTemplateListingData) {
          sendGameTemplateInformationOpened({
            gameTemplateName: privateGameTemplateListingData.name,
            gameTemplateId: privateGameTemplateListingData.id,
            source: 'web-link',
          });
          shopNavigationState.openPrivateGameTemplateInformationPage({
            privateGameTemplateListingData,
            storeSearchText: true,
            clearSearchText: false,
          });
          initialGameTemplateOpened.current = false; // Allow to open the game template again if the effect run again.
          setInitialGameTemplateUserFriendlySlug(null);
          return;
        }

        showAlert({
          title: t`Game template not found`,
          message: t`The link to the game template you've followed seems outdated. Why not take a look at the other templates in the store?`,
        });
      }
    },
    [
      privateGameTemplateListingDatas,
      shopNavigationState,
      showAlert,
      initialGameTemplateUserFriendlySlug,
    ]
  );

  React.useEffect(
    () => {
      if (isLoading.current) return;

      const timeoutId = setTimeout(() => {
        console.info('Pre-fetching game templates from the store...');
        fetchGameTemplates();
      }, PRIVATE_GAME_TEMPLATES_FETCH_TIMEOUT);
      return () => clearTimeout(timeoutId);
    },
    [fetchGameTemplates]
  );

  const privateGameTemplateListingDatasById = React.useMemo(
    () => {
      if (!privateGameTemplateListingDatas) {
        return null;
      }
      const privateGameTemplateListingDatasById = {};
      if (hidePremiumProducts) return privateGameTemplateListingDatasById;
      privateGameTemplateListingDatas.forEach(
        privateGameTemplateListingData => {
          const id = privateGameTemplateListingData.id;
          if (privateGameTemplateListingDatasById[id]) {
            console.warn(
              `Multiple private game templates with the same id: ${id}`
            );
          }
          privateGameTemplateListingDatasById[
            id
          ] = privateGameTemplateListingData;
        }
      );
      return privateGameTemplateListingDatasById;
    },
    [privateGameTemplateListingDatas, hidePremiumProducts]
  );

  const currentPage = shopNavigationState.getCurrentPage();

  const privateGameTemplateListingDatasSearchResultsForExampleStore: ?Array<{|
    item: PrivateGameTemplateListingData,
    matches: SearchMatch[],
  |}> = useSearchStructuredItem(privateGameTemplateListingDatasById, {
    searchText: exampleStoreSearchText,
    chosenCategory: filtersStateForExampleStore.chosenCategory,
    chosenFilters: filtersStateForExampleStore.chosenFilters,
    excludedTiers,
    defaultFirstSearchItemIds: firstGameTemplateIds,
    shuffleResults: false,
  });

  const privateGameTemplateListingDatasSearchResultsForShop: ?Array<PrivateGameTemplateListingData> = useSearchItem(
    privateGameTemplateListingDatasById,
    getPrivateGameTemplateListingDataSearchTerms,
    shopSearchText,
    currentPage.filtersState.chosenCategory,
    currentPage.filtersState.chosenFilters
  );

  const PrivateGameTemplateStoreState = React.useMemo(
    () => ({
      privateGameTemplateListingDatas: hidePremiumProducts
        ? []
        : privateGameTemplateListingDatas,
      error,
      gameTemplateFilters,
      fetchGameTemplates,
      shop: {
        privateGameTemplateListingDatasSearchResults: hidePremiumProducts
          ? []
          : privateGameTemplateListingDatasSearchResultsForShop,
        searchText: shopSearchText,
        setSearchText: setShopSearchText,
        filtersState: currentPage.filtersState,
        setInitialGameTemplateUserFriendlySlug,
      },
      exampleStore: {
        privateGameTemplateListingDatasSearchResults: hidePremiumProducts
          ? []
          : privateGameTemplateListingDatasSearchResultsForExampleStore,
        searchText: exampleStoreSearchText,
        setSearchText: setExampleStoreSearchText,
        filtersState: filtersStateForExampleStore,
      },
    }),
    [
      hidePremiumProducts,
      privateGameTemplateListingDatas,
      error,
      gameTemplateFilters,
      fetchGameTemplates,
      privateGameTemplateListingDatasSearchResultsForExampleStore,
      privateGameTemplateListingDatasSearchResultsForShop,
      shopSearchText,
      setShopSearchText,
      exampleStoreSearchText,
      currentPage.filtersState,
      filtersStateForExampleStore,
    ]
  );

  return (
    <PrivateGameTemplateStoreContext.Provider
      value={PrivateGameTemplateStoreState}
    >
      {children}
    </PrivateGameTemplateStoreContext.Provider>
  );
};
