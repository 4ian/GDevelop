//@flow
import { mapFor } from '../Utils/MapFor';

export const enumerateEventsFunctions = (
  eventsFunctionsContainer: gdEventsFunctionsContainer
): Array<gdEventsFunction> =>
  mapFor(0, eventsFunctionsContainer.getEventsFunctionsCount(), (i) =>
    eventsFunctionsContainer.getEventsFunctionAt(i)
  );

export const filterEventFunctionsList = (
  list: Array<gdEventsFunction>,
  searchText: string
): Array<gdEventsFunction> => {
  if (!searchText) return list;

  const lowercaseSearchText = searchText.toLowerCase();

  return list.filter(
    (item: any) =>
      item.getName().toLowerCase().indexOf(lowercaseSearchText) !== -1
  );
};
