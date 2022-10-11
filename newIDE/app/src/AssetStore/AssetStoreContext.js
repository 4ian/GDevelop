// @flow
import * as React from 'react';
import { type Filters } from '../Utils/GDevelopServices/Filters';
import {
  type AssetShortHeader,
  type PublicAssetPacks,
  type Author,
  type License,
  type Environment,
  listAllPublicAssets,
  listAllAuthors,
  listAllLicenses,
} from '../Utils/GDevelopServices/Asset';
import {
  listListedPrivateAssetPacks,
  type PrivateAssetPackListingData,
} from '../Utils/GDevelopServices/Shop';
import { useSearchItem, SearchFilter } from '../UI/Search/UseSearchItem';
import {
  TagAssetStoreSearchFilter,
  AnimatedAssetStoreSearchFilter,
  ObjectTypeAssetStoreSearchFilter,
  ColorAssetStoreSearchFilter,
  LicenseAssetStoreSearchFilter,
  DimensionAssetStoreSearchFilter,
} from './AssetStoreSearchFilter';
import {
  type NavigationState,
  type AssetStorePageState,
  useNavigation,
  assetStoreHomePageState,
} from './AssetStoreNavigator';
import { type ChosenCategory } from '../UI/Search/FiltersChooser';
import shuffle from 'lodash/shuffle';
import AuthenticatedUserContext from '../Profile/AuthenticatedUserContext';

const defaultSearchText = '';
// TODO: Remove once the marketplace is up and running.
const ACTIVATE_ASSET_PACK_MARKETPLACE = false;

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
  publicAssetPacks: ?PublicAssetPacks,
  privateAssetPacks: ?Array<PrivateAssetPackListingData>,
  assetPackRandomOrdering: ?Array<number>,
  authors: ?Array<Author>,
  licenses: ?Array<License>,
  environment: Environment,
  setEnvironment: Environment => void,
  searchResults: ?Array<AssetShortHeader>,
  fetchAssetsAndFilters: () => void,
  error: ?Error,
  searchText: string,
  setSearchText: string => void,
  assetFiltersState: AssetFiltersState,
  navigationState: NavigationState,
  currentPage: AssetStorePageState,
  useSearchItem: (
    searchText: string,
    chosenCategory: ?ChosenCategory,
    chosenFilters: ?Set<string>,
    searchFilters: Array<SearchFilter<AssetShortHeader>>
  ) => ?Array<AssetShortHeader>,
|};

