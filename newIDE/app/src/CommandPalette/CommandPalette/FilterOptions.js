// @flow
import { t } from '@lingui/macro';
import { type I18n as I18nType } from '@lingui/core';
import { fuzzyOrEmptyFilter } from '../../Utils/FuzzyOrEmptyFilter';

/**
 * Words that should be treated as synonyms when searching for commands.
 * For example, "Edit scene variables" and "Open scene variables" should both match.
 * Uses i18n so that synonyms work in all languages.
 */
const getSynonymGroups = (i18n: I18nType): Array<Array<string>> => [
  [i18n._(t`open`), i18n._(t`edit`)],
];

/**
 * Returns an alternate version of the search text with synonyms swapped,
 * or null if no synonym applies.
 */
const getSearchTextWithSynonym = (
  searchText: string,
  i18n: I18nType
): string | null => {
  const synonymGroups = getSynonymGroups(i18n);
  for (const group of synonymGroups) {
    for (let i = 0; i < group.length; i++) {
      const word = group[i];
      if (searchText.startsWith(word + ' ') || searchText === word) {
        // Replace the first occurrence of the synonym with the other synonym.
        for (let j = 0; j < group.length; j++) {
          if (i !== j) {
            return group[j] + searchText.slice(word.length);
          }
        }
      }
    }
  }
  return null;
};

/**
 * Creates a filter function that filters options both simply and fuzzy-ly,
 * prioritizing simple-matched options.
 * Accepts an i18n instance so that synonym groups can be translated.
 */
const makeFilterOptions = (
  i18n: I18nType
): (<T: Object>(
  options: Array<T>,
  state: { getOptionLabel: T => string, inputValue: string }
) => any) => {
  return <T: Object>(
    options: Array<T>,
    state: { getOptionLabel: T => string, inputValue: string }
  ): any => {
    const searchText = state.inputValue.toLowerCase();
    if (searchText === '') return options;

    const synonymSearchText = getSearchTextWithSynonym(searchText, i18n);

    const directMatches = [];
    const fuzzyMatches = [];
    options.forEach(option => {
      if (option.hit) return directMatches.push(option);
      const optionText = state.getOptionLabel(option).toLowerCase();
      if (optionText.includes(searchText)) return directMatches.push(option);
      if (synonymSearchText && optionText.includes(synonymSearchText))
        return directMatches.push(option);
      if (fuzzyOrEmptyFilter(searchText, optionText))
        return fuzzyMatches.push(option);
    });

    return [...directMatches, ...fuzzyMatches];
  };
};

export default makeFilterOptions;
