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
  AssetSwappingAssetStoreSearchFilter,
} from './AssetStoreSearchFilter';
import {
  type AssetStorePageState,
  assetStoreHomePageState,
  AssetStoreNavigatorContext,
} from './AssetStoreNavigator';
import { type ChosenCategory } from '../UI/Search/FiltersChooser';
import AuthenticatedUserContext from '../Profile/AuthenticatedUserContext';
import {
  getAssetPackFromUserFriendlySlug,
  getPrivateAssetPackListingDataFromUserFriendlySlug,
} from './AssetStoreUtils';
import useAlertDialog from '../UI/Alert/useAlertDialog';

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
  assetSwappingFilter: AssetSwappingAssetStoreSearchFilter,
  setAssetSwappingFilter: AssetSwappingAssetStoreSearchFilter => void,
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
  assetFiltersState: AssetFiltersState,
  assetPackFiltersState: AssetPackFiltersState,
  clearAllFilters: () => void,
  currentPage: AssetStorePageState,
  useSearchItem: (
    searchText: string,
    chosenCategory: ?ChosenCategory,
    chosenFilters: ?Set<string>,
    searchFilters: Array<SearchFilter<AssetShortHeader>>
  ) => ?Array<AssetShortHeader>,
  setInitialPackUserFriendlySlug: (initialPackUserFriendlySlug: string) => void,
  getAssetShortHeaderFromId: (id: string) => AssetShortHeader | null,
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
    assetSwappingFilter: new AssetSwappingAssetStoreSearchFilter(),
    setAssetSwappingFilter: filter => {},
  },
  assetPackFiltersState: {
    typeFilter: new AssetPackTypeStoreSearchFilter({}),
    setTypeFilter: filter => {},
  },
  clearAllFilters: () => {},
  currentPage: assetStoreHomePageState,
  useSearchItem: (searchText, chosenCategory, chosenFilters, searchFilters) =>
    null,
  setInitialPackUserFriendlySlug: (initialPackUserFriendlySlug: string) => {},
  getAssetShortHeaderFromId: (id: string) => null,
};

export const AssetStoreContext = React.createContext<AssetStoreState>(
  initialAssetStoreState
);

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

const getPublicAssetPackSearchTerms = (assetPack: PublicAssetPack) =>
  assetPack.name + '\n' + assetPack.tag;

const getPrivateAssetPackListingDataSearchTerms = (
  privateAssetPack: PrivateAssetPackListingData
) => privateAssetPack.name + '\n' + privateAssetPack.description;

export const AssetStoreStateProvider = ({
  children,
}: AssetStoreStateProviderProps) => {
  const shopNavigationState = React.useContext(AssetStoreNavigatorContext);
  const { searchText } = shopNavigationState;

  const [assetShortHeadersById, setAssetShortHeadersById] = React.useState<?{
    [string]: AssetShortHeader,
  }>(null);
  const getAssetShortHeaderFromId = React.useCallback(
    (id: string): AssetShortHeader | null =>
      (assetShortHeadersById && assetShortHeadersById[id]) || null,
    [assetShortHeadersById]
  );
  const [
    publicAssetShortHeaders,
    setPublicAssetShortHeaders,
  ] = React.useState<?Array<AssetShortHeader>>(null);
  const {
    receivedAssetShortHeaders,
    receivedAssetPacks,
    limits,
  } = React.useContext(AuthenticatedUserContext);
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
  const [
    assetSwappingFilter,
    setAssetSwappingFilter,
  ] = React.useState<AssetSwappingAssetStoreSearchFilter>(
    new AssetSwappingAssetStoreSearchFilter()
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
      assetSwappingFilter,
    ],
    [
      animatedFilter,
      viewpointFilter,
      dimensionFilter,
      objectTypeFilter,
      colorFilter,
      licenseFilter,
      assetSwappingFilter,
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
  const hidePremiumProducts =
    !!limits &&
    !!limits.capabilities.classrooms &&
    limits.capabilities.classrooms.hidePremiumProducts;

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
            storeSearchText: true,
            clearSearchText: false,
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
            storeSearchText: true,
            clearSearchText: false,
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
      if (hidePremiumProducts) return privateAssetPackListingDatasById;
      privateAssetPackListingDatas.forEach(privateAssetPackListingData => {
        const id = privateAssetPackListingData.id;
        if (privateAssetPackListingDatasById[id]) {
          console.warn(`Multiple private asset packs with the same id: ${id}`);
        }
        privateAssetPackListingDatasById[id] = privateAssetPackListingData;
      });
      return privateAssetPackListingDatasById;
    },
    [privateAssetPackListingDatas, hidePremiumProducts]
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
      assetSwappingFilter,
      setAssetSwappingFilter,
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
      assetSwappingFilter,
      setAssetSwappingFilter,
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
      // Keep assetSwappingFilter as its not a user filter.
    },
    [assetFiltersState, assetPackFiltersState]
  );

  const assetStoreState = React.useMemo(
    () => ({
      assetShortHeadersSearchResults,
      publicAssetPacksSearchResults,
      privateAssetPackListingDatasSearchResults: hidePremiumProducts
        ? []
        : privateAssetPackListingDatasSearchResults,
      fetchAssetsAndFilters,
      filters,
      publicAssetPacks,
      privateAssetPackListingDatas: hidePremiumProducts
        ? []
        : privateAssetPackListingDatas,
      authors,
      licenses,
      environment,
      setEnvironment,
      error,
      currentPage,
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
      getAssetShortHeaderFromId,
    }),
    [
      assetShortHeadersSearchResults,
      publicAssetPacksSearchResults,
      hidePremiumProducts,
      privateAssetPackListingDatasSearchResults,
      fetchAssetsAndFilters,
      filters,
      publicAssetPacks,
      privateAssetPackListingDatas,
      authors,
      licenses,
      environment,
      error,
      currentPage,
      assetFiltersState,
      assetPackFiltersState,
      clearAllFilters,
      getAssetShortHeaderFromId,
      assetShortHeadersById,
    ]
  );

  return (
    <AssetStoreContext.Provider value={assetStoreState}>
      {children}
    </AssetStoreContext.Provider>
  );
};
