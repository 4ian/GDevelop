//@flow
import { mapVector } from '../Utils/MapFor';

export const enumerateEventsBasedObjects = (
  eventsFunctionsContainer: gdEventsBasedObjectsList
): Array<gdEventsBasedObject> =>
  mapVector(eventsFunctionsContainer, eventsBasedObject => eventsBasedObject);

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
