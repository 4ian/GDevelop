/**
 * @jest-environment jsdom
 */
// @flow

import {
  TOUCH_DRAG_START_ATTRIBUTE,
  TOUCH_DRAG_START_DELAY,
  TOUCH_HOLD_TOLERANCE,
  canStartDragFromCurrentGesture,
  getCurrentDragSlop,
  isCurrentGestureScroll,
  trackTouchGesturesForDrag,
} from './TouchDragDelay';

describe('TouchDragDelay', () => {
  let stopTracking = () => {};
  let currentTime = 1000;
  let list: HTMLElement;
  let heldItem: HTMLElement;
  let handle: HTMLElement;
  let otherItem: HTMLElement;
  let otherElement: HTMLElement;

  const waitFor = (durationInMs: number) => {
    currentTime += durationInMs;
  };
  // Returns the event, whose `defaultPrevented` tells if the browser was
  // allowed to scroll.
  const dispatchTouch = (
    target: HTMLElement,
    type: string,
    position: {| x: number, y: number |} = { x: 10, y: 10 }
  ): TouchEvent => {
    const touch = {
      identifier: 1,
      target,
      clientX: position.x,
      clientY: position.y,
    };
    const isEnd = type === 'touchend' || type === 'touchcancel';
    const event = new TouchEvent(type, {
      bubbles: true,
      cancelable: true,
      // $FlowFixMe[incompatible-call] - jsdom accepts plain objects.
      touches: isEnd ? [] : [touch],
      // $FlowFixMe[incompatible-call]
      targetTouches: isEnd ? [] : [touch],
      // $FlowFixMe[incompatible-call]
      changedTouches: [touch],
    });
    target.dispatchEvent(event);
    return event;
  };
  const dispatchScroll = (target: HTMLElement) => {
    target.dispatchEvent(new Event('scroll'));
  };
  const mouseSlop = 10;

  beforeEach(() => {
    currentTime = 1000;
    jest.spyOn(Date, 'now').mockImplementation(() => currentTime);
    const body = document.body;
    if (!body) throw new Error('No document body.');
    list = document.createElement('div');
    heldItem = document.createElement('div');
    heldItem.setAttribute(TOUCH_DRAG_START_ATTRIBUTE, 'afterHold');
    handle = document.createElement('div');
    handle.setAttribute(TOUCH_DRAG_START_ATTRIBUTE, 'immediate');
    otherItem = document.createElement('div');
    otherElement = document.createElement('div');
    list.appendChild(heldItem);
    list.appendChild(handle);
    list.appendChild(otherItem);
    body.appendChild(list);
    body.appendChild(otherElement);
    stopTracking = trackTouchGesturesForDrag(document);
  });

  afterEach(() => {
    // Leave no gesture in progress for the next test.
    dispatchTouch(heldItem, 'touchend');
    stopTracking();
    list.remove();
    otherElement.remove();
    jest.restoreAllMocks();
  });

  it('allows dragging with a mouse, when no finger is pressing', () => {
    expect(canStartDragFromCurrentGesture()).toBe(true);
    expect(getCurrentDragSlop()).toBe(mouseSlop);
  });

  it('refuses to drag while a finger just started pressing', () => {
    dispatchTouch(heldItem, 'touchstart');
    expect(canStartDragFromCurrentGesture()).toBe(false);

    waitFor(TOUCH_DRAG_START_DELAY - 1);
    expect(canStartDragFromCurrentGesture()).toBe(false);
  });

  it('allows dragging once the finger pressed for long enough', () => {
    dispatchTouch(heldItem, 'touchstart');
    waitFor(TOUCH_DRAG_START_DELAY);
    expect(canStartDragFromCurrentGesture()).toBe(true);
  });

  it('allows dragging again with a mouse after the finger is lifted', () => {
    dispatchTouch(heldItem, 'touchstart');
    expect(canStartDragFromCurrentGesture()).toBe(false);

    dispatchTouch(heldItem, 'touchend');
    expect(canStartDragFromCurrentGesture()).toBe(true);
  });

  it('allows dragging again with a mouse after the gesture is cancelled', () => {
    dispatchTouch(heldItem, 'touchstart');
    dispatchTouch(heldItem, 'touchcancel');
    expect(canStartDragFromCurrentGesture()).toBe(true);
  });

  it('tolerates a larger drift while the finger holds an item to drag', () => {
    dispatchTouch(heldItem, 'touchstart');
    expect(getCurrentDragSlop()).toBe(TOUCH_HOLD_TOLERANCE);

    waitFor(TOUCH_DRAG_START_DELAY);
    expect(getCurrentDragSlop()).toBe(mouseSlop);

    dispatchTouch(heldItem, 'touchend');
    expect(getCurrentDragSlop()).toBe(mouseSlop);
  });

  it('does not tolerate a drift on a handle or outside of a drag source', () => {
    dispatchTouch(handle, 'touchstart');
    expect(getCurrentDragSlop()).toBe(mouseSlop);
    dispatchTouch(handle, 'touchend');

    dispatchTouch(otherItem, 'touchstart');
    expect(getCurrentDragSlop()).toBe(mouseSlop);
  });

  it('lets the browser scroll while an item is held, and not once it can be dragged', () => {
    dispatchTouch(heldItem, 'touchstart');
    expect(
      dispatchTouch(heldItem, 'touchmove', { x: 15, y: 10 }).defaultPrevented
    ).toBe(false);

    waitFor(TOUCH_DRAG_START_DELAY);
    // Even a tiny move: on iOS, a scroll started by a move not prevented in
    // time can't be stopped for the rest of the gesture.
    expect(
      dispatchTouch(heldItem, 'touchmove', { x: 16, y: 10 }).defaultPrevented
    ).toBe(true);
  });

  it('never lets the browser scroll from a handle', () => {
    dispatchTouch(handle, 'touchstart');
    expect(
      dispatchTouch(handle, 'touchmove', { x: 12, y: 10 }).defaultPrevented
    ).toBe(true);
  });

  it('lets the browser scroll from an element that is not a drag source', () => {
    dispatchTouch(otherItem, 'touchstart');
    waitFor(TOUCH_DRAG_START_DELAY);
    expect(
      dispatchTouch(otherItem, 'touchmove', { x: 12, y: 10 }).defaultPrevented
    ).toBe(false);
  });

  it('treats a move past the hold tolerance as a scroll, and keeps letting the browser scroll', () => {
    dispatchTouch(heldItem, 'touchstart');
    dispatchTouch(heldItem, 'touchmove', {
      x: 10 + TOUCH_HOLD_TOLERANCE + 5,
      y: 10,
    });
    expect(isCurrentGestureScroll()).toBe(true);

    waitFor(TOUCH_DRAG_START_DELAY);
    expect(canStartDragFromCurrentGesture()).toBe(false);
    expect(
      dispatchTouch(heldItem, 'touchmove', { x: 60, y: 10 }).defaultPrevented
    ).toBe(false);
  });

  it('refuses to drag once the finger scrolled the content under it', () => {
    dispatchTouch(heldItem, 'touchstart');
    dispatchTouch(heldItem, 'touchmove');
    dispatchScroll(list);
    expect(isCurrentGestureScroll()).toBe(true);

    waitFor(TOUCH_DRAG_START_DELAY);
    expect(canStartDragFromCurrentGesture()).toBe(false);

    // The next gesture starts from scratch.
    dispatchTouch(heldItem, 'touchend');
    dispatchTouch(heldItem, 'touchstart');
    waitFor(TOUCH_DRAG_START_DELAY);
    expect(canStartDragFromCurrentGesture()).toBe(true);
  });

  it('ignores scrolls that are not made by the finger', () => {
    dispatchTouch(heldItem, 'touchstart');
    // Before the finger moved: a programmatic scroll.
    dispatchScroll(list);
    expect(isCurrentGestureScroll()).toBe(false);

    // Of an element that is not under the finger.
    dispatchTouch(heldItem, 'touchmove');
    dispatchScroll(otherElement);
    dispatchScroll(otherItem);
    expect(isCurrentGestureScroll()).toBe(false);

    waitFor(TOUCH_DRAG_START_DELAY);
    expect(canStartDragFromCurrentGesture()).toBe(true);
  });

  it("swallows the browser's contextmenu event while a finger is down", () => {
    const dispatchContextMenu = (target: HTMLElement) => {
      const event = new MouseEvent('contextmenu', {
        bubbles: true,
        cancelable: true,
      });
      const reachedTarget: () => void = jest.fn();
      target.addEventListener('contextmenu', reachedTarget);
      target.dispatchEvent(event);
      target.removeEventListener('contextmenu', reachedTarget);
      return { prevented: event.defaultPrevented, reachedTarget };
    };

    // A right click.
    let result = dispatchContextMenu(heldItem);
    expect(result.prevented).toBe(false);
    expect(result.reachedTarget).toHaveBeenCalled();

    // Android Chrome's long press.
    dispatchTouch(heldItem, 'touchstart');
    result = dispatchContextMenu(heldItem);
    expect(result.prevented).toBe(true);
    expect(result.reachedTarget).not.toHaveBeenCalled();
    dispatchTouch(heldItem, 'touchend');

    result = dispatchContextMenu(otherItem);
    expect(result.prevented).toBe(false);
  });

  it('stops watching gestures once tracking is stopped', () => {
    stopTracking();
    dispatchTouch(heldItem, 'touchstart');
    expect(canStartDragFromCurrentGesture()).toBe(true);
  });
});
