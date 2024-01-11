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
  getCurrentPage: () => AssetStorePageState,
  backToPreviousPage: () => AssetStorePageState,
  openHome: () => AssetStorePageState,
  clearHistory: () => void,
  clearPreviousPageFromHistory: () => void,
  openSearchResultPage: () => void,
  openTagPage: string => void,
  openShopCategoryPage: string => void,
  openPackPage: ({|
    assetPack: PublicAssetPack | PrivateAssetPack,
    previousSearchText: string,
  |}) => void,
  openPrivateAssetPackInformationPage: ({|
    privateAssetPackListingData: PrivateAssetPackListingData,
    previousSearchText: string,
  |}) => void,
  openPrivateGameTemplateInformationPage: ({|
    privateGameTemplateListingData: PrivateGameTemplateListingData,
    previousSearchText: string,
  |}) => void,
  openAssetDetailPage: ({|
    assetShortHeader: AssetShortHeader,
    previousSearchText: string,
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

export const useShopNavigation = (): NavigationState => {
  const [history, setHistory] = React.useState<AssetStorePageHistory>({
    previousPages: [assetStoreHomePageState],
  });
  const previousPages = history.previousPages;

  return React.useMemo(
    () => ({
      getCurrentPage: () => previousPages[previousPages.length - 1],
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
          if (!isSearchResultPage(currentPage)) {
            return {
              ...previousHistory,
              previousPages: [
                ...previousHistory.previousPages,
                searchPageState,
              ],
            };
          }

          return previousHistory;
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
        previousSearchText,
      }: {|
        assetPack: PublicAssetPack | PrivateAssetPack,
        previousSearchText: string,
      |}) => {
        setHistory(previousHistory => {
          const currentPage =
            previousHistory.previousPages[
              previousHistory.previousPages.length - 1
            ];
          const currentPageWithSearchText = {
            ...currentPage,
            searchText: previousSearchText,
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
      },
      openPrivateAssetPackInformationPage: ({
        privateAssetPackListingData,
        previousSearchText,
      }: {|
        privateAssetPackListingData: PrivateAssetPackListingData,
        previousSearchText: string,
      |}) => {
        setHistory(previousHistory => {
          const currentPage =
            previousHistory.previousPages[
              previousHistory.previousPages.length - 1
            ];
          const currentPageWithSearchText = {
            ...currentPage,
            searchText: previousSearchText,
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
      },
      openAssetDetailPage: ({
        assetShortHeader,
        previousSearchText,
      }: {|
        assetShortHeader: AssetShortHeader,
        previousSearchText: string,
      |}) => {
        setHistory(previousHistory => {
          const currentPage =
            previousHistory.previousPages[
              previousHistory.previousPages.length - 1
            ];
          const currentPageWithSearchText = {
            ...currentPage,
            searchText: previousSearchText,
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
      },
      openPrivateGameTemplateInformationPage: ({
        privateGameTemplateListingData,
        previousSearchText,
      }: {|
        privateGameTemplateListingData: PrivateGameTemplateListingData,
        previousSearchText: string,
      |}) => {
        setHistory(previousHistory => {
          const currentPage =
            previousHistory.previousPages[
              previousHistory.previousPages.length - 1
            ];
          const currentPageWithSearchText = {
            ...currentPage,
            searchText: previousSearchText,
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
    [previousPages]
  );
};
