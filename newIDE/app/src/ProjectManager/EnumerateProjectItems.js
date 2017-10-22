// @flow
import { mapFor } from '../Utils/MapFor';

//TODO: Layout, ExternalEvents and ExternalLayout should be moved to a common type definition file
//for all GDevelop.js
type Layout = {
  getName: Function,
  setName: Function,
};
type ExternalLayout = {
  getName: Function,
  setName: Function,
};
type ExternalEvents = {
  getName: Function,
  setName: Function,
};

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
  list: Array<Layout> | Array<ExternalLayout> | Array<ExternalEvents>,
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
