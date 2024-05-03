// @flow
import * as React from 'react';
import { type ChosenCategory } from './FiltersChooser';
import shuffle from 'lodash/shuffle';
import SearchApi from 'js-worker-search';
import {
  type AssetShortHeader,
  type PublicAssetPack,
  type Resource,
} from '../../Utils/GDevelopServices/Asset';
import {
  type PrivateAssetPackListingData,
  type PrivateGameTemplateListingData,
} from '../../Utils/GDevelopServices/Shop';

type SearchableItem =
  | AssetShortHeader
  | PublicAssetPack
  | Resource
  | PrivateAssetPackListingData
  | PrivateGameTemplateListingData;

export interface SearchFilter<SearchItem> {
  getPertinence(searchItem: SearchItem): number;
  hasFilters(): boolean;
}

export class TagSearchFilter<SearchItem: AssetShortHeader | Resource>
  implements SearchFilter<SearchItem> {
  tags: Set<string>;

  constructor(tags: Set<string> = new Set()) {
    this.tags = tags;
  }

  getPertinence(searchItem: SearchItem): number {
    return this.tags.size === 0 ||
      searchItem.tags.some(tag => this.tags.has(tag))
      ? 1
      : 0;
  }

  hasFilters(): boolean {
    return this.tags.size > 0;
  }
}

/**
 * Approximately sort the elements from biggest to smallest.
 *
 * It does a quick sort but only on the left side. It means that elements with
 * a poor pertinence won't be sorted as well as the one with a good pertinence.
 *
 * This allows a O(n) complexity in most cases, but still a O(n²) in worst
 * cases scenario (when all the values are the same).
 */
export const partialQuickSort = <Element: any>(
  searchItems: Array<Element>,
  getValue: (a: Element) => number,
  valueMin: number,
  valueMax: number
): void => {
  if (valueMin >= valueMax) {
    // All values are the same.
    return;
  }
  let indexMax = searchItems.length - 1;
  // Values are between 0 and pertinenceMax.
  // Each pass ensures that elements are on the good side of the pivot.
  // With a pertinenceMax of 1, the pivot takes the values: 0.5, 0.25, 0.125...
  for (
    let pivotComplement = 0.5;
    pivotComplement > 1 / 128 && indexMax > 0;
    pivotComplement /= 2
  ) {
    let pivot = valueMin + (valueMax - valueMin) * (1 - pivotComplement);
    let slidingIndexMin = 0 - 1;
    let slidingIndexMax = indexMax + 1;
    while (true) {
      do {
        slidingIndexMin++;
      } while (
        slidingIndexMin < indexMax &&
        getValue(searchItems[slidingIndexMin]) > pivot
      );
      if (slidingIndexMin === indexMax) {
        // All the values are on the left side.
        // They must be sorted.
        // Let's try with the next pivot value.
        break;
      }
      do {
        slidingIndexMax--;
      } while (
        slidingIndexMax > 0 &&
        getValue(searchItems[slidingIndexMax]) < pivot
      );
      if (slidingIndexMax === 0) {
        // All the values are on the right side.
        // As the pivot converge on the maximum value,
        // The sort is finished.
        return;
      }

      if (slidingIndexMin >= slidingIndexMax) {
        // All values are on the good side of the pivot.
        indexMax = slidingIndexMax;
        break;
      }
      const swap = searchItems[slidingIndexMin];
      searchItems[slidingIndexMin] = searchItems[slidingIndexMax];
      searchItems[slidingIndexMax] = swap;
    }
  }
};

/**
 * Filter a list of items according to the chosen category
 * and the chosen filters.
 */
export const filterSearchItems = <SearchItem: SearchableItem>(
  searchItems: ?Array<SearchItem>,
  chosenCategory: ?ChosenCategory,
  chosenFilters: ?Set<string>,
  searchFilters?: Array<SearchFilter<SearchItem>>
): ?Array<SearchItem> => {
  if (!searchItems) return null;

  const startTime = performance.now();
  // TODO do only one call to filter for efficiency.
  const filteredSearchItems = searchItems
    .filter(searchItem => {
      if (!chosenCategory) return true;
      if (chosenCategory && !searchItem.tags) {
        // TODO: If the item has no tags, it's a Public or Private pack.
        // We don't have information about the tags present in the pack yet, so
        // we cannot return results when a tag/category is selected.
        return false;
      }

      const hasChosenCategoryTag =
        // If the chosen category is a container of tags, not a real tag, then
        // skip checking if the item has it.
        chosenCategory.node.isTagContainerOnly ||
        (searchItem.tags &&
          searchItem.tags.some(tag => tag === chosenCategory.node.name));
      if (!hasChosenCategoryTag) return false; // Item is not in the selected category
      for (const parentNode of chosenCategory.parentNodes) {
        if (parentNode.isTagContainerOnly) {
          // The parent is a container of tags, not a real tag. No need
          // to check if the item has it.
          return true;
        }

        const hasParentCategoryTag =
          searchItem.tags &&
          searchItem.tags.some(tag => tag === parentNode.name);
        if (!hasParentCategoryTag) return false; // Item is not in the parent(s) of the selected category
      }

      return true;
    })
    .filter(searchItem => {
      return (
        !chosenFilters ||
        chosenFilters.size === 0 ||
        (searchItem.tags &&
          searchItem.tags.some(tag => chosenFilters.has(tag))) ||
        (searchItem.categories &&
          searchItem.categories.some(category => chosenFilters.has(category)))
      );
    });

  let sortedSearchItems = filteredSearchItems;
  if (searchFilters) {
    let pertinenceMin = 1;
    let pertinenceMax = 0;
    const weightedSearchItems = filteredSearchItems
      .map(searchItem => {
        let pertinence = 1;
        for (const searchFilter of searchFilters) {
          pertinence *= searchFilter.getPertinence(searchItem);
          if (pertinence === 0) {
            return null;
          }
        }
        pertinenceMin = Math.min(pertinenceMin, pertinence);
        pertinenceMax = Math.max(pertinenceMax, pertinence);
        return { pertinence: pertinence, searchItem: searchItem };
      })
      .filter(Boolean);
    partialQuickSort(
      weightedSearchItems,
      weightedSearchItem => weightedSearchItem.pertinence,
      pertinenceMin,
      pertinenceMax
    );
    sortedSearchItems = weightedSearchItems.map(
      weightedSearchItem => weightedSearchItem.searchItem
    );
  }

  const totalTime = performance.now() - startTime;
  console.info(
    `Filtered items by category/filters in ${totalTime.toFixed(3)}ms.`
  );
  return sortedSearchItems;
};

