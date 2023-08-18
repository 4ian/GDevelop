// @flow

// Instruction or expression can be private (see IsPrivate, SetPrivate).
// Their visibility will change according to the scope (i.e: if we're
// editing events in a behavior, private instructions of the behavior
// will be visible).
export type EventsScope = {|
  project: gdProject,
  layout?: ?gdLayout,
  externalEvents?: ?gdExternalEvents,
  eventsFunctionsExtension?: gdEventsFunctionsExtension,
  eventsBasedBehavior?: ?gdEventsBasedBehavior,
  eventsBasedObject?: ?gdEventsBasedObject,
  eventsFunction?: gdEventsFunction,
|};
