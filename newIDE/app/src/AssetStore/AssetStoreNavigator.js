// @flow
import * as React from 'react';
import { type FiltersState } from '../UI/Search/FiltersChooser';
import {
  type AssetShortHeader,
  type AssetPack,
} from '../Utils/GDevelopServices/Asset';

export type AssetStorePageState = {|
  isOnHomePage: boolean,
  openedAssetPack: ?AssetPack,
  openedAssetShortHeader: ?AssetShortHeader,
  filtersState: FiltersState,
  ignoreTextualSearch: boolean,
|};

export type NavigationState = {|
  previousPages: Array<AssetStorePageState>,
  getCurrentPage: () => AssetStorePageState,
  backToPreviousPage: () => void,
  showStagingAssets: boolean,
  toggleStagingAssets: () => void,
  openHome: () => void,
  clearHistory: () => void,
  openSearchIfNeeded: () => void,
  activateTextualSearch: () => void,
  openTagPage: string => void,
  openPackPage: AssetPack => void,
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
  isOnHomePage: true,
  openedAssetShortHeader: null,
  openedAssetPack: null,
  filtersState: noFilter,
  ignoreTextualSearch: false,
};

const searchPageState: AssetStorePageState = {
  isOnHomePage: false,
  openedAssetShortHeader: null,
  openedAssetPack: null,
  filtersState: noFilter,
  ignoreTextualSearch: false,
};

type AssetStorePageHistory = {|
  previousPages: Array<AssetStorePageState>,
|};

export const useNavigation = (): NavigationState => {
  const [history, setHistory] = React.useState<AssetStorePageHistory>({
    previousPages: [assetStoreHomePageState],
  });
  const [showStagingAssets, setShowStagingAssets] = React.useState(false);
  const previousPages = history.previousPages;

  return {
    previousPages,
    getCurrentPage: () => previousPages[previousPages.length - 1],
    backToPreviousPage: () => {
      if (previousPages.length > 1) {
        previousPages.pop();
        setHistory({ previousPages });
      }
    },
    showStagingAssets,
    toggleStagingAssets: () => {
      setShowStagingAssets(!showStagingAssets);
    },
    openHome: () => {
      previousPages.length = 0;
      previousPages.push(assetStoreHomePageState);
      setHistory({ previousPages });
    },
    clearHistory: () => {
      const currentPage = previousPages[previousPages.length - 1];
      previousPages.length = 0;
      previousPages.push(assetStoreHomePageState);
      previousPages.push(currentPage);
      setHistory({ previousPages });
    },
    openSearchIfNeeded: () => {
      const currentPage = previousPages[previousPages.length - 1];
      if (currentPage.isOnHomePage || currentPage.openedAssetShortHeader) {
        previousPages.push(searchPageState);
        setHistory({ previousPages });
      }
    },
    activateTextualSearch: () => {
      const currentPage = previousPages[previousPages.length - 1];
      if (currentPage.isOnHomePage || currentPage.openedAssetShortHeader) {
        previousPages.push(searchPageState);
        setHistory({ previousPages });
      } else if (currentPage.ignoreTextualSearch) {
        currentPage.ignoreTextualSearch = false;
        setHistory({ previousPages });
      }
    },
    openTagPage: (tag: string) => {
      previousPages.push({
        isOnHomePage: false,
        openedAssetShortHeader: null,
        openedAssetPack: null,
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
        ignoreTextualSearch: true,
      });
      setHistory({ previousPages });
    },
    openPackPage: (assetPack: AssetPack) => {
      previousPages.push({
        isOnHomePage: false,
        openedAssetShortHeader: null,
        openedAssetPack: assetPack,
        filtersState: {
          chosenCategory: {
            node: { name: assetPack.tag, allChildrenTags: [], children: [] },
            parentNodes: [],
          },
          chosenFilters: new Set(),
          addFilter: () => {},
          removeFilter: () => {},
          setChosenCategory: () => {},
        },
        ignoreTextualSearch: true,
      });
      setHistory({ previousPages });
    },
    openDetailPage: (assetShortHeader: AssetShortHeader) => {
      previousPages.push({
        isOnHomePage: false,
        openedAssetShortHeader: assetShortHeader,
        openedAssetPack: null,
        filtersState: noFilter,
        ignoreTextualSearch: true,
      });
      setHistory({ previousPages });
    },
  };
};
