// @flow

import {
  TOUCH_DRAG_START_DELAY,
  canStartDragFromCurrentGesture,
  trackTouchGesturesForDrag,
} from './TouchDragDelay';

// Tests run without a DOM, so use a fake document recording the listeners.
const makeFakeDocument = () => {
  const listeners: { [string]: Array<Function> } = {};
  return {
    addEventListener: (type: string, listener: Function) => {
      listeners[type] = [...(listeners[type] || []), listener];
    },
    removeEventListener: (type: string, listener: Function) => {
      listeners[type] = (listeners[type] || []).filter(
        registeredListener => registeredListener !== listener
      );
    },
    dispatch: (type: string) => {
      (listeners[type] || []).forEach(listener => listener());
    },
  };
};

describe('TouchDragDelay', () => {
  let fakeDocument = makeFakeDocument();
  let stopTracking = () => {};
  let currentTime = 1000;
  const waitFor = (durationInMs: number) => {
    currentTime += durationInMs;
  };

  beforeEach(() => {
    currentTime = 1000;
    jest.spyOn(Date, 'now').mockImplementation(() => currentTime);
    fakeDocument = makeFakeDocument();
    stopTracking = trackTouchGesturesForDrag((fakeDocument: any));
  });

  afterEach(() => {
    // Leave no gesture in progress for the next test.
    fakeDocument.dispatch('touchend');
    stopTracking();
    jest.restoreAllMocks();
  });

  it('allows dragging with a mouse, when no finger is pressing', () => {
    expect(canStartDragFromCurrentGesture()).toBe(true);
  });

  it('refuses to drag while a finger just started pressing', () => {
    fakeDocument.dispatch('touchstart');
    expect(canStartDragFromCurrentGesture()).toBe(false);

    waitFor(TOUCH_DRAG_START_DELAY - 1);
    expect(canStartDragFromCurrentGesture()).toBe(false);
  });

  it('allows dragging once the finger pressed for long enough', () => {
    fakeDocument.dispatch('touchstart');
    waitFor(TOUCH_DRAG_START_DELAY);
    expect(canStartDragFromCurrentGesture()).toBe(true);
  });

  it('allows dragging again with a mouse after the finger is lifted', () => {
    fakeDocument.dispatch('touchstart');
    expect(canStartDragFromCurrentGesture()).toBe(false);

    fakeDocument.dispatch('touchend');
    expect(canStartDragFromCurrentGesture()).toBe(true);
  });

  it('allows dragging again with a mouse after the gesture is cancelled', () => {
    fakeDocument.dispatch('touchstart');
    fakeDocument.dispatch('touchcancel');
    expect(canStartDragFromCurrentGesture()).toBe(true);
  });

  it('stops watching gestures once tracking is stopped', () => {
    stopTracking();
    fakeDocument.dispatch('touchstart');
    expect(canStartDragFromCurrentGesture()).toBe(true);
  });
});