export const AssetStoreContext = React.createContext<AssetStoreState>({
  filters: null,
  publicAssetPacks: null,
  privateAssetPacks: null,
  assetPackRandomOrdering: null,
  authors: null,
  licenses: null,
  environment: 'live',
  setEnvironment: () => {},
  searchResults: null,
  fetchAssetsAndFilters: () => {},
  error: null,
  searchText: '',
  setSearchText: () => {},
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
  navigationState: {
    previousPages: [assetStoreHomePageState],
    getCurrentPage: () => assetStoreHomePageState,
    backToPreviousPage: () => {},
    openHome: () => {},
    clearHistory: () => {},
    openSearchIfNeeded: () => {},
    activateTextualSearch: () => {},
    openTagPage: string => {},
    openPackPage: AssetPack => {},
    openDetailPage: stAssetShortHeaderring => {},
  },
  currentPage: assetStoreHomePageState,
  useSearchItem: (searchText, chosenCategory, chosenFilters, searchFilters) =>
    null,
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

const getAssetPackRandomOrdering = (length: number): Array<number> => {
  const array = new Array(length).fill(0).map((_, index) => index);

  return ACTIVATE_ASSET_PACK_MARKETPLACE ? shuffle(array) : array;
};

export const AssetStoreStateProvider = ({
  children,
}: AssetStoreStateProviderProps) => {
  const [assetShortHeadersById, setAssetShortHeadersById] = React.useState<?{
    [string]: AssetShortHeader,
  }>(null);
  const { receivedAssetShortHeaders } = React.useContext(
    AuthenticatedUserContext
  );
  const [filters, setFilters] = React.useState<?Filters>(null);
  const [
    publicAssetPacks,
    setPublicAssetPacks,
  ] = React.useState<?PublicAssetPacks>(null);
  const [
    assetPackRandomOrdering,
    setAssetPackRandomOrdering,
  ] = React.useState<?Array<number>>(null);
  const [
    privateAssetPacks,
    setPrivateAssetPacks,
  ] = React.useState<?Array<PrivateAssetPackListingData>>(null);
  const [authors, setAuthors] = React.useState<?Array<Author>>(null);
  const [licenses, setLicenses] = React.useState<?Array<License>>(null);
  const [environment, setEnvironment] = React.useState<Environment>('live');
  const [error, setError] = React.useState<?Error>(null);
  const isLoading = React.useRef<boolean>(false);

  const [searchText, setSearchText] = React.useState(defaultSearchText);
  const navigationState = useNavigation();

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
    (options: ?{ force: boolean }) => {
      // Allowing forcing the fetch of the assets, even if it is currently loading.
      // This is helpful to avoid race conditions:
      // - the user opens the asset page -> assets load
      // - the user gets logged in at the same time -> private assets loaded
      if (isLoading.current && (!options || !options.force)) return;

      (async () => {
        setError(null);
        isLoading.current = true;

        try {
          const {
            publicAssetShortHeaders,
            publicFilters,
            publicAssetPacks,
          } = await listAllPublicAssets({ environment });
          const authors = await listAllAuthors({ environment });
          const licenses = await listAllLicenses({ environment });
          const privateAssetPacks = ACTIVATE_ASSET_PACK_MARKETPLACE
            ? await listListedPrivateAssetPacks()
            : [];

          const assetShortHeadersById = {};
          publicAssetShortHeaders.forEach(assetShortHeader => {
            assetShortHeadersById[assetShortHeader.id] = assetShortHeader;
          });
          if (ACTIVATE_ASSET_PACK_MARKETPLACE && receivedAssetShortHeaders) {
            receivedAssetShortHeaders.forEach(assetShortHeader => {
              assetShortHeadersById[assetShortHeader.id] = assetShortHeader;
            });
          }

          console.info(
            `Loaded ${
              publicAssetShortHeaders.length
            } assets from the asset store.`
          );
          setAssetShortHeadersById(assetShortHeadersById);
          setFilters(publicFilters);
          setPublicAssetPacks(publicAssetPacks);
          setAuthors(authors);
          setLicenses(licenses);
          setPrivateAssetPacks(privateAssetPacks);
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
    [isLoading, environment, receivedAssetShortHeaders]
  );

  // We're listening to the received assets changing to update the list of assets.
  // This can happen when the user logs in or logs out.
  React.useEffect(
    () => {
      if (!ACTIVATE_ASSET_PACK_MARKETPLACE || !receivedAssetShortHeaders) {
        return;
      }
      // We're forcing the fetch of the assets, even if it is currently loading,
      // in case the pre-fetching of the assets is happening at the same time,
      // or the user opens the asset store at the same time.
      fetchAssetsAndFilters({ force: true });
    },
    [receivedAssetShortHeaders, fetchAssetsAndFilters]
  );

  // Preload the assets and filters when the app loads, in case the user
  // is not logged in. (A log in will trigger a reload of the assets.)
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

  // Randomize asset packs when number of asset packs and private asset packs change
  const assetPackCount = publicAssetPacks
    ? publicAssetPacks.starterPacks.length
    : undefined;
  const privateAssetPackCount = privateAssetPacks
    ? privateAssetPacks.length
    : undefined;
  React.useEffect(
    () => {
      if (assetPackCount === undefined || privateAssetPackCount === undefined) {
        return;
      }
      setAssetPackRandomOrdering(
        getAssetPackRandomOrdering(assetPackCount + privateAssetPackCount)
      );
    },
    [assetPackCount, privateAssetPackCount]
  );

  const currentPage = navigationState.getCurrentPage();
  const { chosenCategory, chosenFilters } = currentPage.filtersState;
  const searchResults: ?Array<AssetShortHeader> = useSearchItem(
    assetShortHeadersById,
    getAssetShortHeaderSearchTerms,
    currentPage.ignoreTextualSearch ? '' : searchText,
    chosenCategory,
    chosenFilters,
    searchFilters
  );

  const assetStoreState = React.useMemo(
    () => ({
      searchResults,
      fetchAssetsAndFilters,
      filters,
      publicAssetPacks,
      privateAssetPacks,
      assetPackRandomOrdering,
      authors,
      licenses,
      environment,
      setEnvironment,
      error,
      navigationState,
      currentPage,
      searchText,
      setSearchText,
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
      useSearchItem: (
        searchText,
        chosenCategory,
        chosenFilters,
        searchFilters
      ) =>
        useSearchItem(
          assetShortHeadersById,
          getAssetShortHeaderSearchTerms,
          searchText,
          chosenCategory,
          chosenFilters,
          searchFilters
        ),
    }),
    [
      searchResults,
      fetchAssetsAndFilters,
      filters,
      publicAssetPacks,
      privateAssetPacks,
      assetPackRandomOrdering,
      authors,
      licenses,
      environment,
      setEnvironment,
      error,
      navigationState,
      currentPage,
      searchText,
      animatedFilter,
      viewpointFilter,
      dimensionFilter,
      objectTypeFilter,
      colorFilter,
      licenseFilter,
      setLicenseFilter,
      assetShortHeadersById,
    ]
  );

  return (
    <AssetStoreContext.Provider value={assetStoreState}>
      {children}
    </AssetStoreContext.Provider>
  );
};
