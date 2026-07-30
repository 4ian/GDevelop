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

// Time at which the touch gesture in progress started, or null if no finger
// is currently down (in which case a drag can only come from a mouse).
let currentTouchStartTime: number | null = null;

const handleTouchStart = () => {
  currentTouchStartTime = Date.now();
};

const handleTouchEnd = () => {
  currentTouchStartTime = null;
};

/**
 * Watch the touch gestures made on a document, so that drags can be delayed
 * on touch screens. Returns the function to stop watching it.
 */
export const trackTouchGesturesForDrag = (
  documentToTrack: Document
): (() => void) => {
  // Listen in the capture phase so that the gesture is known even if something
  // stops the propagation of the touch events.
  documentToTrack.addEventListener('touchstart', handleTouchStart, true);
  documentToTrack.addEventListener('touchend', handleTouchEnd, true);
  documentToTrack.addEventListener('touchcancel', handleTouchEnd, true);

  return () => {
    documentToTrack.removeEventListener('touchstart', handleTouchStart, true);
    documentToTrack.removeEventListener('touchend', handleTouchEnd, true);
    documentToTrack.removeEventListener('touchcancel', handleTouchEnd, true);
  };
};

/**
 * Check if a drag can be started right now: always true for a mouse, and true
 * for a finger that has been pressing the item for long enough.
 */
export const canStartDragFromCurrentGesture = (): boolean => {
  const touchStartTime = currentTouchStartTime;
  if (touchStartTime === null) return true;

  return Date.now() - touchStartTime >= TOUCH_DRAG_START_DELAY;
};
