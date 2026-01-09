// @flow
import * as React from 'react';
import { type ChosenCategory } from './FiltersChooser';
import {
  type ExtensionShortHeader,
  type BehaviorShortHeader,
  type ObjectShortHeader,
} from '../../Utils/GDevelopServices/Extension';
import { type PrivateGameTemplateListingData } from '../../Utils/GDevelopServices/Shop';
import { type ExampleShortHeader } from '../../Utils/GDevelopServices/Example';
import shuffle from 'lodash/shuffle';
import Fuse from 'fuse.js';
import { type ObjectCategory } from '../../AssetStore/ObjectStoreContext';

type SearchableItem =
  | ExtensionShortHeader
  | ExampleShortHeader
  | BehaviorShortHeader
  | ObjectShortHeader
  | ObjectCategory
  | PrivateGameTemplateListingData;

export type SearchMatch = {|
  key: string,
  indices: number[][],
  value: string,
|};
export type AugmentedSearchMatch = {|
  ...SearchMatch,
  closestExactMatchAtStartOfWordIndex: number | null,
  closestExactMatchIndex: number | null,
|};
export type SearchResult<T> = {|
  item: T,
  matches: SearchMatch[],
  score?: number,
|};
export type AugmentedSearchResult<T> = {|
  ...SearchResult<T>,
  matches: AugmentedSearchMatch[],
|};

type SearchOptions = {|
  searchText: string,
  chosenItemCategory?: string,
  chosenCategory: ?ChosenCategory,
  chosenFilters: Set<string>,
  excludedTiers: Set<string>,
  defaultFirstSearchItemIds: Array<string>,
  shuffleResults?: boolean,
|};

export const sharedFuseConfiguration = {
  minMatchCharLength: 1,
  threshold: 0.35,
  includeMatches: true,
  ignoreLocation: true,
  useExtendedSearch: true,
  findAllMatches: true,
};

/**
 * This helper allows creating the search query for a search within a simple array of strings.
 */
export const getFuseSearchQueryForSimpleArray = (searchText: string) => {
  const tokenisedSearchQuery = searchText.trim().split(' ');
  return `'${tokenisedSearchQuery.join(" '")}`;
};

/**
 * This helper allows creating the search query for searching within an array of
 * objects with multiple keys.
 * If we don't use this, the search will only be done on one of the keys.
 * See https://github.com/krisk/Fuse/issues/235#issuecomment-850269634
 */
export const getFuseSearchQueryForMultipleKeys = (
  searchText: string,
  keys: Array<string>
) => {
  const tokenisedSearchQuery = searchText.trim().split(' ');
  const searchQuery: {
    $or: Fuse.Expression[],
  }[] = tokenisedSearchQuery.map((searchToken: string) => {
    const orFields: Fuse.Expression[] = keys.map(key => ({
      [key]: searchToken,
    }));

    return {
      $or: orFields,
    };
  });

  return {
    $or: searchQuery,
  };
};

/**
 * Method that optimizes the match object returned by Fuse.js in the case
 * the indices are used to display the matches.
 * It gets rid of the indices that do not match the search text exactly.
 */
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

const getFirstExactMatchPosition = (
  match: SearchMatch,
  lowerCaseSearchText: string
) => {
  let closestExactMatchIndex = null;
  let closestExactMatchAtStartOfWordIndex = null;
  for (const index of match.indices) {
    const lowerCaseMatchedText = match.value
      .slice(index[0], index[1] + 1)
      .toLowerCase();
    // Using startsWith here instead of `===` because of this behavior of Fuse.js:
    // Searching `trig` will return the instruction `Trigger once` but the match first index
    // will be on the `Trigg` part of `Trigger once`, and not only on the part `Trig`,
    // because the `g` is repeated.
    const doesMatch = lowerCaseMatchedText.startsWith(lowerCaseSearchText);
    if (!doesMatch) continue;
    if (closestExactMatchIndex === null) {
      closestExactMatchIndex = index[0];
    }
    if (closestExactMatchAtStartOfWordIndex === null) {
      const characterBeforeMatch =
        index[0] === 0 ? ' ' : match.value[index[0] - 1];
      if (characterBeforeMatch.match(/[\s\-_/]/)) {
        closestExactMatchAtStartOfWordIndex = index[0];
        break;
      }
    }
  }
  return {
    closestExactMatchIndex,
    closestExactMatchAtStartOfWordIndex,
  };
};

export const nullifySingleCharacterMatches = <T>(result: SearchResult<T>) => {
  const matchesWithAtLeastOneSignificantIndex = result.matches
    .map(match => {
      const newIndices = match.indices
        .map(index => (index[1] - index[0] > 0 ? index : null))
        .filter(Boolean);
      if (newIndices.length > 0) {
        return { ...match, indices: newIndices };
      }
      return null;
    })
    .filter(Boolean);
  if (matchesWithAtLeastOneSignificantIndex.length > 0) {
    return { ...result, matches: matchesWithAtLeastOneSignificantIndex };
  }
  return null;
};

