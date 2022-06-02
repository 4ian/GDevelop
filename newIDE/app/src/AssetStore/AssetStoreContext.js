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
import { useSearchItem, SearchFilter } from '../UI/Search/UseSearchItem';
import {
  TagAssetStoreSearchFilter,
  AnimatedAssetStoreSearchFilter,
  ObjectTypeAssetStoreSearchFilter,
  ColorAssetStoreSearchFilter,
  LicenseAssetStoreSearchFilter,
  DimensionAssetStoreSearchFilter,
} from './AssetStoreSearchFilter';

const defaultSearchText = '';

export type AssetFiltersState = {|
  animatedFilter: AnimatedAssetStoreSearchFilter,
  setAnimatedFilter: AnimatedAssetStoreSearchFilter => void,
  viewpointFilter: TagAssetStoreSearchFilter,
  setViewpointFilter: TagAssetStoreSearchFilter => void,
  dimensionFilter: DimensionAssetStoreSearchFilter,
  setDimensionFilter: DimensionAssetStoreSearchFilter => void,
  objectTypeFilter: ObjectTypeAssetStoreSearchFilter,
  setObjectTypeFilter: ObjectTypeAssetStoreSearchFilter => void,
  colorFilter: ColorAssetStoreSearchFilter,
  setColorFilter: ColorAssetStoreSearchFilter => void,
  licenseFilter: LicenseAssetStoreSearchFilter,
  setLicenseFilter: LicenseAssetStoreSearchFilter => void,
|};

type AssetStoreState = {|
  filters: ?Filters,
  assetPacks: ?AssetPacks,
  authors: ?Array<Author>,
  licenses: ?Array<License>,
  searchResults: ?Array<AssetShortHeader>,
  fetchAssetsAndFilters: () => void,
  error: ?Error,
  isOnHomePage: boolean,
  setIsOnHomePage: boolean => void,
  openedAssetShortHeader: ?AssetShortHeader,
  setOpenedAssetShortHeader: (?AssetShortHeader) => void,
  searchText: string,
  setSearchText: string => void,
  filtersState: FiltersState,
  assetFiltersState: AssetFiltersState,
|};

export const AssetStoreContext = React.createContext<AssetStoreState>({
  filters: null,
  assetPacks: null,
  authors: null,
  licenses: null,
  searchResults: null,
  fetchAssetsAndFilters: () => {},
  error: null,
  isOnHomePage: true,
  setIsOnHomePage: () => {},
  openedAssetShortHeader: null,
  setOpenedAssetShortHeader: () => {},
  searchText: '',
  setSearchText: () => {},
  filtersState: {
    chosenFilters: new Set(),
    addFilter: () => {},
    removeFilter: () => {},
    chosenCategory: null,
    setChosenCategory: () => {},
  },
  assetFiltersState: {
    animatedFilter: new AnimatedAssetStoreSearchFilter(),
    setAnimatedFilter: filter => {},
    viewpointFilter: new TagAssetStoreSearchFilter(),
    setViewpointFilter: filter => {},
    dimensionFilter: new DimensionAssetStoreSearchFilter(),
    setDimensionFilter: filter => {},
    objectTypeFilter: new ObjectTypeAssetStoreSearchFilter(),
    setObjectTypeFilter: filter => {},
    colorFilter: new ColorAssetStoreSearchFilter(),
    setColorFilter: filter => {},
    licenseFilter: new LicenseAssetStoreSearchFilter(),
    setLicenseFilter: filter => {},
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

  const [isOnHomePage, setIsOnHomePage] = React.useState(true);
  const [
    openedAssetShortHeader,
    setOpenedAssetShortHeader,
  ] = React.useState<?AssetShortHeader>(null);
  const [searchText, setSearchText] = React.useState(defaultSearchText);
  const filtersState = useFilters();

  const [
    animatedFilter,
    setAnimatedFilter,
  ] = React.useState<AnimatedAssetStoreSearchFilter>(
    new AnimatedAssetStoreSearchFilter()
  );
  const [
    viewpointFilter,
    setViewpointFilter,
  ] = React.useState<TagAssetStoreSearchFilter>(
    new TagAssetStoreSearchFilter()
  );
  const [
    dimensionFilter,
    setDimensionFilter,
  ] = React.useState<DimensionAssetStoreSearchFilter>(
    new DimensionAssetStoreSearchFilter()
  );
  const [
    objectTypeFilter,
    setObjectTypeFilter,
  ] = React.useState<ObjectTypeAssetStoreSearchFilter>(
    new ObjectTypeAssetStoreSearchFilter()
  );
  const [
    colorFilter,
    setColorFilter,
  ] = React.useState<ColorAssetStoreSearchFilter>(
    new ColorAssetStoreSearchFilter()
  );
  const [
    licenseFilter,
    setLicenseFilter,
  ] = React.useState<LicenseAssetStoreSearchFilter>(
    new LicenseAssetStoreSearchFilter()
  );
  // When one of the filter change, we need to rebuild the array
  // for the search.
  const searchFilters = React.useMemo<Array<SearchFilter<AssetShortHeader>>>(
    () => [
      animatedFilter,
      viewpointFilter,
      dimensionFilter,
      objectTypeFilter,
      colorFilter,
      licenseFilter,
    ],
    [
      animatedFilter,
      viewpointFilter,
      dimensionFilter,
      objectTypeFilter,
      colorFilter,
      licenseFilter,
    ]
  );

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
      isOnHomePage,
      setIsOnHomePage,
      openedAssetShortHeader,
      setOpenedAssetShortHeader,
      searchText,
      setSearchText,
      filtersState,
      assetFiltersState: {
        animatedFilter,
        setAnimatedFilter,
        viewpointFilter,
        setViewpointFilter,
        dimensionFilter,
        setDimensionFilter,
        objectTypeFilter,
        setObjectTypeFilter,
        colorFilter,
        setColorFilter,
        licenseFilter,
        setLicenseFilter,
      },
    }),
    [
      searchResults,
      fetchAssetsAndFilters,
      filters,
      assetPacks,
      authors,
      licenses,
      error,
      isOnHomePage,
      openedAssetShortHeader,
      searchText,
      filtersState,
      animatedFilter,
      viewpointFilter,
      dimensionFilter,
      objectTypeFilter,
      colorFilter,
      licenseFilter,
    ]
  );

  return (
    <AssetStoreContext.Provider value={assetStoreState}>
      {children}
    </AssetStoreContext.Provider>
  );
};
