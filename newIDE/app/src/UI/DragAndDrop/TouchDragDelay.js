// @flow

/**
 * On touch screens, a drag must only start if the finger stayed on the item
 * for a while: a quicker movement is the user scrolling the list.
 *
 * This is done by refusing the drag in `canDrag` rather than with the
 * `delayTouchStart` option of react-dnd-touch-backend, because a touch move
 * happening during `delayTouchStart` cancels the drag for the whole gesture:
 * a real finger always moves a bit while pressing, so intentional drags would
 * randomly not start at all (particularly on iOS, which reports these tiny
 * moves - see the fix of the events dragging on iOS).
 *
 * Refusing the drag once is enough to make the whole gesture a scroll: the
 * backend forgets the drag sources of the gesture as soon as it tried to
 * start a drag with them.
 */
export const TOUCH_DRAG_START_DELAY = 300;

// Distance the pointer must travel before the backend tries to start a drag.
// Android Chrome's long-press synthesizes hover mouse events ~1px off the
// touch position: without a slop, every long press starts a phantom drag.
const DRAG_SLOP = 10;

// While the finger holds an item (before the delay elapsed), it can drift by
// this much without the backend trying, and refusing, to start the drag:
// a refusal makes the whole gesture a scroll, and a real finger easily rolls
// by more than the slop while pressing.
export const TOUCH_HOLD_TOLERANCE = 20;

// Once the delay elapsed on an item that must be held before being dragged,
// the long press opening the context menu is delayed too, so that the two
// gestures are clearly apart: the item lifts, then the finger either moves
// (drag) or keeps pressing (menu) - and there is time to notice the lift.
// Items dragging immediately (handles) have no such intermediate state and
// keep the default delay of useLongTouch.
export const LONG_PRESS_DELAY_ON_HELD_ITEM = 1200;

// Set on the elements of the drag sources, with how they start a drag on a
// touch screen (see DragSourceAndDropTarget).
export const TOUCH_DRAG_START_ATTRIBUTE = 'data-touch-drag-start';

export type TouchDragStart = 'immediate' | 'afterHold';

// The touch gesture in progress, or null if no finger is currently down (in
// which case a drag can only come from a mouse).
let currentGesture: {|
  startTime: number,
  startX: number,
  startY: number,
  target: ?Node,
  // How the drag source under the finger starts a drag, if any.
  touchDragStart: ?TouchDragStart,
  hasMoved: boolean,
  // Whether the gesture is a scroll: the browser scrolled the content under
  // the finger, or the finger moved too far while holding an item. A drag
  // starting during it would fight the scroll.
  isScroll: boolean,
|} | null = null;

const handleTouchStart = (event: TouchEvent) => {
  const target = event.target instanceof Node ? event.target : null;
  const targetElement =
    target instanceof Element ? target : target ? target.parentElement : null;
  const dragSourceElement = targetElement
    ? targetElement.closest(`[${TOUCH_DRAG_START_ATTRIBUTE}]`)
    : null;
  const touchDragStart = dragSourceElement
    ? dragSourceElement.getAttribute(TOUCH_DRAG_START_ATTRIBUTE)
    : null;
  const touch = event.touches[0];
  currentGesture = {
    startTime: Date.now(),
    startX: touch ? touch.clientX : 0,
    startY: touch ? touch.clientY : 0,
    target,
    touchDragStart:
      touchDragStart === 'immediate' || touchDragStart === 'afterHold'
        ? touchDragStart
        : null,
    hasMoved: false,
    isScroll: false,
  };
};

const isFingerHolding = (): boolean => {
  const gesture = currentGesture;
  if (!gesture) return false;

  return Date.now() - gesture.startTime < TOUCH_DRAG_START_DELAY;
};

