// @flow
const filterListWithPrefix = <T>(
  list: Array<T>,
  searchText: string,
  getStringForItem: T => string
): Array<T> => {
  if (!searchText) return list;

  const lowercaseSearchText = searchText.toLowerCase();

  return list.filter((item: T) => {
    return (
      getStringForItem(item)
        .toLowerCase()
        .indexOf(lowercaseSearchText) !== -1
    );
  });
};

export const filterStringListWithPrefix = (
  list: Array<string>,
  searchText: string
): Array<string> => {
  return filterListWithPrefix(list, searchText, item => item);
};
