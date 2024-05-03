// @flow
import { mapFor } from '../Utils/MapFor';

export const enumerateLayouts = (project: gdProject): Array<gdLayout> =>
  mapFor(0, project.getLayoutsCount(), i => project.getLayoutAt(i));

export const enumerateExternalEvents = (
  project: gdProject
): Array<gdExternalEvents> =>
  mapFor(0, project.getExternalEventsCount(), i =>
    project.getExternalEventsAt(i)
  );

export const enumerateExternalLayouts = (
  project: gdProject
): Array<gdExternalLayout> =>
  mapFor(0, project.getExternalLayoutsCount(), i =>
    project.getExternalLayoutAt(i)
  );

export const enumerateEventsFunctionsExtensions = (
  project: gdProject
): Array<gdEventsFunctionsExtension> =>
  mapFor(0, project.getEventsFunctionsExtensionsCount(), i =>
    project.getEventsFunctionsExtensionAt(i)
  );

export const filterProjectItemsList = <T>(
  list: Array<T>,
  searchText: string
): Array<T> => {
  if (!searchText) return list;

  const lowercaseSearchText = searchText.toLowerCase();

  return list.filter(
    (item: any) =>
      item
        .getName()
        .toLowerCase()
        .indexOf(lowercaseSearchText) !== -1
  );
};
