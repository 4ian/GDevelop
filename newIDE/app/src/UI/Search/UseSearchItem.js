// @flow
import * as React from 'react';
import { type ChosenCategory } from './FiltersChooser';
import shuffle from 'lodash/shuffle';
import SearchApi from 'js-worker-search';
import {
  type AssetShortHeader,
  type PublicAssetPack,
  type ResourceV2,
  type Resource,
} from '../../Utils/GDevelopServices/Asset';
import {
  type PrivateAssetPackListingData,
  type PrivateGameTemplateListingData,
  type BundleListingData,
} from '../../Utils/GDevelopServices/Shop';

type SearchableItem =
  | AssetShortHeader
  | PublicAssetPack
  | ResourceV2
  | Resource
  | PrivateAssetPackListingData
  | PrivateGameTemplateListingData
  | BundleListingData;

export interface SearchFilter<SearchItem> {
  getPertinence(searchItem: SearchItem): number;
  hasFilters(): boolean;
}

export class TagSearchFilter<SearchItem: AssetShortHeader | ResourceV2>
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

const escapeRegExp = (text: string): string =>
  text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Compute how relevant an item's searchable text is for the given search words.
 *
 * A whole-word match ("car" in "a car") ranks higher than a prefix match
 * ("car" in "cartoon"), which itself ranks higher than a match found somewhere
 * else inside a word ("car" in "scar"). This lets us prioritize complete word
 * matches over the partial matches that the substring-based search engine also
 * returns.
 *
 * The result is always strictly positive so an item that the search engine
 * matched is never excluded from the results.
 */
export const getTextSearchRelevance = (
  itemText: string,
  searchWords: Array<string>
): number => {
  if (searchWords.length === 0) return 1;

  const lowerCasedItemText = itemText.toLowerCase();
  let totalScore = 0;
  for (const searchWord of searchWords) {
    const escapedWord = escapeRegExp(searchWord);
    if (new RegExp(`\\b${escapedWord}\\b`).test(lowerCasedItemText)) {
      // Whole-word match ("car" in "a car"): the search term is a complete word.
      totalScore += 1;
    } else if (new RegExp(`\\b${escapedWord}`).test(lowerCasedItemText)) {
      // Prefix match: the search term is only the start of a longer word
      // ("car" in "card", "cartoon"). Heavily penalized so these incomplete
      // word matches rank well below complete word matches.
      totalScore += 0.2;
    } else if (lowerCasedItemText.includes(searchWord)) {
      // Match somewhere inside a word ("car" in "scar"). Penalized even more.
      totalScore += 0.1;
    }
  }

  // Keep the relevance strictly positive so a matched item is never filtered
  // out, while still being lower than any real match.
  return Math.max(totalScore / searchWords.length, 0.05);
};

/**
 * Filter a list of items according to the chosen category
 * and the chosen filters.
 */
export const filterSearchItems = <SearchItem: SearchableItem>(
  searchItems: ?Array<SearchItem>,
  chosenCategory: ?ChosenCategory,
  chosenFilters: ?Set<string>,
  searchFilters?: Array<SearchFilter<SearchItem>>,
  getSearchItemRelevance?: (searchItem: SearchItem) => number
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
          // $FlowIgnore - Flow seems unable to consider `categories` type.
          // $FlowFixMe[incompatible-use]
          searchItem.categories.some(category => chosenFilters.has(category)))
      );
    });

  let sortedSearchItems = filteredSearchItems;
  if (searchFilters || getSearchItemRelevance) {
    let pertinenceMin = 1;
    let pertinenceMax = 0;
    const weightedSearchItems = filteredSearchItems
      .map(searchItem => {
        // Seed the pertinence with the text search relevance so that whole-word
        // matches are ranked above partial matches, then let the filters refine it.
        let pertinence = getSearchItemRelevance
          ? getSearchItemRelevance(searchItem)
          : 1;
        if (searchFilters) {
          for (const searchFilter of searchFilters) {
            pertinence *= searchFilter.getPertinence(searchItem);
            if (pertinence === 0) {
              return null;
            }
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

            // Prioritize whole-word matches (e.g. "car") over partial matches
            // (e.g. "card", "cartoon") returned by the substring search engine.
            const searchWords = searchText
              .toLowerCase()
              .split(/\s+/)
              .filter(Boolean);
            const getSearchItemRelevance = (searchItem: SearchItem) => {
              let textRelevance = getTextSearchRelevance(
                getItemDescription(searchItem),
                searchWords
              );

              // When an item has many tags but only a few match the search, the
              // match is diluted: it is likely less focused on what the user is
              // looking for (e.g. an aerosol tagged "car" among 30 other tags).
              // Reduce its score sharply, proportionally to the share of
              // matching tags, so a heavily diluted match sinks below cleaner
              // partial matches, while an item whose tags mostly match keeps a
              // near-full score. A small floor keeps the item in the results.
              // $FlowFixMe[prop-missing] - only AssetShortHeader/ResourceV2 have tags.
              const tags: ?Array<string> = searchItem.tags;
              if (tags && tags.length > 0) {
                const matchingTagsCount = tags.filter(tag =>
                  getTextSearchRelevance(tag, searchWords) >= 0.5
                ).length;
                const matchingTagsRatio = matchingTagsCount / tags.length;
                textRelevance *= 0.15 + 0.85 * matchingTagsRatio;
              }

              // Boost items whose name itself contains the searched word: a
              // match in the name is a much stronger signal of relevance than a
              // match found only among the tags. The bonus is proportional to
              // how well the name matches (whole-word matches count for more
              // than partial ones, see getTextSearchRelevance).
              // $FlowFixMe[prop-missing] - most searchable items have a name.
              const name: ?string = searchItem.name;
              if (name) {
                const nameRelevanceBonus = 0.5;
                textRelevance +=
                  nameRelevanceBonus *
                  getTextSearchRelevance(name, searchWords);
              }

              // Boost items that have a tag matching the search exactly (e.g.
              // searching "car" on an asset tagged "car"). An exact tag match is
              // a strong signal, so it is ranked just after a match found in the
              // asset's name: the bonus is deliberately kept below the name bonus
              // above so a name match still ranks first.
              if (tags && tags.length > 0) {
                const normalizedSearchText = searchText.trim().toLowerCase();
                const hasExactTagMatch = tags.some(
                  tag => tag.trim().toLowerCase() === normalizedSearchText
                );
                if (hasExactTagMatch) {
                  const exactTagRelevanceBonus = 0.35;
                  textRelevance += exactTagRelevanceBonus;
                }
              }

              // For word searches, prefer 3D assets over 2D ones: they get a
              // relevance bonus so that, at comparable text relevance, a 3D
              // asset ranks above a 2D one. The bonus is deliberately moderate
              // (not a strict "all 3D before all 2D" offset) so that a 2D asset
              // with a clearly better score still ranks above a weakly matching
              // 3D asset (e.g. one matching only through one of its many tags).
              // Non-asset items (e.g. packs) have no objectType, so they are
              // unaffected.
              const threeDRelevanceBonus = 0.25;
              const is3DAsset =
                // $FlowFixMe[prop-missing] - only AssetShortHeader has objectType.
                searchItem.objectType === 'Scene3D::Model3DObject';
              return is3DAsset ? textRelevance + threeDRelevanceBonus : textRelevance;
            };

            setSearchResults(
              filterSearchItems(
                partialSearchResults,
                chosenCategory,
                chosenFilters,
                searchFilters,
                getSearchItemRelevance
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
    // Update the search results according to the items, search term
    // chosen category and chosen filters.
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
