import AutoComplete from 'material-ui/AutoComplete';

/**
 * A filter that can be used with Material-UI Autocomplete to have a fuzzy
 * filter that still return the items with an empty key.
 * @param {*} searchText
 * @param {*} key
 */
export const fuzzyOrEmptyFilter = (searchText, key) => {
  return !key || AutoComplete.fuzzyFilter(searchText, key);
};