/**
 * Allow to efficiently search and filters items.
 *
 * This instantiates a search API (in a web-worker, if available), index
 * the specified items, then returns the results of the search (according to the
 * search text and the chosen category/filters).
 *
 * Search is done asynchronously within a web-worker when available, so they
 * won't block the main thread.
 */
export const useSearchItem = <SearchItem: SearchableItem>(
  searchItemsById: ?{ [string]: SearchItem },
  getItemDescription: SearchItem => string,
  searchText: string,
  chosenCategory: ?ChosenCategory,
  chosenFilters: ?Set<string>,
  searchFilters?: Array<SearchFilter<SearchItem>>
): ?Array<SearchItem> => {
  const searchApiRef = React.useRef<?any>(null);
  const [searchResults, setSearchResults] = React.useState<?Array<SearchItem>>(
    null
  );

  // Keep in memory a list of all the items, shuffled for
  // easing random discovery of items when no search is done.
  const shuffledSearchItems: ?Array<SearchItem> = React.useMemo(
    () => {
      if (!searchItemsById) return null;

      return shuffle(
        Object.keys(searchItemsById).map(id => searchItemsById[id])
      );
    },
    [searchItemsById]
  );
  const sortedSearchItems: ?Array<SearchItem> = React.useMemo(
    () => {
      if (!searchItemsById) return null;

      return Object.keys(searchItemsById).map(id => searchItemsById[id]);
    },
    [searchItemsById]
  );

  // Index items that have been loaded.
  React.useEffect(
    () => {
      if (!searchItemsById) {
        // Nothing to index - yet.
        return;
      }

      const startTime = performance.now();
      if (searchApiRef.current) {
        searchApiRef.current.terminate();
        searchApiRef.current = null;
      }

      try {
        const newSearchApi = new SearchApi();
        const allIds = Object.keys(searchItemsById);

        allIds.forEach(id => {
          const searchItem = searchItemsById[id];
          newSearchApi.indexDocument(id, getItemDescription(searchItem));
        });

        const totalTime = performance.now() - startTime;
        console.info(
          `Indexed ${allIds.length} items in ${totalTime.toFixed(3)}ms.`
        );
        searchApiRef.current = newSearchApi;
      } catch (error) {
        console.error('Error while indexing items: ', error);
      }
    },
    [searchItemsById, getItemDescription]
  );

  // Update the search results according to the items, search term
  // chosen category and chosen filters.
  const searchApi = searchApiRef.current;
  React.useEffect(
    () => {
      let discardSearch = false;
      if (!searchText) {
        setSearchResults(
          filterSearchItems(
            chosenCategory ? sortedSearchItems : shuffledSearchItems,
            chosenCategory,
            chosenFilters,
            searchFilters
          )
        );
      } else {
        if (!searchItemsById || !searchApi) {
          console.info(
            'Search for items skipped because items are not ready - will be retried when ready'
          );
          return;
        }

        const startTime = performance.now();
        searchApi
          .search(searchText)
          .then((partialSearchResultIds: Array<string>) => {
            if (discardSearch) {
              console.info(
                'Discarding search results as a new search was launched.'
              );
              return;
            }

            const partialSearchResults = partialSearchResultIds
              .map(id => searchItemsById[id])
              .filter(Boolean);

            const totalTime = performance.now() - startTime;
            console.info(
              `Found ${
                partialSearchResults.length
              } items in ${totalTime.toFixed(3)}ms.`
            );

            setSearchResults(
              filterSearchItems(
                partialSearchResults,
                chosenCategory,
                chosenFilters,
                searchFilters
              )
            );
          });
      }

      return () => {
        // Effect is being destroyed - meaning that a new search was launched.
        // Cancel this one.
        discardSearch = true;
      };
    },
    [
      shuffledSearchItems,
      sortedSearchItems,
      searchItemsById,
      searchText,
      chosenCategory,
      chosenFilters,
      searchFilters,
      searchApi,
    ]
  );

  return searchResults;
};
