// @flow

type OnHeightChangedCallback = (cb?: () => void) => void;

/**
 * Store the height of events.
 * Needed for EventsTree as we need to tell the react-virtualized List
 * the size of each event - which we only know after the event has been rendered.
 */
export default class EventHeightsCache {
  eventHeights = {};
  updateTimeoutId: ?TimeoutID = null;
  onHeightsChanged: OnHeightChangedCallback;

  constructor(onHeightsChanged: OnHeightChangedCallback) {
    this.onHeightsChanged = onHeightsChanged;
  }

  setEventHeight(event: gdBaseEvent, height: number) {
    this.eventHeights[event.ptr] = height;
  }

  getEventHeight(event: gdBaseEvent): number {
    return this.eventHeights[event.ptr] || 0;
  }
}
