// @flow

/**
 * Store the height of events.
 * Needed for EventsTree as we need to tell the react-virtualized List
 * the size of each event - which we only know after the event has been rendered.
 */
type EventHeightEntry = {|
  height: number,
  eventType: string,
|};

export default class EventHeightsCache {
  eventHeightsByPtr: { [key: string]: number } = {};
  eventHeightsByKey: { [key: string]: EventHeightEntry } = {};

  setEventHeight(
    event: gdBaseEvent,
    height: number,
    heightKey?: ?string
  ): boolean {
    const ptrKey = '' + event.ptr;
    const previousHeight = this.eventHeightsByPtr[ptrKey];
    let previousHeightFromKey: ?number = null;
    if (previousHeight === undefined && heightKey) {
      const entry = this.eventHeightsByKey[heightKey];
      if (entry && entry.eventType === event.getType()) {
        previousHeightFromKey = entry.height;
      }
    }
    this.eventHeightsByPtr[ptrKey] = height;

    if (heightKey) {
      this.eventHeightsByKey[heightKey] = {
        height,
        eventType: event.getType(),
      };
    }

    if (previousHeight !== undefined) return previousHeight !== height;
    if (previousHeightFromKey !== null)
      return previousHeightFromKey !== height;
    return true;
  }

  getEventHeight(event: gdBaseEvent, heightKey?: ?string): number {
    const ptrKey = '' + event.ptr;
    const heightFromPtr = this.eventHeightsByPtr[ptrKey];
    if (heightFromPtr !== undefined) return heightFromPtr;

    if (heightKey) {
      const entry = this.eventHeightsByKey[heightKey];
      if (entry && entry.eventType === event.getType()) {
        return entry.height;
      }
    }

    return 0;
  }
}
