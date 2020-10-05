// @flow
import * as React from 'react';
import { type FiltersState, useFilters } from './FiltersChooser';
import {
  type AssetShortHeader,
  type Filters,
  listAllAssets,
} from '../Utils/GDevelopServices/Asset';
import { useSearchItem } from './UseSearchItem';

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

const getAssetShortHeaderSearchTerms = (assetShortHeader: AssetShortHeader) => {
  return (
    assetShortHeader.name +
    '\n' +
    assetShortHeader.shortDescription +
    '\n' +
    assetShortHeader.tags.join(', ')
  );
};

export const AssetStoreStateProvider = ({
  children,
}: AssetStoreStateProviderProps) => {
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

  const { chosenCategory, chosenFilters } = filtersState;
  const searchResults: ?Array<AssetShortHeader> = useSearchItem(
    assetShortHeadersById,
    getAssetShortHeaderSearchTerms,
    searchText,
    chosenCategory,
    chosenFilters
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
