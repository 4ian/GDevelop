// @flow

export const initializeEventsFunctionDisplayName = (
  eventsFunction: gdEventsFunction,
  fallbackName: string
): void => {
  if (!eventsFunction.getFullName()) {
    eventsFunction.setFullName(fallbackName);
  }
};