export const augmentSearchResult = <T>(
  result: SearchResult<T>,
  lowerCaseSearchText: string
): AugmentedSearchResult<T> => {
  return {
    item: result.item,
    score: result.score,
    matches: result.matches.map(match => ({
      ...match,
      ...getFirstExactMatchPosition(match, lowerCaseSearchText),
    })),
  };
};

export const tuneMatches = <T>(result: SearchResult<T>, searchText: string) =>
  result.matches.map<SearchMatch>(match => ({
    key: match.key,
    value: match.value,
    indices: tuneMatchIndices(match, searchText),
  }));

export const sortResultsUsingExactMatches = (orderedKeys: string[]) => {
  return <T>(
    resultA: AugmentedSearchResult<T>,
    resultB: AugmentedSearchResult<T>
  ) => {
    // First give priority to result that have an exact match at start of word and not the other.
    const resultAExactMatchesAtStartOfWordCount = resultA.matches.filter(
      match => match.closestExactMatchAtStartOfWordIndex !== null
    ).length;
    const resultBExactMatchesAtStartOfWordCount = resultB.matches.filter(
      match => match.closestExactMatchAtStartOfWordIndex !== null
    ).length;
    if (
      resultAExactMatchesAtStartOfWordCount > 0 &&
      resultBExactMatchesAtStartOfWordCount === 0
    ) {
      return -1;
    }
    if (
      resultAExactMatchesAtStartOfWordCount === 0 &&
      resultBExactMatchesAtStartOfWordCount > 0
    ) {
      return 1;
    }
    // Then give priority to result that have an exact match and not the other.
    const resultAExactMatchesCount = resultA.matches.filter(
      match => match.closestExactMatchIndex !== null
    ).length;
    const resultBExactMatchesCount = resultB.matches.filter(
      match => match.closestExactMatchIndex !== null
    ).length;
    if (resultAExactMatchesCount > 0 && resultBExactMatchesCount === 0) {
      return -1;
    }
    if (resultAExactMatchesCount === 0 && resultBExactMatchesCount > 0) {
      return 1;
    }
    // If results have the same number of exact matches, both at start of word
    // and in the whole text, use ordered keys and find matches in them.
    for (const key of orderedKeys) {
      const matchA = resultA.matches.find(match => match.key === key);
      const matchB = resultB.matches.find(match => match.key === key);
      // If a result has an exact math at the start of the word in the key but
      // the other doesn't even has a match in the key, give priority.
      if (
        matchA &&
        matchA.closestExactMatchAtStartOfWordIndex !== null &&
        !matchB
      ) {
        return -1;
      }
      if (
        !matchA &&
        matchB &&
        matchB.closestExactMatchAtStartOfWordIndex !== null
      ) {
        return 1;
      }
      // If both result have exact matches in the key, give priority to the one where
      // the match is closer to the start of the sentence.
      if (matchA && matchB) {
        if (
          matchA.closestExactMatchAtStartOfWordIndex !== null &&
          matchB.closestExactMatchAtStartOfWordIndex !== null
        ) {
          return (
            matchA.closestExactMatchAtStartOfWordIndex -
            matchB.closestExactMatchAtStartOfWordIndex
          );
        }
        if (
          matchA.closestExactMatchAtStartOfWordIndex !== null &&
          matchB.closestExactMatchAtStartOfWordIndex === null
        ) {
          return -1;
        }
        if (
          matchA.closestExactMatchAtStartOfWordIndex === null &&
          matchB.closestExactMatchAtStartOfWordIndex !== null
        ) {
          return 1;
        }
        if (
          matchA.closestExactMatchIndex !== null &&
          matchB.closestExactMatchIndex !== null
        ) {
          return matchA.closestExactMatchIndex - matchB.closestExactMatchIndex;
        }
        if (
          matchA.closestExactMatchIndex !== null &&
          matchB.closestExactMatchIndex === null
        ) {
          return -1;
        }
        if (
          matchA.closestExactMatchIndex === null &&
          matchB.closestExactMatchIndex !== null
        ) {
          return 1;
        }
      }
    }
    // At that point, neither result have an exact match anywhere.
    if (resultA.score !== undefined && resultB.score !== undefined) {
      return resultA.score - resultB.score;
    }
    return -(resultA.matches.length - resultB.matches.length);
  };
};

/**
 * Filter a list of items according to the chosen category
 * and the chosen filters.
 */
