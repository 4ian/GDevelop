// @flow
import * as React from 'react';
import {
  type FiltersState,
  type ChosenCategory,
  useFilters,
} from './FiltersChooser';
import {
  type AssetShortHeader,
  type Filters,
  listAllAssets,
} from '../Utils/GDevelopServices/Asset';
import shuffle from 'lodash/shuffle';
import SearchApi from 'js-worker-search';

const defaultSearchText = '';

type AssetStoreState = {|
  filters: ?Filters,
  searchResults: ?Array<AssetShortHeader>,
  fetchAssetsAndFilters: () => void,
  error: ?Error,
  searchText: string,
  setSearchText: string => void,
  filtersState: FiltersState,
|};

export const AssetStoreContext = React.createContext<AssetStoreState>({
  filters: null,
  searchResults: null,
  fetchAssetsAndFilters: () => {},
  error: null,
  searchText: '',
  setSearchText: () => {},
  filtersState: {
    chosenFilters: new Set(),
    addFilter: () => {},
    removeFilter: () => {},
    chosenCategory: null,
    setChosenCategory: () => {},
  },
});

type AssetStoreStateProviderProps = {|
  children: React.Node,
|};

const filterAssetShortHeaders = (
  assetShortHeaders: ?Array<AssetShortHeader>,
  chosenCategory: ?ChosenCategory,
  chosenFilters: Set<string>
) => {
  if (!assetShortHeaders) return null;

  const startTime = performance.now();
  const filteredAssetShortHeaders = assetShortHeaders
    .filter(({ tags }) => {
      if (!chosenCategory) return true;

      const hasChosenCategoryTag = tags.some(
        tag => tag === chosenCategory.node.name
      );
      if (!hasChosenCategoryTag) return false; // Asset is not in the selected category
      for (const parentNode of chosenCategory.parentNodes) {
        const hasParentCategoryTag = tags.some(tag => tag === parentNode.name);
        if (!hasParentCategoryTag) return false; // Asset is not in the the parent(s) of the selected category
      }

      return true;
    })
    .filter(({ tags }) => {
      return (
        chosenFilters.size === 0 || tags.some(tag => chosenFilters.has(tag))
      );
    });

  const totalTime = performance.now() - startTime;
  console.info(
    `Filtered assets by category/filters in ${totalTime.toFixed(3)}ms.`
  );
  return filteredAssetShortHeaders;
};

