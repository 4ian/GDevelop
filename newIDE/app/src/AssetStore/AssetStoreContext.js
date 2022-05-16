// @flow
import * as React from 'react';
import { type FiltersState, useFilters } from '../UI/Search/FiltersChooser';
import { type Filters } from '../Utils/GDevelopServices/Filters';
import {
  type AssetShortHeader,
  type AssetPacks,
  type Author,
  type License,
  listAllAssets,
  listAllAuthors,
  listAllLicenses,
} from '../Utils/GDevelopServices/Asset';
import { useSearchItem, TagSearchFilter } from '../UI/Search/UseSearchItem';

const defaultSearchText = '';

type AssetStoreState = {|
  filters: ?Filters,
  assetPacks: ?AssetPacks,
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
  assetPacks: null,
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
  const [assetPacks, setAssetPacks] = React.useState<?AssetPacks>(null);
  const [authors, setAuthors] = React.useState<?Array<Author>>(null);
  const [licenses, setLicenses] = React.useState<?Array<License>>(null);
  const [error, setError] = React.useState<?Error>(null);
  const isLoading = React.useRef<boolean>(false);

  const [searchText, setSearchText] = React.useState(defaultSearchText);
  const filtersState = useFilters();

  const [viewportFilter, setViewportFilter] = React.useState<TagSearchFilter>(
    new TagSearchFilter()
  );
  // TODO Fix me: this is to give the same instance to UseSearchItem to avoid looping on the search.
  const [searchFilters, setSearchFilters] = React.useState<
    Array<TagSearchFilte>
  >([viewportFilter]);
  if (searchFilters[0] != viewportFilter) {
    setSearchFilters([viewportFilter]);
  }

  const fetchAssetsAndFilters = React.useCallback(
    () => {
      // Don't attempt to load again assets and filters if they
      // were loaded already.
      if (assetShortHeadersById || isLoading.current) return;

      (async () => {
        setError(null);
        isLoading.current = true;

        try {
          const {
            assetShortHeaders,
            filters,
            assetPacks,
          } = await listAllAssets();
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
          setAssetPacks(assetPacks);
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
    chosenFilters,
    searchFilters
  );

  const assetStoreState = React.useMemo(
    () => ({
      searchResults,
      fetchAssetsAndFilters,
      filters,
      assetPacks,
      authors,
      licenses,
      error,
      searchText,
      setSearchText,
      filtersState,
      viewportFilter,
      setViewportFilter,
    }),
    [
      searchResults,
      error,
      filters,
      assetPacks,
      authors,
      licenses,
      searchText,
      filtersState,
      fetchAssetsAndFilters,
      viewportFilter,
      setViewportFilter,
    ]
  );

  return (
    <AssetStoreContext.Provider value={assetStoreState}>
      {children}
    </AssetStoreContext.Provider>
  );
};
