// @flow
import * as React from 'react';
import { type FiltersState } from '../UI/Search/FiltersChooser';
import {
  type AssetShortHeader,
  type PublicAssetPack,
  type PrivateAssetPack,
} from '../Utils/GDevelopServices/Asset';
import {
  type PrivateAssetPackListingData,
  type PrivateGameTemplateListingData,
} from '../Utils/GDevelopServices/Shop';

export type AssetStorePageState = {|
  openedAssetPack: PublicAssetPack | PrivateAssetPack | null,
  openedShopCategory: string | null,
  openedAssetShortHeader: ?AssetShortHeader,
  openedPrivateAssetPackListingData: ?PrivateAssetPackListingData,
  openedPrivateGameTemplateListingData: ?PrivateGameTemplateListingData,
  selectedFolders: Array<string>,
  filtersState: FiltersState,
  pageBreakIndex?: ?number,
  scrollPosition?: ?number,
  displayAssets: boolean,
  searchText?: string,
|};

export type NavigationState = {|
  searchText: string,
  setSearchText: string => void,
  getCurrentPage: () => AssetStorePageState,
  isRootPage: boolean,
  backToPreviousPage: () => AssetStorePageState,
  openHome: () => AssetStorePageState,
  openAssetSwapping: () => AssetStorePageState,
  clearHistory: () => void,
  clearPreviousPageFromHistory: () => void,
  openSearchResultPage: () => void,
  openTagPage: string => void,
  openShopCategoryPage: string => void,
  openPackPage: ({|
    assetPack: PublicAssetPack | PrivateAssetPack,
    storeSearchText: boolean,
    clearSearchText: boolean,
  |}) => void,
  openPrivateAssetPackInformationPage: ({|
    privateAssetPackListingData: PrivateAssetPackListingData,
    storeSearchText: boolean,
    clearSearchText: boolean,
  |}) => void,
  openPrivateGameTemplateInformationPage: ({|
    privateGameTemplateListingData: PrivateGameTemplateListingData,
    storeSearchText: boolean,
    clearSearchText: boolean,
  |}) => void,
  openAssetDetailPage: ({|
    assetShortHeader: AssetShortHeader,
    storeSearchText: boolean,
    clearSearchText: boolean,
  |}) => void,
  navigateInsideFolder: string => void,
  goBackToFolderIndex: number => void,
|};

const noFilter: FiltersState = {
  chosenCategory: null,
  chosenFilters: new Set(),
  addFilter: () => {},
  removeFilter: () => {},
  setChosenCategory: () => {},
};

export const assetStoreHomePageState: AssetStorePageState = {
  openedAssetShortHeader: null,
  openedShopCategory: null,
  openedAssetPack: null,
  openedPrivateAssetPackListingData: null,
  openedPrivateGameTemplateListingData: null,
  selectedFolders: [],
  filtersState: noFilter,
  displayAssets: false,
};

const searchPageState: AssetStorePageState = {
  openedAssetShortHeader: null,
  openedShopCategory: null,
  openedAssetPack: null,
  openedPrivateAssetPackListingData: null,
  openedPrivateGameTemplateListingData: null,
  selectedFolders: [],
  filtersState: noFilter,
  displayAssets: true,
};

export const isHomePage = (pageState: AssetStorePageState) => {
  return (
    pageState === assetStoreHomePageState ||
    (!pageState.openedAssetShortHeader &&
      !pageState.openedPrivateAssetPackListingData &&
      !pageState.openedPrivateGameTemplateListingData &&
      !pageState.openedAssetPack &&
      pageState.filtersState === noFilter &&
      !pageState.displayAssets)
  );
};

export const isSearchResultPage = (pageState: AssetStorePageState) => {
  return (
    !isHomePage(pageState) &&
    !pageState.openedAssetShortHeader &&
    !pageState.openedPrivateAssetPackListingData &&
    !pageState.openedPrivateGameTemplateListingData
  );
};

