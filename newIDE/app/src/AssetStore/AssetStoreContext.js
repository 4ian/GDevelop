// @flow
import * as React from 'react';
import { t } from '@lingui/macro';
import { type Filters } from '../Utils/GDevelopServices/Filters';
import {
  type AssetShortHeader,
  type PublicAssetPacks,
  type PublicAssetPack,
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
  AssetPackTypeStoreSearchFilter,
} from './AssetStoreSearchFilter';
import {
  type NavigationState,
  type AssetStorePageState,
  assetStoreHomePageState,
} from './AssetStoreNavigator';
import { type ChosenCategory } from '../UI/Search/FiltersChooser';
import AuthenticatedUserContext from '../Profile/AuthenticatedUserContext';
import {
  getAssetPackFromUserFriendlySlug,
  getPrivateAssetPackListingDataFromUserFriendlySlug,
} from './AssetStoreUtils';
import useAlertDialog from '../UI/Alert/useAlertDialog';

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

export type AssetPackFiltersState = {|
  typeFilter: AssetPackTypeStoreSearchFilter,
  setTypeFilter: AssetPackTypeStoreSearchFilter => void,
|};

type AssetStoreState = {|
  filters: ?Filters,
  publicAssetPacks: ?PublicAssetPacks,
  privateAssetPackListingDatas: ?Array<PrivateAssetPackListingData>,
  authors: ?Array<Author>,
  licenses: ?Array<License>,
  environment: Environment,
  setEnvironment: Environment => void,
  assetShortHeadersSearchResults: ?Array<AssetShortHeader>,
  publicAssetPacksSearchResults: ?Array<PublicAssetPack>,
  privateAssetPackListingDatasSearchResults: ?Array<PrivateAssetPackListingData>,
  fetchAssetsAndFilters: () => void,
  error: ?Error,
  searchText: string,
  setSearchText: string => void,
  assetFiltersState: AssetFiltersState,
  assetPackFiltersState: AssetPackFiltersState,
  clearAllFilters: () => void,
  shopNavigationState: NavigationState,
  currentPage: AssetStorePageState,
  useSearchItem: (
    searchText: string,
    chosenCategory: ?ChosenCategory,
    chosenFilters: ?Set<string>,
    searchFilters: Array<SearchFilter<AssetShortHeader>>
  ) => ?Array<AssetShortHeader>,
  setInitialPackUserFriendlySlug: (initialPackUserFriendlySlug: string) => void,
|};

export const initialAssetStoreState: AssetStoreState = {
  filters: null,
  publicAssetPacks: null,
  privateAssetPackListingDatas: null,
  authors: null,
  licenses: null,
  environment: 'live',
  setEnvironment: () => {},
  assetShortHeadersSearchResults: null,
  publicAssetPacksSearchResults: null,
  privateAssetPackListingDatasSearchResults: null,
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
  assetPackFiltersState: {
    typeFilter: new AssetPackTypeStoreSearchFilter({}),
    setTypeFilter: filter => {},
  },
  clearAllFilters: () => {},
  shopNavigationState: {
    getCurrentPage: () => assetStoreHomePageState,
    backToPreviousPage: () => assetStoreHomePageState,
    openHome: () => assetStoreHomePageState,
    clearHistory: () => {},
    clearPreviousPageFromHistory: () => {},
    openSearchResultPage: () => {},
    openTagPage: tag => {},
    openShopCategoryPage: category => {},
    openPackPage: ({ assetPack, previousSearchText }) => {},
    openAssetDetailPage: ({ assetShortHeader, previousSearchText }) => {},
    openPrivateAssetPackInformationPage: ({
      privateAssetPackListingData,
      previousSearchText,
    }) => {},
    openPrivateGameTemplateInformationPage: ({
      privateGameTemplateListingData,
      previousSearchText,
    }) => {},
    navigateInsideFolder: folder => {},
    goBackToFolderIndex: index => {},
  },
  currentPage: assetStoreHomePageState,
  useSearchItem: (searchText, chosenCategory, chosenFilters, searchFilters) =>
    null,
  setInitialPackUserFriendlySlug: (initialPackUserFriendlySlug: string) => {},
};

