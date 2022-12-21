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
  openedAssetShortHeader: ?AssetShortHeader,
  openedPrivateAssetPackListingData: ?PrivateAssetPackListingData,
  filtersState: FiltersState,
  scrollPosition?: ?number,
|};

export type NavigationState = {|
  getCurrentPage: () => AssetStorePageState,
  backToPreviousPage: () => void,
  openHome: () => void,
  clearHistory: () => void,
  openSearchPage: () => void,
  openTagPage: string => void,
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
  openedAssetPack: null,
  openedPrivateAssetPackListingData: null,
  filtersState: noFilter,
};

const searchPageState: AssetStorePageState = {
  openedAssetShortHeader: null,
  openedAssetPack: null,
  openedPrivateAssetPackListingData: null,
  filtersState: noFilter,
};

export const isHomePage = (pageState: AssetStorePageState) => {
  return pageState === assetStoreHomePageState;
};

export const isShowingSearchResultPage = (pageState: AssetStorePageState) => {
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
          setHistory({
            previousPages: previousPages.slice(0, previousPages.length - 1),
          });
        }
      },
      openHome: () => {
        setHistory({ previousPages: [assetStoreHomePageState] });
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
      openSearchPage: () => {
        setHistory(previousHistory => {
          const currentPage =
            previousHistory.previousPages[
              previousHistory.previousPages.length - 1
            ];
          if (!isShowingSearchResultPage(currentPage)) {
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
              openedAssetPack: null,
              openedPrivateAssetPackListingData: null,
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
      openPackPage: (assetPack: PublicAssetPack | PrivateAssetPack) => {
        setHistory(previousHistory => ({
          ...previousHistory,
          previousPages: [
            ...previousHistory.previousPages,
            {
              openedAssetShortHeader: null,
              openedAssetPack: assetPack,
              openedPrivateAssetPackListingData: null,
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
        }));
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
              openedAssetPack: null,
              openedPrivateAssetPackListingData: assetPack,
              filtersState: noFilter,
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
              openedAssetPack: null,
              openedPrivateAssetPackListingData: null,
              filtersState: noFilter,
            },
          ],
        }));
      },
    }),
    [previousPages]
  );
};
