// @flow

/**
 * Default estimated height (in pixels) for events that haven't been measured yet.
 * Used to provide reasonable initial sizing for the virtualized list,
 * preventing flickering on first render, undo/redo, and resize.
 *
 * A non-zero estimate is critical: if unmeasured events are given a height of 0
 * (or 1), the virtualized list drastically overestimates how many items fit in
 * the viewport, leading to cascading re-renders visible as flicker.
 * With a realistic estimate, the first render is close to correct and the
 * subsequent measurement pass (which happens before paint via useLayoutEffect)
 * adjusts sizes with minimal visual impact.
 */
export const DEFAULT_ESTIMATED_EVENT_HEIGHT = 44;

/**
 * Store the height of events.
 * Needed for EventsTree as we need to tell the react-window VariableSizeList
 * the size of each event - which we only know after the event has been rendered.
 *
 * For events that haven't been measured yet, a default estimated height is
 * returned to prevent flickering.
 */
export default class EventHeightsCache {
  eventHeights: { [key: string]: number } = {};
  _lastContainerWidth: number = 0;

  setEventHeight(event: gdBaseEvent, height: number) {
    this.eventHeights['' + event.ptr] = height;
  }

  /**
   * Get the height of an event. Returns the measured height if available,
   * or a default estimated height if not yet measured.
   */
  getEventHeight(event: gdBaseEvent): number {
    return this.eventHeights['' + event.ptr] || DEFAULT_ESTIMATED_EVENT_HEIGHT;
  }

  /**
   * Notify the cache of the current container width.
   * If the width has changed, all cached heights are invalidated because
   * text wrapping may cause different event heights at different widths.
   */
  setContainerWidth(width: number) {
    if (
      this._lastContainerWidth !== 0 &&
      this._lastContainerWidth !== width &&
      width > 0
    ) {
      this.eventHeights = {};
    }
    if (width > 0) {
      this._lastContainerWidth = width;
    }
  }
}