type AssetStorePageHistory = {|
  previousPages: Array<AssetStorePageState>,
|};

export const AssetStoreNavigatorContext = React.createContext<NavigationState>({
  searchText: '',
  setSearchText: () => {},
  getCurrentPage: () => assetStoreHomePageState,
  isRootPage: true,
  backToPreviousPage: () => assetStoreHomePageState,
  openHome: () => assetStoreHomePageState,
  openAssetSwapping: () => assetStoreHomePageState,
  clearHistory: () => {},
  clearPreviousPageFromHistory: () => {},
  openSearchResultPage: () => {},
  openTagPage: string => {},
  openShopCategoryPage: string => {},
  openPackPage: () => {},
  openPrivateAssetPackInformationPage: () => {},
  openPrivateGameTemplateInformationPage: () => {},
  openAssetDetailPage: () => {},
  navigateInsideFolder: string => {},
  goBackToFolderIndex: number => {},
});

type AssetStoreNavigatorStateProviderProps = {|
  children: React.Node,
|};

export const AssetStoreNavigatorStateProvider = (
  props: AssetStoreNavigatorStateProviderProps
) => {
  const [searchText, setSearchText] = React.useState<string>('');
  const [history, setHistory] = React.useState<AssetStorePageHistory>({
    previousPages: [assetStoreHomePageState],
  });
  const previousPages = history.previousPages;

  const state = React.useMemo(
    () => ({
      searchText,
      setSearchText,
      getCurrentPage: () => previousPages[previousPages.length - 1],
      isRootPage: previousPages.length <= 1,
      backToPreviousPage: () => {
        if (previousPages.length > 1) {
          const newPreviousPages = previousPages.slice(
            0,
            previousPages.length - 1
          );
          const newCurrentPage = newPreviousPages[newPreviousPages.length - 1];
          setHistory({
            previousPages: newPreviousPages,
          });
          return newCurrentPage;
        }
        return previousPages[0];
      },
      openHome: () => {
        setHistory({ previousPages: [assetStoreHomePageState] });
        return assetStoreHomePageState;
      },
      openAssetSwapping: () => {
        const assetSwappingState = { ...searchPageState };
        setHistory({ previousPages: [assetSwappingState] });
        return assetSwappingState;
      },
      clearHistory: () => {
        setHistory(previousHistory => {
          if (previousHistory.previousPages.length <= 1) return previousHistory;

          const currentPage =
            previousHistory.previousPages[
              previousHistory.previousPages.length - 1
            ];
          return { previousPages: [assetStoreHomePageState, currentPage] };
        });
      },
      clearPreviousPageFromHistory: () => {
        setHistory(previousHistory => {
          if (previousHistory.previousPages.length <= 1) return previousHistory;

          const newPreviousPages = previousHistory.previousPages.slice(
            0,
            previousHistory.previousPages.length - 1
          );
          return { previousPages: newPreviousPages };
        });
      },
      openSearchResultPage: () => {
        setHistory(previousHistory => {
          const currentPage =
            previousHistory.previousPages[
              previousHistory.previousPages.length - 1
            ];
          if (isSearchResultPage(currentPage)) {
            const updatedCurrentPage = {
              ...currentPage,
              pageBreakIndex: 0,
              scrollPosition: 0,
            };
            return {
              ...previousHistory,
              previousPages: [
                // All pages except the last one
                ...previousHistory.previousPages.slice(0, -1),
                updatedCurrentPage,
              ],
            };
          } else {
            return {
              ...previousHistory,
              previousPages: [
                ...previousHistory.previousPages,
                searchPageState,
              ],
            };
          }
        });
      },
      openTagPage: (tag: string) => {
        setHistory(previousHistory => ({
          ...previousHistory,
          previousPages: [
            ...previousHistory.previousPages,
            {
              openedAssetShortHeader: null,
              openedShopCategory: null,
              openedAssetPack: null,
              openedPrivateAssetPackListingData: null,
              openedPrivateGameTemplateListingData: null,
              displayAssets: true,
              filtersState: {
                chosenCategory: {
                  node: { name: tag, allChildrenTags: [], children: [] },
                  parentNodes: [],
                },
                chosenFilters: new Set(),
                addFilter: () => {},
                removeFilter: () => {},
                setChosenCategory: () => {},
              },
              selectedFolders: [tag],
            },
          ],
        }));
      },
      openShopCategoryPage: (category: string) => {
        setHistory(previousHistory => ({
          ...previousHistory,
          previousPages: [
            ...previousHistory.previousPages,
            {
              openedAssetShortHeader: null,
              openedShopCategory: category,
              openedAssetPack: null,
              openedPrivateAssetPackListingData: null,
              openedPrivateGameTemplateListingData: null,
              filtersState: noFilter,
              displayAssets: false,
              selectedFolders: [],
            },
          ],
        }));
      },
      openPackPage: ({
        assetPack,
        storeSearchText,
        clearSearchText,
      }: {|
        assetPack: PublicAssetPack | PrivateAssetPack,
        storeSearchText: boolean,
        clearSearchText: boolean,
      |}) => {
        setHistory(previousHistory => {
          const currentPage =
            previousHistory.previousPages[
              previousHistory.previousPages.length - 1
            ];
          const currentPageWithSearchText = {
            ...currentPage,
            searchText: storeSearchText ? searchText : '',
          };
          const previousPagesWithoutCurrentPage = previousHistory.previousPages.slice(
            0,
            previousHistory.previousPages.length - 1
          );
          const previousPages = [
            ...previousPagesWithoutCurrentPage,
            currentPageWithSearchText,
          ];
          return {
            ...previousHistory,
            previousPages: [
              ...previousPages,
              {
                openedAssetShortHeader: null,
                openedShopCategory:
                  (currentPage && currentPage.openedShopCategory) || null,
                openedAssetPack: assetPack,
                openedPrivateAssetPackListingData: null,
                openedPrivateGameTemplateListingData: null,
                displayAssets: true,
                filtersState: {
                  chosenCategory: {
                    node: {
                      name: assetPack.tag,
                      allChildrenTags: [],
                      children: [],
                    },
                    parentNodes: [],
                  },
                  chosenFilters: new Set(),
                  addFilter: () => {},
                  removeFilter: () => {},
                  setChosenCategory: () => {},
                },
                selectedFolders: [assetPack.tag],
              },
            ],
          };
        });
        if (clearSearchText) setSearchText('');
      },
      openPrivateAssetPackInformationPage: ({
        privateAssetPackListingData,
        storeSearchText,
        clearSearchText,
      }: {|
        privateAssetPackListingData: PrivateAssetPackListingData,
        storeSearchText: boolean,
        clearSearchText: boolean,
      |}) => {
        setHistory(previousHistory => {
          const currentPage =
            previousHistory.previousPages[
              previousHistory.previousPages.length - 1
            ];
          const currentPageWithSearchText = {
            ...currentPage,
            searchText: storeSearchText ? searchText : '',
          };
          const previousPagesWithoutCurrentPage = previousHistory.previousPages.slice(
            0,
            previousHistory.previousPages.length - 1
          );
          const previousPages = [
            ...previousPagesWithoutCurrentPage,
            currentPageWithSearchText,
          ];
          return {
            ...previousHistory,
            previousPages: [
              ...previousPages,
              {
                openedAssetShortHeader: null,
                openedShopCategory: null,
                openedAssetPack: null,
                openedPrivateAssetPackListingData: privateAssetPackListingData,
                openedPrivateGameTemplateListingData: null,
                filtersState: noFilter,
                displayAssets: false,
                selectedFolders: [],
              },
            ],
          };
        });
        if (clearSearchText) setSearchText('');
      },
      openAssetDetailPage: ({
        assetShortHeader,
        storeSearchText,
        clearSearchText,
      }: {|
        assetShortHeader: AssetShortHeader,
        storeSearchText: boolean,
        clearSearchText: boolean,
      |}) => {
        setHistory(previousHistory => {
          const currentPage =
            previousHistory.previousPages[
              previousHistory.previousPages.length - 1
            ];
          const currentPageWithSearchText = {
            ...currentPage,
            searchText: storeSearchText ? searchText : '',
          };
          const previousPagesWithoutCurrentPage = previousHistory.previousPages.slice(
            0,
            previousHistory.previousPages.length - 1
          );
          const previousPages = [
            ...previousPagesWithoutCurrentPage,
            currentPageWithSearchText,
          ];
          return {
            ...previousHistory,
            previousPages: [
              ...previousPages,
              {
                openedAssetShortHeader: assetShortHeader,
                openedShopCategory: null,
                openedAssetPack: null,
                openedPrivateAssetPackListingData: null,
                openedPrivateGameTemplateListingData: null,
                filtersState: noFilter,
                displayAssets: false,
                selectedFolders: [],
              },
            ],
          };
        });
        if (clearSearchText) setSearchText('');
      },
      openPrivateGameTemplateInformationPage: ({
        privateGameTemplateListingData,
        storeSearchText,
        clearSearchText,
      }: {|
        privateGameTemplateListingData: PrivateGameTemplateListingData,
        storeSearchText: boolean,
        clearSearchText: boolean,
      |}) => {
        setHistory(previousHistory => {
          const currentPage =
            previousHistory.previousPages[
              previousHistory.previousPages.length - 1
            ];
          const currentPageWithSearchText = {
            ...currentPage,
            searchText: storeSearchText ? searchText : '',
          };
          const previousPagesWithoutCurrentPage = previousHistory.previousPages.slice(
            0,
            previousHistory.previousPages.length - 1
          );
          const previousPages = [
            ...previousPagesWithoutCurrentPage,
            currentPageWithSearchText,
          ];
          return {
            ...previousHistory,
            previousPages: [
              ...previousPages,
              {
                openedAssetShortHeader: null,
                openedShopCategory: null,
                openedAssetPack: null,
                openedPrivateAssetPackListingData: null,
                openedPrivateGameTemplateListingData: privateGameTemplateListingData,
                filtersState: noFilter,
                displayAssets: false,
                selectedFolders: [],
              },
            ],
          };
        });
        if (clearSearchText) setSearchText('');
      },
      navigateInsideFolder: (folderTag: string) => {
        setHistory(previousHistory => {
          const currentPage =
            previousHistory.previousPages[
              previousHistory.previousPages.length - 1
            ];
          const currentPageWithSelectedFolder = {
            ...currentPage,
            selectedFolders: [...currentPage.selectedFolders, folderTag],
          };
          const previousPagesWithoutCurrentPage = previousHistory.previousPages.slice(
            0,
            previousHistory.previousPages.length - 1
          );
          const previousPages = [
            ...previousPagesWithoutCurrentPage,
            currentPageWithSelectedFolder,
          ];
          return {
            ...previousHistory,
            previousPages,
          };
        });
      },
      goBackToFolderIndex: (folderIndex: number) => {
        setHistory(previousHistory => {
          const currentPage =
            previousHistory.previousPages[
              previousHistory.previousPages.length - 1
            ];
          const currentPageWithSelectedFolder = {
            ...currentPage,
            selectedFolders: currentPage.selectedFolders.slice(
              0,
              folderIndex + 1
            ),
          };
          const previousPagesWithoutCurrentPage = previousHistory.previousPages.slice(
            0,
            previousHistory.previousPages.length - 1
          );
          const previousPages = [
            ...previousPagesWithoutCurrentPage,
            currentPageWithSelectedFolder,
          ];
          return {
            ...previousHistory,
            previousPages,
          };
        });
      },
    }),
    [searchText, previousPages]
  );

  return (
    <AssetStoreNavigatorContext.Provider value={state}>
      {props.children}
    </AssetStoreNavigatorContext.Provider>
  );
};
