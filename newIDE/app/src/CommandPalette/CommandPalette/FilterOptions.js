// @flow
import { fuzzyOrEmptyFilter } from '../../Utils/FuzzyOrEmptyFilter';

/**
 * Filters options both simply and fuzzy-ly,
 * prioritizing simple-matched options
 */
const filterOptions = <T: Object>(
  options: Array<T>,
  state: { getOptionLabel: T => string, inputValue: string }
) => {
  const searchText = state.inputValue.toLowerCase();
  if (searchText === '') return options;

  const directMatches = [];
  const fuzzyMatches = [];
  options.forEach(option => {
    if (option.hit) return directMatches.push(option);
    const optionText = state.getOptionLabel(option).toLowerCase();
    if (optionText.includes(searchText)) return directMatches.push(option);
    if (fuzzyOrEmptyFilter(searchText, optionText))
      return fuzzyMatches.push(option);
  });

  return [...directMatches, ...fuzzyMatches];
};

export default filterOptions;
