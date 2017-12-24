// @flow

type WatchedComponent = {
    onHeightsChanged: (Function) => void
};

/**
 * Store the height of events and notify a component whenever
 * heights have changed.
 * Needed for EventsTree as we need to tell it when heights have changed
 * so it can recompute the internal row heights of the react-virtualized List.
 */
export default class EventHeightsCache {
  eventHeights = {};
  updateTimeoutId: ?number = null;
  component: ?WatchedComponent = null;

  constructor(component: WatchedComponent) {
    this.component = component;
  }

  _notifyComponent() {
    if (this.updateTimeoutId) {
      return; // An update is already scheduled.
    }

    // Notify the component, on the next tick, that heights have changed
    this.updateTimeoutId = setTimeout(() => {
      if (this.component) {
        this.component.onHeightsChanged(() => (this.updateTimeoutId = null));
      } else {
        this.updateTimeoutId = null;
      }
    }, 0);
  }

  setEventHeight(event: gdBaseEvent, height: number) {
    const cachedHeight = this.eventHeights[event.ptr];
    if (!cachedHeight || cachedHeight !== height) {
      // console.log(event.ptr, 'has a new height', height, 'old:', cachedHeight);
      this._notifyComponent();
    }

    this.eventHeights[event.ptr] = height;
  }

  getEventHeight(event: gdBaseEvent): number {
    return this.eventHeights[event.ptr] || 60;
  }
}
