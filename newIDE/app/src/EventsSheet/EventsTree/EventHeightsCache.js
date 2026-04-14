// @flow

/**
 * The default height estimate for events that haven't been measured yet.
 * Used by the react-window VariableSizeList when positioning rows before
 * their actual height is known. A reasonable estimate (rather than 0)
 * prevents visible overlapping while the real height is being measured.
 */
const DEFAULT_EVENT_HEIGHT = 48;

/**
 * Store the height of events.
 * Needed for EventsTree as we need to tell the react-window VariableSizeList
 * the size of each event - which we only know after the event has been rendered.
 *
 * Also supports notifying listeners when heights change, so that
 * the virtual list can recompute row positions.
 */
export default class EventHeightsCache {
  // $FlowFixMe[missing-local-annot]
  eventHeights = {};
  _onHeightsChangedCallback: ?(() => void) = null;
  _notifyTimeoutId: ?TimeoutID = null;

  /**
   * Register a callback that will be invoked (debounced) whenever
   * a stored event height changes. This allows the virtual list
   * to call resetAfterIndex when heights are updated outside
   * of the normal React render cycle (e.g. from a ResizeObserver).
   */
  setOnHeightsChanged(callback: ?(() => void)) {
    this._onHeightsChangedCallback = callback;
  }

  /**
   * Store the height of an event. Returns true if the height actually changed.
   * When a change is detected and a callback is registered, schedules a
   * debounced notification so the virtual list can recompute positions.
   */
  setEventHeight(event: gdBaseEvent, height: number): boolean {
    const previousHeight = this.eventHeights[event.ptr];
    if (previousHeight === height) return false;

    this.eventHeights[event.ptr] = height;
    this._scheduleNotification();
    return true;
  }

  getEventHeight(event: gdBaseEvent): number {
    return this.eventHeights[event.ptr] || DEFAULT_EVENT_HEIGHT;
  }

  _scheduleNotification() {
    if (!this._onHeightsChangedCallback) return;
    // Debounce notifications so that a batch of height changes
    // (e.g. when many events render at once) results in a single
    // list recomputation rather than one per event.
    if (this._notifyTimeoutId != null) return;
    this._notifyTimeoutId = setTimeout(() => {
      this._notifyTimeoutId = null;
      if (this._onHeightsChangedCallback) {
        this._onHeightsChangedCallback();
      }
    }, 0);
  }
}