export const AssetStoreStateProvider = ({
  children,
}: AssetStoreStateProviderProps) => {
  const searchApiRef = React.useRef<?any>(null);
  const [
    searchResults,
    setSearchResults,
  ] = React.useState<?Array<AssetShortHeader>>(null);

  const [assetShortHeadersById, setAssetShortHeadersById] = React.useState<?{
    [string]: AssetShortHeader,
  }>(null);
  const [filters, setFilters] = React.useState<?Filters>(null);
  const [error, setError] = React.useState<?Error>(null);
  const isLoading = React.useRef<boolean>(false);

  const [searchText, setSearchText] = React.useState(defaultSearchText);
  const filtersState = useFilters();

  const fetchAssetsAndFilters = React.useCallback(
    () => {
      // Don't attempt to load again assets and filters if they
      // were loaded already.
      if (assetShortHeadersById || isLoading.current) return;

      (async () => {
        setError(null);
        isLoading.current = true;

        try {
          const { assetShortHeaders, filters } = await listAllAssets();

          const assetShortHeadersById = {};
          assetShortHeaders.forEach(assetShortHeader => {
            assetShortHeadersById[assetShortHeader.id] = assetShortHeader;
          });

          console.info(
            `Loaded ${assetShortHeaders.length} assets from the asset store.`
          );
          setAssetShortHeadersById(assetShortHeadersById);
          setFilters(filters);
        } catch (error) {
          setError(error);
        }

        isLoading.current = false;
      })();
    },
    [assetShortHeadersById, isLoading]
  );

  React.useEffect(
    () => {
      // Don't attempt to load again assets and filters if they
      // were loaded already.
      if (assetShortHeadersById || isLoading.current) return;

      const timeoutId = setTimeout(() => {
        console.info('Pre-fetching assets from asset store...');
        fetchAssetsAndFilters();
      }, 6000);
      return () => clearTimeout(timeoutId);
    },
    [fetchAssetsAndFilters, assetShortHeadersById, isLoading]
  );

  // Keep in memory a list of all the assets, shuffled for
  // easing random discovery of assets when no search is done.
  const suffledAssetShortHeaders: ?Array<AssetShortHeader> = React.useMemo(
    () => {
      if (!assetShortHeadersById) return null;

      return shuffle(
        Object.keys(assetShortHeadersById).map(id => assetShortHeadersById[id])
      );
    },
    [assetShortHeadersById]
  );

  // Index assets that have been loaded.
  React.useEffect(
    () => {
      if (!assetShortHeadersById) {
        // Nothing to index - yet.
        return;
      }

      const startTime = performance.now();
      if (searchApiRef.current) {
        searchApiRef.current.terminate();
        searchApiRef.current = null;
      }

      try {
        const newSearchApi = new SearchApi();
        const allIds = Object.keys(assetShortHeadersById);

        allIds.forEach(id => {
          const assetShortHeader = assetShortHeadersById[id];
          newSearchApi.indexDocument(
            assetShortHeader.id,
            assetShortHeader.name +
              '\n' +
              assetShortHeader.shortDescription +
              '\n' +
              assetShortHeader.tags.join(', ')
          );
        });

        const totalTime = performance.now() - startTime;
        console.info(
          `Indexed ${allIds.length} assets in ${totalTime.toFixed(3)}ms.`
        );
        searchApiRef.current = newSearchApi;
      } catch (error) {
        console.error('Error while indexing assets: ', error);
      }
    },
    [assetShortHeadersById]
  );

  // Update the search results according to the assets/search term/
  // chosen category and chosen filters.
  const searchApi = searchApiRef.current;
  const { chosenCategory, chosenFilters } = filtersState;
  React.useEffect(
    () => {
      let discardSearch = false;
      if (!searchText) {
        setSearchResults(
          filterAssetShortHeaders(
            suffledAssetShortHeaders,
            chosenCategory,
            chosenFilters
          )
        );
      } else {
        if (!assetShortHeadersById || !searchApi) {
          console.info(
            'Search for assets skipped because assets are not ready - will be retried when ready'
          );
          return;
        }

        const startTime = performance.now();
        searchApi
          .search(searchText)
          .then((partialSearchResultIds: Array<string>) => {
            if (discardSearch) {
              console.info(
                'Discarding search results as a new search was launched.'
              );
              return;
            }

            const partialSearchResults = partialSearchResultIds
              .map(id => assetShortHeadersById[id])
              .filter(Boolean);

            const totalTime = performance.now() - startTime;
            console.info(
              `Found ${
                partialSearchResults.length
              } assets in ${totalTime.toFixed(3)}ms.`
            );

            setSearchResults(
              filterAssetShortHeaders(
                partialSearchResults,
                chosenCategory,
                chosenFilters
              )
            );
          });
      }

      return () => {
        // Effect is being destroyed - meaning that a new search was launched.
        // Cancel this one.
        discardSearch = true;
      };
    },
    [
      suffledAssetShortHeaders,
      assetShortHeadersById,
      searchText,
      chosenCategory,
      chosenFilters,
      searchApi,
    ]
  );

  const assetStoreState = React.useMemo(
    () => ({
      searchResults,
      fetchAssetsAndFilters,
      filters,
      error,
      searchText,
      setSearchText,
      filtersState,
    }),
    [
      searchResults,
      error,
      filters,
      searchText,
      filtersState,
      fetchAssetsAndFilters,
    ]
  );

  return (
    <AssetStoreContext.Provider value={assetStoreState}>
      {children}
    </AssetStoreContext.Provider>
  );
};
