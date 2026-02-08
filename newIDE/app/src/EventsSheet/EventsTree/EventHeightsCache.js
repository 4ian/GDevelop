// @flow

/**
 * Store the height of events.
 * Needed for EventsTree as we need to tell the react-virtualized List
 * the size of each event - which we only know after the event has been rendered.
 */
const defaultEventHeight = 40;

export default class EventHeightsCache {
  eventHeights: { [key: string]: number } = {};
  defaultHeight: number = defaultEventHeight;
  totalMeasuredHeight: number = 0;
  measuredCount: number = 0;

  setDefaultHeight(height: number) {
    if (height > 0) this.defaultHeight = height;
  }

  setEventHeight(event: gdBaseEvent, height: number): boolean {
    if (height <= 0) return false;
    const key = '' + event.ptr;
    const previousHeight = this.eventHeights[key];
    if (previousHeight === height) return false;

    this.eventHeights[key] = height;
    if (previousHeight == null) {
      this.totalMeasuredHeight += height;
      this.measuredCount += 1;
    } else {
      this.totalMeasuredHeight += height - previousHeight;
    }
    return true;
  }

  getEventHeight(event: gdBaseEvent): number {
    const key = '' + event.ptr;
    const cachedHeight = this.eventHeights[key];
    if (cachedHeight != null) return cachedHeight;
    if (this.measuredCount > 0)
      return Math.round(this.totalMeasuredHeight / this.measuredCount);
    return this.defaultHeight;
  }
}
