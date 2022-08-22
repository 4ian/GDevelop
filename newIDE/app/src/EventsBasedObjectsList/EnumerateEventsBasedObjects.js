//@flow
import { mapVector } from '../Utils/MapFor';

export const enumerateEventsBasedObjects = (
  eventsBasedObjectsList: gdEventsBasedObjectsList
): Array<gdEventsBasedObject> =>
  mapVector(eventsBasedObjectsList, eventsBasedObject => eventsBasedObject);

export const filterEventsBasedObjectsList = (
  list: Array<gdEventsBasedObject>,
  searchText: string
): Array<gdEventsBasedObject> => {
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