const handleTouchMove = (event: TouchEvent) => {
  const gesture = currentGesture;
  if (!gesture) return;
  gesture.hasMoved = true;
  if (event.touches.length !== 1) return;

  const isOnHeldItem = gesture.touchDragStart === 'afterHold';
  if (isOnHeldItem && isFingerHolding()) {
    const touch = event.touches[0];
    const distance = Math.hypot(
      touch.clientX - gesture.startX,
      touch.clientY - gesture.startY
    );
    if (distance > TOUCH_HOLD_TOLERANCE) gesture.isScroll = true;
    return;
  }

  // Once a drag can start (immediately on a handle, after the hold on a
  // held item), the browser must not start scrolling: on iOS, a scroll
  // started by a move not prevented in time can't be stopped for the rest
  // of the gesture, and the drag would fight it.
  const canDragStart =
    gesture.touchDragStart === 'immediate' ||
    (isOnHeldItem && !gesture.isScroll);
  if (canDragStart && event.cancelable) event.preventDefault();
};

const handleTouchEnd = () => {
  currentGesture = null;
};

// Android Chrome fires a contextmenu event after ~500ms of touch, which
// would open the context menu of the pressed element (through its
// onContextMenu meant for the mouse) before the long press of useLongTouch
// and its delay. Menus are only opened by the long press on touch screens.
const handleContextMenu = (event: Event) => {
  if (!currentGesture) return;
  event.preventDefault();
  event.stopPropagation();
};

const handleScroll = (event: Event) => {
  const gesture = currentGesture;
  // Only a scroll of the content under the finger, after it moved, counts:
  // not a programmatic scroll (a list scrolling its selection into view,
  // a resize detector scrolling its hidden element...).
  if (!gesture || !gesture.hasMoved || !gesture.target) return;
  const scrolledElement = event.target;
  if (
    scrolledElement instanceof Node &&
    scrolledElement.contains(gesture.target)
  ) {
    gesture.isScroll = true;
  }
};

/**
 * Watch the touch gestures made on a document, so that drags can be delayed
 * on touch screens (and the browser kept from scrolling or opening context
 * menus during them). Returns the function to stop watching it.
 */
export const trackTouchGesturesForDrag = (
  documentToTrack: Document
): (() => void) => {
  // Listen in the capture phase so that the gesture is known even if something
  // stops the propagation of the touch events.
  documentToTrack.addEventListener('touchstart', handleTouchStart, true);
  documentToTrack.addEventListener('touchmove', handleTouchMove, {
    capture: true,
    passive: false,
  });
  documentToTrack.addEventListener('touchend', handleTouchEnd, true);
  documentToTrack.addEventListener('touchcancel', handleTouchEnd, true);
  documentToTrack.addEventListener('scroll', handleScroll, true);
  documentToTrack.addEventListener('contextmenu', handleContextMenu, true);

  return () => {
    documentToTrack.removeEventListener('touchstart', handleTouchStart, true);
    documentToTrack.removeEventListener('touchmove', handleTouchMove, {
      capture: true,
    });
    documentToTrack.removeEventListener('touchend', handleTouchEnd, true);
    documentToTrack.removeEventListener('touchcancel', handleTouchEnd, true);
    documentToTrack.removeEventListener('scroll', handleScroll, true);
    documentToTrack.removeEventListener('contextmenu', handleContextMenu, true);
  };
};

/**
 * Where the finger of the touch gesture in progress landed, in client
 * coordinates, or null if no finger is down.
 */
export const getCurrentGestureStartPosition = (): ?{|
  x: number,
  y: number,
|} =>
  currentGesture
    ? { x: currentGesture.startX, y: currentGesture.startY }
    : null;

/**
 * Whether the touch gesture in progress is a scroll: the browser scrolled
 * the content under the finger, or the finger moved too far while holding
 * an item.
 */
export const isCurrentGestureScroll = (): boolean =>
  !!currentGesture && currentGesture.isScroll;

/**
 * Check if a drag can be started right now: always true for a mouse, and true
 * for a finger that has been pressing the item for long enough without
 * scrolling.
 */
export const canStartDragFromCurrentGesture = (): boolean =>
  !isFingerHolding() && !isCurrentGestureScroll();

/**
 * The distance the pointer must travel before the drag backend tries to
 * start a drag, at this moment of the gesture.
 */
export const getCurrentDragSlop = (): number =>
  isFingerHolding() &&
  currentGesture &&
  currentGesture.touchDragStart === 'afterHold'
    ? TOUCH_HOLD_TOLERANCE
    : DRAG_SLOP;
