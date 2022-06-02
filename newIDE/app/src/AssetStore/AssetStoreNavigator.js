// @flow
import * as React from 'react';
import { type FiltersState } from '../UI/Search/FiltersChooser';
import { type AssetShortHeader } from '../Utils/GDevelopServices/Asset';

export type AssetStorePageState = {|
  openedAssetShortHeader: ?AssetShortHeader,
  filtersState: FiltersState,
|};

export type NavigationState = {|
  previousPages: Array<AssetStorePageState>,
  getCurrentPage: () => AssetStorePageState,
  backToPreviousPage: () => void,
  openHome: () => void,
  openTagPage: string => void,
  openDetailPage: AssetShortHeader => void,
|};

export const useNavigation = (): NavigationState => {
  const [currentPage, setCurrentPage] = React.useState<AssetStorePageState>({
    openedAssetShortHeader: null,
    filtersState: {
      chosenCategory: null,
      chosenFilters: new Set(),
      addFilter: () => {},
      removeFilter: () => {},
      setChosenCategory: () => {},
    },
  });
  // TODO It works because the currentPage changes but this is hacky.
  const [previousPages] = React.useState<Array<AssetStorePageState>>([
    currentPage,
  ]);

  return {
    previousPages,
    getCurrentPage: () => previousPages[previousPages.length - 1],
    backToPreviousPage: () => {
      previousPages.pop();
      setCurrentPage(previousPages[previousPages.length - 1]);
    },
    openHome: () => {
      previousPages.length = 0;
      previousPages.push({
        openedAssetShortHeader: null,
        filtersState: {
          chosenCategory: null,
          chosenFilters: new Set(),
          addFilter: () => {},
          removeFilter: () => {},
          setChosenCategory: () => {},
        },
      });
      setCurrentPage(previousPages[previousPages.length - 1]);
    },
    openTagPage: (tag: string) => {
      previousPages.push({
        openedAssetShortHeader: null,
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
      });
      setCurrentPage(previousPages[previousPages.length - 1]);
    },
    openDetailPage: (assetShortHeader: AssetShortHeader) => {
      console.log(assetShortHeader);
      previousPages.push({
        openedAssetShortHeader: assetShortHeader,
        filtersState: {
          chosenCategory: null,
          chosenFilters: new Set(),
          addFilter: () => {},
          removeFilter: () => {},
          setChosenCategory: () => {},
        },
      });
      setCurrentPage(previousPages[previousPages.length - 1]);
    },
  };
};
