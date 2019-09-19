// @flow
const fuzzyFilter = (searchText: string, key: string) => {
  const compareString = key.toLowerCase();
  searchText = searchText.toLowerCase();

  let searchTextIndex = 0;
  for (let index = 0; index < key.length; index++) {
    if (compareString[index] === searchText[searchTextIndex]) {
      searchTextIndex += 1;
    }
  }

  return searchTextIndex === searchText.length;
};

/**
 * A fuzzy filter that still return true if the key is empty.
 */
export const fuzzyOrEmptyFilter = (searchText: string, key: string) => {
  return !key || fuzzyFilter(searchText, key);
};
