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
import { normalizeString } from '../../Utils/Search';

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

/**
 * Normalize a value (string or array of strings) the same way the search query
 * is normalized, so accents/diacritics are ignored when matching.
 */
const normalizeSearchableValue = (value: any): any => {
  if (Array.isArray(value)) {
    return value.map(normalizeSearchableValue);
  }
  if (typeof value === 'string') {
    return normalizeString(value);
  }
  return value;
};

/**
 * Custom Fuse.js getter that normalizes the indexed field values so that the
 * search ignores accents/diacritics (e.g. searching "camera" matches "caméra",
 * "scene" matches "scène"). The search query is normalized the same way (see
 * the query builders below), so both sides of the comparison are accent- and
 * case-insensitive.
 * Note: removing diacritics this way preserves character positions for the
 * accented characters commonly used in translations (é, è, à, ç…), so the match
 * indices returned by Fuse.js still align with the original (accented) text used
 * for highlighting.
 */
export const getNormalizedSearchValue = (
  obj: any,
  path: string | Array<string>
): any => {
  const keys = Array.isArray(path) ? path : path.split('.');
  let value = obj;
  for (const key of keys) {
    if (value == null) return undefined;
    value = value[key];
  }
  return normalizeSearchableValue(value);
};

export const sharedFuseConfiguration = {
  minMatchCharLength: 1,
  threshold: 0.35,
  includeMatches: true,
  ignoreLocation: true,
  useExtendedSearch: true,
  findAllMatches: true,
  getFn: getNormalizedSearchValue,
};

/**
 * This helper allows creating the search query for a search within a simple array of strings.
 */
export const getFuseSearchQueryForSimpleArray = (
  searchText: string
): string => {
  // Normalize the query (lowercase + remove accents) so the search is
  // accent-insensitive, matching the normalization applied to indexed values.
  const tokenisedSearchQuery = normalizeString(searchText)
    .trim()
    .split(' ');
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
): { $or: Array<{ $or: Array<any> }> } => {
  // Normalize the query (lowercase + remove accents) so the search is
  // accent-insensitive, matching the normalization applied to indexed values.
  const tokenisedSearchQuery = normalizeString(searchText)
    .trim()
    .split(' ');
  const searchQuery: {
    // $FlowFixMe[value-as-type]
    $or: Fuse.Expression[],
  }[] = tokenisedSearchQuery.map((searchToken: string) => {
    // $FlowFixMe[value-as-type]
    const orFields: Fuse.Expression[] = keys.map(key => ({
      // Use the include-match prefix (') so each token is matched as a
      // case-insensitive substring rather than a fuzzy pattern.
      // This ensures $or filtering is reliable: items that don't contain
      // a token as a substring are excluded, not just scored poorly.
      [key]: `'${searchToken}`,
    }));

    return {
      $or: orFields,
    };
  });

  // Use $or so partial matches are still included (items matching any token
  // are returned), relying on composite scoring to rank full matches first.
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
  // Normalize both sides (lowercase + remove accents) so the comparison is
  // accent-insensitive, consistent with the normalized search query/index.
  const normalizedSearchText = normalizeString(searchText);
  return match.indices
    .map(index => {
      const normalizedMatchedText = normalizeString(
        match.value.slice(index[0], index[1] + 1)
      );
      // if exact match, return indices untouched
      if (normalizedMatchedText === normalizedSearchText) return index;
      const indexOfSearchTextInMatchedText = normalizedMatchedText.indexOf(
        normalizedSearchText
      );

      // if searched text is not in match returned by the fuzzy search
      // ("too" could be matched when searching for "ot"),
      // return nothing
      if (indexOfSearchTextInMatchedText === -1) return undefined;

      // when searched text is included in matched text, changes indices
      // to highlight only the part that matches exactly
      return [
        index[0] + indexOfSearchTextInMatchedText,
        index[0] +
          indexOfSearchTextInMatchedText +
          normalizedSearchText.length -
          1,
      ];
    })
    .filter(Boolean);
};

const getFirstExactMatchPosition = (
  match: SearchMatch,
  lowerCaseSearchText: string
) => {
  // Normalize (lowercase + remove accents) so the comparison is
  // accent-insensitive, consistent with the normalized search query/index.
  const normalizedSearchText = normalizeString(lowerCaseSearchText);
  let closestExactMatchIndex = null;
  let closestExactMatchAtStartOfWordIndex = null;
  for (const index of match.indices) {
    const normalizedMatchedText = normalizeString(
      match.value.slice(index[0], index[1] + 1)
    );
    // Using startsWith here instead of `===` because of this behavior of Fuse.js:
    // Searching `trig` will return the instruction `Trigger once` but the match first index
    // will be on the `Trigg` part of `Trigger once`, and not only on the part `Trig`,
    // because the `g` is repeated.
    const doesMatch = normalizedMatchedText.startsWith(normalizedSearchText);
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

export const nullifySingleCharacterMatches = <T>(
  result: SearchResult<T>
): any => {
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

export const tuneMatches = <T>(
  result: SearchResult<T>,
  searchText: string
): any =>
  // $FlowFixMe[missing-type-arg]
  result.matches.map<SearchMatch>(match => ({
    key: match.key,
    value: match.value,
    indices: tuneMatchIndices(match, searchText),
  }));

export const sortResultsUsingExactMatches = (
  orderedKeys: Array<string>
): (<T>(
  resultA: AugmentedSearchResult<T>,
  resultB: AugmentedSearchResult<T>
) => any) => {
  return <T>(
    resultA: AugmentedSearchResult<T>,
    resultB: AugmentedSearchResult<T>
  ): number => {
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
  excludedTiers: Set<string>,
  isSearchTextEmpty: boolean = false
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
    })
    .filter(({ item }) => {
      //$FlowFixMe[incompatible-type] Only categories are excluded.
      const category: ObjectCategory = item;
      return (isSearchTextEmpty && !chosenItemCategory) || !category.categoryId;
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
          includeScore: true,
          ignoreLocation: true,
          useExtendedSearch: true,
          findAllMatches: true,
          getFn: getNormalizedSearchValue,
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
            excludedTiers,
            true /*isSearchTextEmpty*/
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
        // For multi-word searches, compute a composite score that ranks
        // items matching more tokens above those matching fewer.
        // score = (unmatched token count) + fuseScore, so a full match
        // always beats a partial match regardless of raw Fuse.js score.
        const tokens = normalizeString(searchText)
          .trim()
          .split(' ')
          .filter(t => t.length >= 2);
        const isMultiWordSearch = tokens.length > 1;

        const processedResults = results.map(result => {
          const fuseScore = result.score || 0;
          let compositeScore = fuseScore;
          if (isMultiWordSearch) {
            const matchedTokenCount = tokens.filter(
              token =>
                result.matches &&
                result.matches.some(
                  match =>
                    match.value && normalizeString(match.value).includes(token)
                )
            ).length;
            compositeScore = tokens.length - matchedTokenCount + fuseScore;
          }
          return {
            item: result.item,
            matches: tuneMatches(result, searchText),
            score: compositeScore,
          };
        });

        if (isMultiWordSearch) {
          processedResults.sort((a, b) => (a.score || 0) - (b.score || 0));
        }

        setSearchResults(
          filterSearchResults(
            processedResults,
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
