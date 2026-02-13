// @flow

const gd: libGDevelop = global.gd;

export type Bookmark = {|
  eventPtr: number,
  name: string,
  eventType: string,
  id: string,
  timestamp: number,
|};

/**
 * Scan all events recursively and collect those that are bookmarked
 */
export const scanEventsForBookmarks = (
  events: gdEventsList
): Array<Bookmark> => {
  const bookmarks: Array<Bookmark> = [];

  const scanEventsList = (eventsList: gdEventsList) => {
    // Safety check: ensure eventsList is valid and has the getEventsCount method
    if (!eventsList || typeof eventsList.getEventsCount !== 'function') {
      return;
    }

    for (let i = 0; i < eventsList.getEventsCount(); i++) {
      const event = eventsList.getEventAt(i);

      // Check if event has a bookmark ID
      const bookmarkId = event.getEventBookmarkId();
      if (bookmarkId && bookmarkId.length > 0) {
        const bookmark: Bookmark = {
          eventPtr: event.ptr,
          name: generateBookmarkName(event),
          eventType: event.getType(),
          id: bookmarkId,
          timestamp: Date.now(), // We don't persist timestamp, so use current time
        };
        bookmarks.push(bookmark);
      }

      // Recursively scan sub-events
      if (event.canHaveSubEvents && event.canHaveSubEvents()) {
        const subEvents = event.getSubEvents();
        scanEventsList(subEvents);
      }
    }
  };

  scanEventsList(events);
  return bookmarks;
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
  for (let i = 0; i < events.getEventsCount(); i++) {
    const event = events.getEventAt(i);
    if (event.ptr === ptr) return event;

    // Recursively search sub-events
    if (event.canHaveSubEvents && event.canHaveSubEvents()) {
      const subEvents = event.getSubEvents();
      const found = findEventByPtr(subEvents, ptr);
      if (found) return found;
    }
  }

  return null;
};
