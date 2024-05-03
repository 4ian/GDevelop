// @flow

export const filterResourcesList = (
  list: Array<gdResource>,
  searchText: string
): Array<gdResource> => {
  if (!searchText) return list;

  const lowercaseSearchText = searchText.toLowerCase();

  return list.filter((resource: gdResource) => {
    return (
      resource
        .getName()
        .toLowerCase()
        .indexOf(lowercaseSearchText) !== -1
    );
  });
};