export const AssetStoreContext = React.createContext<AssetStoreState>(
  initialAssetStoreState
);

type AssetStoreStateProviderProps = {|
  shopNavigationState: NavigationState,
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

const getPublicAssetPackSearchTerms = (assetPack: PublicAssetPack) =>
  assetPack.name + '\n' + assetPack.tag;

const getPrivateAssetPackListingDataSearchTerms = (
  privateAssetPack: PrivateAssetPackListingData
) => privateAssetPack.name + '\n' + privateAssetPack.description;

export const AssetStoreStateProvider = ({
  shopNavigationState,
  children,
}: AssetStoreStateProviderProps) => {
  const [assetShortHeadersById, setAssetShortHeadersById] = React.useState<?{
    [string]: AssetShortHeader,
  }>(null);
  const [
    publicAssetShortHeaders,
    setPublicAssetShortHeaders,
  ] = React.useState<?Array<AssetShortHeader>>(null);
  const { receivedAssetShortHeaders, receivedAssetPacks } = React.useContext(
    AuthenticatedUserContext
  );
  const [filters, setFilters] = React.useState<?Filters>(null);
  const [
    publicAssetPacks,
    setPublicAssetPacks,
  ] = React.useState<?PublicAssetPacks>(null);
  const [
    privateAssetPackListingDatas,
    setPrivateAssetPackListingDatas,
  ] = React.useState<?Array<PrivateAssetPackListingData>>(null);
  const [authors, setAuthors] = React.useState<?Array<Author>>(null);
  const [licenses, setLicenses] = React.useState<?Array<License>>(null);
  const [environment, setEnvironment] = React.useState<Environment>('live');
  const [error, setError] = React.useState<?Error>(null);
  const [
    initialPackUserFriendlySlug,
    setInitialPackUserFriendlySlug,
  ] = React.useState<?string>(null);
  const initialPackOpened = React.useRef<boolean>(false);
  const { showAlert } = useAlertDialog();

  const [searchText, setSearchText] = React.useState(defaultSearchText);

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
  const assetSearchFilters = React.useMemo<
    Array<SearchFilter<AssetShortHeader>>
  >(
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

  const [
    assetPackTypeFilter,
    setAssetPackTypeFilter,
  ] = React.useState<AssetPackTypeStoreSearchFilter>(
    new AssetPackTypeStoreSearchFilter({ receivedAssetPacks })
  );
  const assetPackSearchFilters = React.useMemo<
    Array<SearchFilter<PublicAssetPack | PrivateAssetPackListingData>>
  >(() => [assetPackTypeFilter], [assetPackTypeFilter]);

  const fetchAssetsAndFilters = React.useCallback(
    () => {
      (async () => {
        setError(null);

        try {
          const {
            publicAssetShortHeaders: fetchedPublicAssetShortHeaders,
            publicFilters: fetchedPublicFilters,
            publicAssetPacks: fetchedPublicAssetPacks,
          } = await listAllPublicAssets({ environment });
          const fetchedAuthors = await listAllAuthors({ environment });
          const fetchedLicenses = await listAllLicenses({ environment });
          const fetchedPrivateAssetPackListingDatas = await listListedPrivateAssetPacks();

          console.info(
            `Loaded ${
              fetchedPublicAssetShortHeaders
                ? fetchedPublicAssetShortHeaders.length
                : 0
            } assets from the asset store.`
          );
          setPublicAssetPacks(fetchedPublicAssetPacks);
          setPublicAssetShortHeaders(fetchedPublicAssetShortHeaders);
          setFilters(fetchedPublicFilters);
          setAuthors(fetchedAuthors);
          setLicenses(fetchedLicenses);
          setPrivateAssetPackListingDatas(fetchedPrivateAssetPackListingDatas);
        } catch (error) {
          console.error(
            `Unable to load the assets from the asset store:`,
            error
          );
          setError(error);
        }
      })();
    },
    [environment]
  );

  // When the public assets or the private assets are loaded, regenerate the
  // list of all assets by ids.
  React.useEffect(
    () => {
      const assetShortHeadersById = {};
      if (publicAssetShortHeaders) {
        publicAssetShortHeaders.forEach(assetShortHeader => {
          assetShortHeadersById[assetShortHeader.id] = assetShortHeader;
        });
      }
      if (receivedAssetShortHeaders) {
        receivedAssetShortHeaders.forEach(assetShortHeader => {
          assetShortHeadersById[assetShortHeader.id] = assetShortHeader;
        });
      }
      if (Object.keys(assetShortHeadersById).length > 0) {
        setAssetShortHeadersById(assetShortHeadersById);
      }
    },
    [publicAssetShortHeaders, receivedAssetShortHeaders]
  );

  // When the asset packs (public and received private packs) are loaded,
  // open the asset pack with the slug that was asked to be initially loaded.
  React.useEffect(
    () => {
      if (!initialPackUserFriendlySlug || initialPackOpened.current) {
        // If there is no initial pack or
        // if the pack was already opened, don't re-open it again even
        // if the effect run again.
        return;
      }

      if (
        publicAssetPacks &&
        receivedAssetPacks &&
        privateAssetPackListingDatas &&
        initialPackUserFriendlySlug
      ) {
        initialPackOpened.current = true;

        // Try to first find a public or received asset pack.
        const assetPack = getAssetPackFromUserFriendlySlug({
          publicAssetPacks,
          receivedAssetPacks,
          userFriendlySlug: initialPackUserFriendlySlug,
        });

        if (assetPack) {
          shopNavigationState.openPackPage({
            assetPack,
            previousSearchText: searchText,
          });
          initialPackOpened.current = false; // Allow to open the pack again if the effect run again.
          setInitialPackUserFriendlySlug(null);
          return;
        }

        // Otherwise, try to open the information page of a pack not yet bought.
        const privateAssetPackListingData = getPrivateAssetPackListingDataFromUserFriendlySlug(
          {
            privateAssetPackListingDatas,
            userFriendlySlug: initialPackUserFriendlySlug,
          }
        );

        if (privateAssetPackListingData) {
          shopNavigationState.openPrivateAssetPackInformationPage({
            privateAssetPackListingData,
            previousSearchText: searchText,
          });
          initialPackOpened.current = false; // Allow to open the pack again if the effect run again.
          setInitialPackUserFriendlySlug(null);
          return;
        }

        showAlert({
          title: t`Asset pack not found`,
          message: t`The link to the asset pack you've followed seems outdated. Why not take a look at the other packs in the asset store?`,
        });
      }
    },
    [
      publicAssetPacks,
      receivedAssetPacks,
      privateAssetPackListingDatas,
      shopNavigationState,
      showAlert,
      initialPackUserFriendlySlug,
      searchText,
    ]
  );

  React.useEffect(
    () => {
      // the callback fetchAssetsAndFilters depends on the environment,
      // so it will be called again if the environment changes.
      fetchAssetsAndFilters();
    },
    [fetchAssetsAndFilters]
  );

  const publicAssetPacksByTag = React.useMemo(
    () => {
      if (!publicAssetPacks || !publicAssetPacks.starterPacks) {
        return null;
      }
      const publicAssetPacksByTag = {};
      publicAssetPacks.starterPacks.forEach(assetPack => {
        const tag = assetPack.tag;
        if (
          publicAssetPacksByTag[tag] &&
          !assetPack.externalWebLink // Don't warn for external web links, as they can be used multiple times.
        ) {
          console.warn(`Multiple public asset packs with the same tag: ${tag}`);
        }
        publicAssetPacksByTag[tag] = assetPack;
      });
      return publicAssetPacksByTag;
    },
    [publicAssetPacks]
  );

  const privateAssetPackListingDatasById = React.useMemo(
    () => {
      if (!privateAssetPackListingDatas) {
        return null;
      }
      const privateAssetPackListingDatasById = {};
      privateAssetPackListingDatas.forEach(privateAssetPackListingData => {
        const id = privateAssetPackListingData.id;
        if (privateAssetPackListingDatasById[id]) {
          console.warn(`Multiple private asset packs with the same id: ${id}`);
        }
        privateAssetPackListingDatasById[id] = privateAssetPackListingData;
      });
      return privateAssetPackListingDatasById;
    },
    [privateAssetPackListingDatas]
  );

  const currentPage = shopNavigationState.getCurrentPage();
  const { chosenCategory, chosenFilters } = currentPage.filtersState;
  const assetShortHeadersSearchResults: ?Array<AssetShortHeader> = useSearchItem(
    assetShortHeadersById,
    getAssetShortHeaderSearchTerms,
    searchText,
    chosenCategory,
    chosenFilters,
    assetSearchFilters
  );

  const publicAssetPacksSearchResults: ?Array<PublicAssetPack> = useSearchItem(
    publicAssetPacksByTag,
    getPublicAssetPackSearchTerms,
    searchText,
    chosenCategory,
    null,
    // $FlowFixMe - this filter works for both public and private packs
    assetPackSearchFilters
  );

  const privateAssetPackListingDatasSearchResults: ?Array<PrivateAssetPackListingData> = useSearchItem(
    privateAssetPackListingDatasById,
    getPrivateAssetPackListingDataSearchTerms,
    searchText,
    chosenCategory,
    null,
    // $FlowFixMe - this filter works for both public and private packs
    assetPackSearchFilters
  );

  const assetFiltersState: AssetFiltersState = React.useMemo(
    () => ({
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
    }),
    [
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
    ]
  );

  const assetPackFiltersState: AssetPackFiltersState = React.useMemo(
    () => ({
      typeFilter: assetPackTypeFilter,
      setTypeFilter: setAssetPackTypeFilter,
    }),
    [assetPackTypeFilter, setAssetPackTypeFilter]
  );

  const clearAllFilters = React.useCallback(
    () => {
      assetFiltersState.setAnimatedFilter(new AnimatedAssetStoreSearchFilter());
      assetFiltersState.setViewpointFilter(new TagAssetStoreSearchFilter());
      assetFiltersState.setDimensionFilter(
        new DimensionAssetStoreSearchFilter()
      );
      assetFiltersState.setObjectTypeFilter(
        new ObjectTypeAssetStoreSearchFilter()
      );
      assetFiltersState.setColorFilter(new ColorAssetStoreSearchFilter());
      assetFiltersState.setLicenseFilter(new LicenseAssetStoreSearchFilter());
      assetPackFiltersState.setTypeFilter(
        new AssetPackTypeStoreSearchFilter({})
      );
    },
    [assetFiltersState, assetPackFiltersState]
  );

  const assetStoreState = React.useMemo(
    () => ({
      assetShortHeadersSearchResults,
      publicAssetPacksSearchResults,
      privateAssetPackListingDatasSearchResults,
      fetchAssetsAndFilters,
      filters,
      publicAssetPacks,
      privateAssetPackListingDatas,
      authors,
      licenses,
      environment,
      setEnvironment,
      error,
      shopNavigationState,
      currentPage,
      searchText,
      setSearchText,
      assetFiltersState,
      assetPackFiltersState,
      clearAllFilters,
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
      setInitialPackUserFriendlySlug,
    }),
    [
      assetShortHeadersSearchResults,
      publicAssetPacksSearchResults,
      privateAssetPackListingDatasSearchResults,
      fetchAssetsAndFilters,
      filters,
      publicAssetPacks,
      privateAssetPackListingDatas,
      authors,
      licenses,
      environment,
      setEnvironment,
      error,
      shopNavigationState,
      currentPage,
      searchText,
      assetFiltersState,
      assetPackFiltersState,
      clearAllFilters,
      assetShortHeadersById,
      setInitialPackUserFriendlySlug,
    ]
  );

  return (
    <AssetStoreContext.Provider value={assetStoreState}>
      {children}
    </AssetStoreContext.Provider>
  );
};
