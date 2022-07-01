// @flow
import * as React from 'react';
import { type ChosenCategory } from './FiltersChooser';
import shuffle from 'lodash/shuffle';
import Fuse from 'fuse.js';

export type SearchMatch = {| key: string, indices: number[][], value: string |};
export type SearchResult<T> = {| item: T, matches: SearchMatch[] |};

export const sharedFuseConfiguration = {
  minMatchCharLength: 1,
  threshold: 0.35,
  includeMatches: true,
  ignoreLocation: true,
};

const tuneMatchIndices = (match: SearchMatch, searchText: string) => {
  const lowerCaseSearchText = searchText.toLowerCase();
  return match.indices
    .map(index => {
      const lowerCaseMatchedText = match.value
        .slice(index[0], index[1] + 1)
        .toLowerCase();
      // if exact match, return indices untouched
      if (lowerCaseMatchedText === lowerCaseSearchText) return index;
      const indexOfSearchTextInMatchedText = lowerCaseMatchedText.indexOf(
        lowerCaseSearchText
      );

      // if searched text is not in match returned by the fuzzy search
      // ("too" could be matched when searching for "ot"),
      // return nothing
      if (indexOfSearchTextInMatchedText === -1) return undefined;

      // when searched text is included in matched text, changes indices
      // to highlight only the part that matches exactly
      return [
        index[0] + indexOfSearchTextInMatchedText,
        index[0] + indexOfSearchTextInMatchedText + searchText.length - 1,
      ];
    })
    .filter(Boolean);
};

export const tuneMatches = <T>(result: SearchResult<T>, searchText: string) =>
  result.matches.map<SearchMatch>(match => ({
    key: match.key,
    value: match.value,
    indices: tuneMatchIndices(match, searchText),
  }));

/**
 * Filter a list of items according to the chosen category
 * and the chosen filters.
 */
export const filterSearchResults = <SearchItem: { tags: Array<string> }>(
  searchResults: ?Array<{| item: SearchItem, matches: SearchMatch[] |}>,
  chosenCategory: ?ChosenCategory,
  chosenFilters: Set<string>
): ?Array<{| item: SearchItem, matches: SearchMatch[] |}> => {
  if (!searchResults) return null;

  const startTime = performance.now();
  const filteredSearchResults = searchResults
    .filter(({ item: { tags } }) => {
      if (!chosenCategory) return true;

      const hasChosenCategoryTag =
        // If the chosen category is a container of tags, not a real tag, then
        // skip checking if the item has it.
        chosenCategory.node.isTagContainerOnly ||
        tags.some(tag => tag === chosenCategory.node.name);
      if (!hasChosenCategoryTag) return false; // Asset is not in the selected category
      for (const parentNode of chosenCategory.parentNodes) {
        if (parentNode.isTagContainerOnly) {
          // The parent is a container of tags, not a real tag. No need
          // to check if the item has it.
          return true;
        }

        const hasParentCategoryTag = tags.some(tag => tag === parentNode.name);
        if (!hasParentCategoryTag) return false; // Asset is not in the parent(s) of the selected category
      }

      return true;
    })
    .filter(({ item: { tags } }) => {
      return (
        chosenFilters.size === 0 || tags.some(tag => chosenFilters.has(tag))
      );
    });

  const totalTime = performance.now() - startTime;
  console.info(
    `Filtered items by category/filters in ${totalTime.toFixed(3)}ms.`
  );
  return filteredSearchResults;
};

/**
 * Allow to efficiently search and filters items.
 *
 * This instanciates a search API, indexes the specified items,
 * then returns the results of the search (according to the
 * search text and the chosen category/filters).
 */
export const useSearchItem = <SearchItem: { tags: Array<string> }>(
  searchItemsById: ?{ [string]: SearchItem },
  searchText: string,
  chosenCategory: ?ChosenCategory,
  chosenFilters: Set<string>,
  options?: { withoutShuffling?: boolean }
): ?Array<{| item: SearchItem, matches: SearchMatch[] |}> => {
  const searchApiRef = React.useRef<?any>(null);
  const [searchResults, setSearchResults] = React.useState<?Array<{|
    item: SearchItem,
    matches: SearchMatch[],
  |}>>(null);
  const withoutShuffling = options && options.withoutShuffling;

  // Keep in memory a list of all the items, shuffled for
  // easing random discovery of items when no search is done.
  const shuffledSearchResults = React.useMemo(
    () => {
      if (!searchItemsById || !Object.keys(searchItemsById).length) return null;

      const orderedSearchResults = Object.keys(searchItemsById).map(id => ({
        item: searchItemsById[id],
        matches: [],
      }));
      return withoutShuffling
        ? orderedSearchResults
        : shuffle(orderedSearchResults);
    },
    [searchItemsById, withoutShuffling]
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
        searchApiRef.current = null;
      }

      try {
        const newSearchApi = new Fuse(Object.values(searchItemsById), {
          keys: [
            { name: 'name', weight: 2 },
            { name: 'fullName', weight: 5 },
            { name: 'shortDescription', weight: 1 },
          ],
          minMatchCharLength: 2,
          threshold: 0.35,
          includeMatches: true,
          ignoreLocation: true,
        });

        const totalTime = performance.now() - startTime;
        console.info(
          `Indexed ${
            Object.keys(searchItemsById).length
          } items in ${totalTime.toFixed(3)}ms.`
        );
        searchApiRef.current = newSearchApi;
      } catch (error) {
        console.error('Error while indexing items: ', error);
      }
    },
    [searchItemsById]
  );

  // Update the search results according to the items, search term
  // chosen category and chosen filters.
  const searchApi = searchApiRef.current;
  React.useEffect(
    () => {
      let discardSearch = false;
      if (!searchText) {
        setSearchResults(
          filterSearchResults(
            shuffledSearchResults,
            chosenCategory,
            chosenFilters
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
        const results = searchApi.search(`'${searchText}`);
        const totalTime = performance.now() - startTime;
        console.info(
          `Found ${results.length} items in ${totalTime.toFixed(3)}ms.`
        );
        if (discardSearch) {
          console.info(
            'Discarding search results as a new search was launched.'
          );
          return;
        }
        setSearchResults(
          filterSearchResults(
            results.map(result => ({
              item: result.item,
              matches: tuneMatches(result, searchText),
            })),
            chosenCategory,
            chosenFilters
          )
        );
      }

      return () => {
        // Effect is being destroyed - meaning that a new search was launched.
        // Cancel this one.
        discardSearch = true;
      };
    },
    [
      shuffledSearchResults,
      searchItemsById,
      searchText,
      chosenCategory,
      chosenFilters,
      searchApi,
    ]
  );

  return searchResults;
};
