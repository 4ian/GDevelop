// @flow

/**
 * Store the height of events.
 * Needed for EventsTree as we need to tell the react-virtualized List
 * the size of each event - which we only know after the event has been rendered.
 */
export default class EventHeightsCache {
  eventHeights: { [number]: number } = {};
  version: number = 0;
  _onHeightsChanged: ?() => void = null;

  setEventHeight(event: gdBaseEvent, height: number) {
    if (this.eventHeights[event.ptr] === height) return;
    this.eventHeights[event.ptr] = height;
    this.version++;
    if (this._onHeightsChanged) {
      this._onHeightsChanged();
    }
  }

  getEventHeight(event: gdBaseEvent): number {
    return this.eventHeights[event.ptr] || 0;
  }

  setOnHeightsChanged(callback: ?() => void) {
    this._onHeightsChanged = callback;
  }
}
