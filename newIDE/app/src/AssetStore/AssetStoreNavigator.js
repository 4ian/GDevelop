// @flow
import * as React from 'react';
import { type FiltersState } from '../UI/Search/FiltersChooser';
import { type AssetShortHeader } from '../Utils/GDevelopServices/Asset';

export type AssetStorePageState = {|
  isOnHomePage: boolean,
  openedAssetShortHeader: ?AssetShortHeader,
  filtersState: FiltersState,
|};

export type NavigationState = {|
  previousPages: Array<AssetStorePageState>,
  getCurrentPage: () => AssetStorePageState,
  backToPreviousPage: () => void,
  openHome: () => void,
  openSearchIfNeeded: () => void,
  openTagPage: string => void,
  openDetailPage: AssetShortHeader => void,
|};

const homePage: AssetStorePageState = {
  isOnHomePage: true,
  openedAssetShortHeader: null,
  filtersState: {
    chosenCategory: null,
    chosenFilters: new Set(),
    addFilter: () => {},
    removeFilter: () => {},
    setChosenCategory: () => {},
  },
};

export const useNavigation = (): NavigationState => {
  const [currentPage, setCurrentPage] = React.useState<AssetStorePageState>(
    homePage
  );
  // TODO It works because the currentPage changes but this is hacky.
  const [previousPages] = React.useState<Array<AssetStorePageState>>([
    currentPage,
  ]);

  return {
    previousPages,
    getCurrentPage: () => previousPages[previousPages.length - 1],
    backToPreviousPage: () => {
      if (previousPages.length > 2) {
        previousPages.pop();
        setCurrentPage(previousPages[previousPages.length - 1]);
      }
    },
    openHome: () => {
      previousPages.length = 0;
      previousPages.push(homePage);
      setCurrentPage(previousPages[previousPages.length - 1]);
    },
    openSearchIfNeeded: () => {
      const currentPage = previousPages[previousPages.length - 1];
      if (currentPage.isOnHomePage || currentPage.openedAssetShortHeader) {
        previousPages.push({
          isOnHomePage: false,
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
      }
    },
    openTagPage: (tag: string) => {
      previousPages.push({
        isOnHomePage: false,
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
      previousPages.push({
        isOnHomePage: false,
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
