// @flow
import {
  type SelectionState,
  getSelectedEvents,
} from './SelectionHandler';
import { serializeToJSObject } from '../Utils/Serializer';
import { excludeEventsChildren } from './ClipboardKind';

// $FlowFixMe[untyped-import]
const { eventsListToClipboardText } = require('./EventsJsonPrettyPrint');

const gd: libGDevelop = global.gd;

/**
 * Serialize the selected events as pretty-printed JSON for the system clipboard.
 *
 * Selection handling matches `copySelectionToClipboard`: child events of a
 * selected parent are not copied twice, and events are ordered by sheet index.
 * Returns null when no events are selected (the action does not copy).
 */
export const copySelectedEventsAsJsonText = (
  selection: SelectionState,
  getIndexes: (Array<gdBaseEvent>) => Array<number>
): ?string => {
  const unorderedEvents = excludeEventsChildren(getSelectedEvents(selection));
  if (!unorderedEvents.length) {
    return null;
  }

  const eventIndexes = getIndexes(unorderedEvents);
  const sortedEvents = unorderedEvents
    .map((event, i) => ({ event, index: eventIndexes[i] }))
    .sort((a, b) => a.index - b.index);

  const eventsList = new gd.EventsList();
  try {
    for (const { event } of sortedEvents) {
      eventsList.insertEvent(event, eventsList.getEventsCount());
    }
    return eventsListToClipboardText(serializeToJSObject(eventsList));
  } finally {
    eventsList.delete();
  }
};
