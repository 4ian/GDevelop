// @flow
import * as React from 'react';
import { type FiltersState, useFilters } from '../UI/Search/FiltersChooser';
import { type Filters } from '../Utils/GDevelopServices/Filters';
import {
  type AssetShortHeader,
  type Author,
  type License,
  listAllAssets,
  listAllAuthors,
  listAllLicenses,
} from '../Utils/GDevelopServices/Asset';
import { useSearchItem } from '../UI/Search/UseSearchItem';

const defaultSearchText = '';

type AssetStoreState = {|
  filters: ?Filters,
  authors: ?Array<Author>,
  licenses: ?Array<License>,
  searchResults: ?Array<AssetShortHeader>,
  fetchAssetsAndFilters: () => void,
  error: ?Error,
  searchText: string,
  setSearchText: string => void,
  filtersState: FiltersState,
|};

export const AssetStoreContext = React.createContext<AssetStoreState>({
  filters: null,
  authors: null,
  licenses: null,
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
  const [authors, setAuthors] = React.useState<?Array<Author>>(null);
  const [licenses, setLicenses] = React.useState<?Array<License>>(null);
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
          const authors = await listAllAuthors();
          const licenses = await listAllLicenses();

          const assetShortHeadersById = {};
          assetShortHeaders.forEach(assetShortHeader => {
            assetShortHeadersById[assetShortHeader.id] = assetShortHeader;
          });

          console.info(
            `Loaded ${assetShortHeaders.length} assets from the asset store.`
          );
          setAssetShortHeadersById(assetShortHeadersById);
          setFilters(filters);
          setAuthors(authors);
          setLicenses(licenses);
        } catch (error) {
          console.error(
            `Unable to load the assets from the asset store:`,
            error
          );
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
      authors,
      licenses,
      error,
      searchText,
      setSearchText,
      filtersState,
    }),
    [
      searchResults,
      error,
      filters,
      authors,
      licenses,
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
