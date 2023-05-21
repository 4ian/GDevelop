// @flow
import * as React from 'react';
import { type FiltersState } from '../UI/Search/FiltersChooser';
import {
  type AssetShortHeader,
  type PublicAssetPack,
  type PrivateAssetPack,
} from '../Utils/GDevelopServices/Asset';
import { type PrivateAssetPackListingData } from '../Utils/GDevelopServices/Shop';

export type AssetStorePageState = {|
  openedAssetPack: PublicAssetPack | PrivateAssetPack | null,
  openedAssetCategory: string | null,
  openedAssetShortHeader: ?AssetShortHeader,
  openedPrivateAssetPackListingData: ?PrivateAssetPackListingData,
  filtersState: FiltersState,
  scrollPosition?: ?number,
  displayAssets: boolean,
|};

export type NavigationState = {|
  getCurrentPage: () => AssetStorePageState,
  backToPreviousPage: () => AssetStorePageState,
  openHome: () => AssetStorePageState,
  clearHistory: () => void,
  openSearchResultPage: () => void,
  openTagPage: string => void,
  openAssetCategoryPage: string => void,
  openPackPage: (PublicAssetPack | PrivateAssetPack) => void,
  openPrivateAssetPackInformationPage: PrivateAssetPackListingData => void,
  openDetailPage: AssetShortHeader => void,
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
  openedAssetCategory: null,
  openedAssetPack: null,
  openedPrivateAssetPackListingData: null,
  filtersState: noFilter,
  displayAssets: false,
};

const searchPageState: AssetStorePageState = {
  openedAssetShortHeader: null,
  openedAssetCategory: null,
  openedAssetPack: null,
  openedPrivateAssetPackListingData: null,
  filtersState: noFilter,
  displayAssets: true,
};

export const isHomePage = (pageState: AssetStorePageState) => {
  return (
    pageState === assetStoreHomePageState ||
    (!pageState.openedAssetShortHeader &&
      !pageState.openedPrivateAssetPackListingData &&
      !pageState.openedAssetPack &&
      pageState.filtersState === noFilter &&
      !pageState.displayAssets)
  );
};

export const isSearchResultPage = (pageState: AssetStorePageState) => {
  return (
    !isHomePage(pageState) &&
    !pageState.openedAssetShortHeader &&
    !pageState.openedPrivateAssetPackListingData
  );
};

type AssetStorePageHistory = {|
  previousPages: Array<AssetStorePageState>,
|};

export const useNavigation = (): NavigationState => {
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
              openedAssetCategory: null,
              openedAssetPack: null,
              openedPrivateAssetPackListingData: null,
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
            },
          ],
        }));
      },
      openAssetCategoryPage: (category: string) => {
        setHistory(previousHistory => ({
          ...previousHistory,
          previousPages: [
            ...previousHistory.previousPages,
            {
              openedAssetShortHeader: null,
              openedAssetCategory: category,
              openedAssetPack: null,
              openedPrivateAssetPackListingData: null,
              filtersState: noFilter,
              displayAssets: false,
            },
          ],
        }));
      },
      openPackPage: (assetPack: PublicAssetPack | PrivateAssetPack) => {
        setHistory(previousHistory => {
          const currentPage =
            previousHistory.previousPages[
              previousHistory.previousPages.length - 1
            ];
          return {
            ...previousHistory,
            previousPages: [
              ...previousHistory.previousPages,
              {
                openedAssetShortHeader: null,
                openedAssetCategory:
                  (currentPage && currentPage.openedAssetCategory) || null,
                openedAssetPack: assetPack,
                openedPrivateAssetPackListingData: null,
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
              },
            ],
          };
        });
      },
      openPrivateAssetPackInformationPage: (
        assetPack: PrivateAssetPackListingData
      ) => {
        setHistory(previousHistory => ({
          ...previousHistory,
          previousPages: [
            ...previousHistory.previousPages,
            {
              openedAssetShortHeader: null,
              openedAssetCategory: null,
              openedAssetPack: null,
              openedPrivateAssetPackListingData: assetPack,
              filtersState: noFilter,
              displayAssets: false,
            },
          ],
        }));
      },
      openDetailPage: (assetShortHeader: AssetShortHeader) => {
        setHistory(previousHistory => ({
          ...previousHistory,
          previousPages: [
            ...previousHistory.previousPages,
            {
              openedAssetShortHeader: assetShortHeader,
              openedAssetCategory: null,
              openedAssetPack: null,
              openedPrivateAssetPackListingData: null,
              filtersState: noFilter,
              displayAssets: false,
            },
          ],
        }));
      },
    }),
    [previousPages]
  );
};
