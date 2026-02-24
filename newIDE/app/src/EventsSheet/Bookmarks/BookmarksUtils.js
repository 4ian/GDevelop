// @flow
import { rgbToHex } from '../../Utils/ColorTransformer';

const gd: libGDevelop = global.gd;

export type Bookmark = {|
  eventPtr: number,
  name: string,
  eventType: string,
  id: string,
  timestamp: number,
  borderLeftColor?: ?string,
|};

/**
 * Scan all events recursively and collect those that are bookmarked
 */
export const scanEventsForBookmarks = (
  events: gdEventsList
): Array<Bookmark> => {
  if (!events) return [];

  const bookmarks: Array<Bookmark> = [];

  const scanEventsList = (eventsList: gdEventsList) => {
    try {
      // Safety check: ensure eventsList is valid and has the getEventsCount method
      if (!eventsList || typeof eventsList.getEventsCount !== 'function') {
        return;
      }

      for (let i = 0; i < eventsList.getEventsCount(); i++) {
        const event = eventsList.getEventAt(i);
        if (!event) continue;

        try {
          // Check if event has a bookmark ID
          const bookmarkId =
            event.getEventBookmarkId && event.getEventBookmarkId();
          if (bookmarkId && bookmarkId.length > 0) {
            const bookmark: Bookmark = {
              eventPtr: event.ptr,
              name: generateBookmarkName(event),
              eventType: event.getType(),
              id: bookmarkId,
              timestamp: Date.now(),
              borderLeftColor: getEventTypeColor(event),
            };
            bookmarks.push(bookmark);
          }

          // Recursively scan sub-events
          if (event.canHaveSubEvents && event.canHaveSubEvents()) {
            const subEvents = event.getSubEvents();
            if (subEvents) {
              scanEventsList(subEvents);
            }
          }
        } catch (err) {
          console.error('Error processing event for bookmarks:', err);
        }
      }
    } catch (err) {
      console.error('Error scanning event list for bookmarks:', err);
    }
  };

  scanEventsList(events);

  return bookmarks;
};

/**
 * Get the border color for a bookmark based on the event type
 */
const getEventTypeColor = (event: gdBaseEvent): ?string => {
  const eventType = event.getType();

  if (eventType === 'BuiltinCommonInstructions::Comment') {
    const commentEvent = gd.asCommentEvent(event);
    return `#${rgbToHex(
      commentEvent.getBackgroundColorRed(),
      commentEvent.getBackgroundColorGreen(),
      commentEvent.getBackgroundColorBlue()
    )}`;
  }

  if (eventType === 'BuiltinCommonInstructions::Group') {
    const groupEvent = gd.asGroupEvent(event);
    return `#${rgbToHex(
      groupEvent.getBackgroundColorR(),
      groupEvent.getBackgroundColorG(),
      groupEvent.getBackgroundColorB()
    )}`;
  }

  return null;
};

/**
 * Generate a default name for a bookmark based on the event
 */
export const generateBookmarkName = (event: gdBaseEvent): string => {
  const eventType = event.getType();

  // For comment events, use the comment text
  if (eventType === 'BuiltinCommonInstructions::Comment') {
    const commentEvent = gd.asCommentEvent(event);
    const comment = commentEvent.getComment();
    if (comment.length > 0) {
      return comment.length > 50 ? comment.substring(0, 50) + '...' : comment;
    }
    return 'Comment';
  }

  // For group events, use the group name
  if (eventType === 'BuiltinCommonInstructions::Group') {
    const groupEvent = gd.asGroupEvent(event);
    const name = groupEvent.getName();
    if (name.length > 0) {
      return name.length > 50 ? name.substring(0, 50) + '...' : name;
    }
    return 'Group';
  }

  // For standard events, try to extract first condition or action text
  if (eventType === 'BuiltinCommonInstructions::Standard') {
    const standardEvent = gd.asStandardEvent(event);

    // Try to get first condition
    const conditions = standardEvent.getConditions();
    if (conditions.size() > 0) {
      const firstCondition = conditions.get(0);
      const type = firstCondition.getType();
      if (type.length > 0) {
        const conditionText = type.replace(/:/g, ' ');
        return conditionText.length > 50
          ? conditionText.substring(0, 50) + '...'
          : conditionText;
      }
    }

    // Try to get first action
    const actions = standardEvent.getActions();
    if (actions.size() > 0) {
      const firstAction = actions.get(0);
      const type = firstAction.getType();
      if (type.length > 0) {
        const actionText = type.replace(/:/g, ' ');
        return actionText.length > 50
          ? actionText.substring(0, 50) + '...'
          : actionText;
      }
    }

    return 'Standard Event';
  }

  // For other event types, use a generic name based on the type
  const readableType = eventType
    .replace('BuiltinCommonInstructions::', '')
    .replace(/([A-Z])/g, ' $1')
    .trim();

  return readableType || 'Event';
};

/**
 * Recursively search for an event by its pointer in an event list
 */
export const findEventByPtr = (
  events: gdEventsList,
  ptr: number
): ?gdBaseEvent => {
  if (!events || !ptr) return null;

  for (let i = 0; i < events.getEventsCount(); i++) {
    const event = events.getEventAt(i);
    if (!event) continue;

    if (event.ptr === ptr) return event;

    // Recursively search sub-events
    if (event.canHaveSubEvents && event.canHaveSubEvents()) {
      const subEvents = event.getSubEvents();
      if (subEvents) {
        const found = findEventByPtr(subEvents, ptr);
        if (found) return found;
      }
    }
  }

  return null;
};

/**
 * Recursively search for an event by its pointer and return it with its parent list and index
 */
export type EventLocation = {|
  event: gdBaseEvent,
  eventsList: gdEventsList,
  indexInList: number,
|};

export const findEventLocationByPtr = (
  events: gdEventsList,
  ptr: number
): ?EventLocation => {
  if (!events || !ptr) return null;

  for (let i = 0; i < events.getEventsCount(); i++) {
    const event = events.getEventAt(i);
    if (!event) continue;

    if (event.ptr === ptr) {
      return { event, eventsList: events, indexInList: i };
    }

    // Recursively search sub-events
    if (event.canHaveSubEvents && event.canHaveSubEvents()) {
      const subEvents = event.getSubEvents();
      if (subEvents) {
        const found = findEventLocationByPtr(subEvents, ptr);
        if (found) return found;
      }
    }
  }

  return null;
};
