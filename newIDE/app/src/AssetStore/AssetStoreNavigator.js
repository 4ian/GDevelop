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
  isOnHomePage: boolean,
  openedAssetPack: PublicAssetPack | PrivateAssetPack | null,
  openedAssetShortHeader: ?AssetShortHeader,
  openedPrivateAssetPackListingData: ?PrivateAssetPackListingData,
  filtersState: FiltersState,
  ignoreTextualSearch: boolean,
  scrollPosition?: ?number,
|};

export type NavigationState = {|
  getCurrentPage: () => AssetStorePageState,
  backToPreviousPage: () => void,
  openHome: () => void,
  clearHistory: () => void,
  openSearchIfNeeded: () => void,
  activateTextualSearch: () => void,
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
  isOnHomePage: true,
  openedAssetShortHeader: null,
  openedAssetPack: null,
  openedPrivateAssetPackListingData: null,
  filtersState: noFilter,
  ignoreTextualSearch: false,
};

const searchPageState: AssetStorePageState = {
  isOnHomePage: false,
  openedAssetShortHeader: null,
  openedAssetPack: null,
  openedPrivateAssetPackListingData: null,
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
        const currentPage = previousPages[previousPages.length - 1];
        setHistory({ previousPages: [assetStoreHomePageState, currentPage] });
      },
      openSearchIfNeeded: () => {
        const currentPage = previousPages[previousPages.length - 1];
        if (currentPage.isOnHomePage || currentPage.openedAssetShortHeader) {
          setHistory({ previousPages: [...previousPages, searchPageState] });
        }
      },
      activateTextualSearch: () => {
        const currentPage = previousPages[previousPages.length - 1];
        if (currentPage.isOnHomePage || currentPage.openedAssetShortHeader) {
          setHistory({ previousPages: [...previousPages, searchPageState] });
        } else if (currentPage.ignoreTextualSearch) {
          currentPage.ignoreTextualSearch = false;
          setHistory({ previousPages: [...previousPages] });
        }
      },
      openTagPage: (tag: string) => {
        setHistory({
          previousPages: [
            ...previousPages,
            {
              isOnHomePage: false,
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
              ignoreTextualSearch: true,
            },
          ],
        });
      },
      openPackPage: (assetPack: PublicAssetPack | PrivateAssetPack) => {
        setHistory({
          previousPages: [
            ...previousPages,
            {
              isOnHomePage: false,
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
              ignoreTextualSearch: true,
            },
          ],
        });
      },
      openPrivateAssetPackInformationPage: (
        assetPack: PrivateAssetPackListingData
      ) => {
        setHistory({
          previousPages: [
            ...previousPages,
            {
              isOnHomePage: false,
              openedAssetShortHeader: null,
              openedAssetPack: null,
              openedPrivateAssetPackListingData: assetPack,
              filtersState: noFilter,
              ignoreTextualSearch: true,
            },
          ],
        });
      },
      openDetailPage: (assetShortHeader: AssetShortHeader) => {
        setHistory({
          previousPages: [
            ...previousPages,
            {
              isOnHomePage: false,
              openedAssetShortHeader: assetShortHeader,
              openedAssetPack: null,
              openedPrivateAssetPackListingData: null,
              filtersState: noFilter,
              ignoreTextualSearch: true,
            },
          ],
        });
      },
    }),
    [previousPages]
  );
};