export const filterSearchResults = <SearchItem: SearchableItem>(
  searchResults: ?Array<SearchResult<SearchItem>>,
  chosenItemCategory: ?string,
  chosenCategory: ?ChosenCategory,
  chosenFilters: Set<string>,
  excludedTiers: Set<string>
): ?Array<SearchResult<SearchItem>> => {
  if (!searchResults) return null;

  const startTime = performance.now();
  const filteredSearchResults = searchResults
    .filter(({ item }) => {
      if (!chosenItemCategory) return true; // No category chosen, return all items.
      if (!item.category) return false; // Item has no category, it cannot be in the chosen category.
      return item.category === chosenItemCategory;
    })
    .filter(({ item }) => {
      if (!chosenCategory) return true;

      const hasChosenCategoryTag =
        // If the chosen category is a container of tags, not a real tag, then
        // skip checking if the item has it.
        chosenCategory.node.isTagContainerOnly ||
        (item.tags && item.tags.some(tag => tag === chosenCategory.node.name));
      if (!hasChosenCategoryTag) return false; // Item is not in the selected category
      for (const parentNode of chosenCategory.parentNodes) {
        if (parentNode.isTagContainerOnly) {
          // The parent is a container of tags, not a real tag. No need
          // to check if the item has it.
          return true;
        }

        const hasParentCategoryTag =
          item.tags && item.tags.some(tag => tag === parentNode.name);
        if (!hasParentCategoryTag) return false; // Item is not in the parent(s) of the selected category
      }

      return true;
    })
    .filter(({ item }) => {
      const passTier =
        item.isInstalled || !item.tier || !excludedTiers.has(item.tier);
      // When checking the chosen filters, we ignore the case.
      // Particularly useful when multiple items are being searched but are not
      // in the same repository, so the tags/categories are not always the same case.
      const lowerCaseChosenFilters = new Set(
        [...chosenFilters].map(filter => filter.toLowerCase())
      );
      const passChosenFilters =
        lowerCaseChosenFilters.size === 0 ||
        (item.tags &&
          item.tags.some(tag =>
            lowerCaseChosenFilters.has(tag.toLowerCase())
          )) ||
        (item.categories &&
          Array.isArray(item.categories) &&
          item.categories.some(
            category =>
              typeof category === 'string' &&
              lowerCaseChosenFilters.has(category.toLowerCase())
          ));

      return passTier && passChosenFilters;
    });

  const totalTime = performance.now() - startTime;
  console.info(
    `Filtered items by category/filters/tier in ${totalTime.toFixed(3)}ms.`
  );
  return filteredSearchResults;
};

/**
 * Allow to efficiently search and filters items.
 *
 * This instantiates a search API, indexes the specified items,
 * then returns the results of the search (according to the
 * search text and the chosen category/filters).
 */
export const useSearchStructuredItem = <SearchItem: SearchableItem>(
  searchItemsById: ?{ [string]: SearchItem },
  {
    searchText,
    chosenItemCategory,
    chosenCategory,
    chosenFilters,
    excludedTiers,
    defaultFirstSearchItemIds,
    shuffleResults = true,
  }: SearchOptions
): ?Array<SearchResult<SearchItem>> => {
  const searchApiRef = React.useRef<?any>(null);
  const [searchResults, setSearchResults] = React.useState<?Array<
    SearchResult<SearchItem>
  >>(null);
  // Keep in memory a list of all the items, shuffled for
  // easing random discovery of items when no search is done.
  const orderedSearchResults: Array<
    SearchResult<SearchItem>
  > | null = React.useMemo(
    () => {
      if (!searchItemsById || !Object.keys(searchItemsById).length) return null;

      const alreadyOrderedIds = new Set<string>(defaultFirstSearchItemIds);
      const nonOrderedIds = Object.keys(searchItemsById).filter(
        id => !alreadyOrderedIds.has(id)
      );

      // Return the ordered results first, and shuffle the rest.
      return [
        ...defaultFirstSearchItemIds,
        ...(shuffleResults ? shuffle(nonOrderedIds) : nonOrderedIds),
      ].map(id => ({
        item: searchItemsById[id],
        matches: [],
      }));
    },
    [searchItemsById, defaultFirstSearchItemIds, shuffleResults]
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
            { name: 'tags', weight: 4 },
          ],
          minMatchCharLength: 2,
          threshold: 0.35,
          includeMatches: true,
          ignoreLocation: true,
          useExtendedSearch: true,
          findAllMatches: true,
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
            orderedSearchResults,
            chosenItemCategory,
            chosenCategory,
            chosenFilters,
            excludedTiers
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
        const results = searchApi.search(
          getFuseSearchQueryForMultipleKeys(searchText, [
            'name',
            'fullName',
            'shortDescription',
            'tags',
          ])
        );
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
            chosenItemCategory,
            chosenCategory,
            chosenFilters,
            excludedTiers
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
      orderedSearchResults,
      searchItemsById,
      searchText,
      chosenItemCategory,
      chosenCategory,
      chosenFilters,
      searchApi,
      excludedTiers,
    ]
  );

  return searchResults;
};
