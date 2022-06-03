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
  openHome: () => void,
  openSearchIfNeeded: () => void,
  openTagPage: string => void,
  openPackPage: AssetPack => void,
  openDetailPage: AssetShortHeader => void,
|};

export const assetStoreHomePageState: AssetStorePageState = {
  isOnHomePage: true,
  openedAssetShortHeader: null,
  openedAssetPack: null,
  filtersState: {
    chosenCategory: null,
    chosenFilters: new Set(),
    addFilter: () => {},
    removeFilter: () => {},
    setChosenCategory: () => {},
  },
  ignoreTextualSearch: false,
};

export const useNavigation = (): NavigationState => {
  const [currentPage, setCurrentPage] = React.useState<AssetStorePageState>(
    assetStoreHomePageState
  );
  // TODO It works because the currentPage changes but this is hacky.
  const [previousPages] = React.useState<Array<AssetStorePageState>>([
    currentPage,
  ]);

  return {
    previousPages,
    getCurrentPage: () => previousPages[previousPages.length - 1],
    backToPreviousPage: () => {
      if (previousPages.length > 1) {
        previousPages.pop();
        setCurrentPage(previousPages[previousPages.length - 1]);
      }
    },
    openHome: () => {
      previousPages.length = 0;
      previousPages.push(assetStoreHomePageState);
      setCurrentPage(previousPages[previousPages.length - 1]);
    },
    openSearchIfNeeded: () => {
      const currentPage = previousPages[previousPages.length - 1];
      if (currentPage.isOnHomePage || currentPage.openedAssetShortHeader) {
        previousPages.push({
          isOnHomePage: false,
          openedAssetShortHeader: null,
          openedAssetPack: null,
          filtersState: {
            chosenCategory: null,
            chosenFilters: new Set(),
            addFilter: () => {},
            removeFilter: () => {},
            setChosenCategory: () => {},
          },
          ignoreTextualSearch: false,
        });
        setCurrentPage(previousPages[previousPages.length - 1]);
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
      setCurrentPage(previousPages[previousPages.length - 1]);
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
      setCurrentPage(previousPages[previousPages.length - 1]);
    },
    openDetailPage: (assetShortHeader: AssetShortHeader) => {
      previousPages.push({
        isOnHomePage: false,
        openedAssetShortHeader: assetShortHeader,
        openedAssetPack: null,
        filtersState: {
          chosenCategory: null,
          chosenFilters: new Set(),
          addFilter: () => {},
          removeFilter: () => {},
          setChosenCategory: () => {},
        },
        ignoreTextualSearch: true,
      });
      setCurrentPage(previousPages[previousPages.length - 1]);
    },
  };
};
