//@flow
import { mapVector } from '../Utils/MapFor';

export const enumerateEventsBasedBehaviors = (
  eventsFunctionsContainer: gdEventsBasedBehaviorsList
): Array<gdEventsBasedBehavior> =>
  mapVector(
    eventsFunctionsContainer,
    (eventsBasedBehavior) => eventsBasedBehavior
  );

export const filterEventsBasedBehaviorsList = (
  list: Array<gdEventsBasedBehavior>,
  searchText: string
): Array<gdEventsBasedBehavior> => {
  if (!searchText) return list;

  const lowercaseSearchText = searchText.toLowerCase();

  return list.filter(
    (item: any) =>
      item.getName().toLowerCase().indexOf(lowercaseSearchText) !== -1
  );
};
