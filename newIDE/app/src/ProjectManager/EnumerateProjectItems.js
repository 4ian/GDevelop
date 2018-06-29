// @flow
import { mapFor } from '../Utils/MapFor';

export const enumerateLayouts = (project: any) =>
  mapFor(0, project.getLayoutsCount(), i => project.getLayoutAt(i));

export const enumerateExternalEvents = (project: any) =>
  mapFor(0, project.getExternalEventsCount(), i =>
    project.getExternalEventsAt(i)
  );

export const enumerateExternalLayouts = (project: any) =>
  mapFor(0, project.getExternalLayoutsCount(), i =>
    project.getExternalLayoutAt(i)
  );

export const filterProjectItemsList = (
  list: Array<gdLayout> | Array<gdExternalLayout> | Array<gdExternalEvents>,
  searchText: string
) => {
  if (!searchText) return list;

  const lowercaseSearchText = searchText.toLowerCase();

  return list.filter((item: *) => {
    return (
      item
        .getName()
        .toLowerCase()
        .indexOf(lowercaseSearchText) !== -1
    );
  });
};
