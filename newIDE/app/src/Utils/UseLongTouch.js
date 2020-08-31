// @flow
import * as React from 'react';

type CallbackEvent = {|
  /* The X position, relative to the viewport, not including scroll offset, of the long touch */
  clientX: number,
  /* The Y position, relative to the viewport, not including scroll offset, of the long touch */
  clientY: number,
|};

// Find the position of an event on the screen
const getClientXY = (event: TouchEvent | MouseEvent): CallbackEvent => {
  // $FlowFixMe - seems the only way to check if event is a TouchEvent is to check for `touches` property.
  if (event.touches && event.touches.length > 0) {
    return {
      clientX: event.touches[0].clientX,
      clientY: event.touches[0].clientY,
    };
  }

  return {
    // $FlowFixMe - assume we have a MouseEvent now.
    clientX: event.clientX || 0,
    // $FlowFixMe - assume we have a MouseEvent now.
    clientY: event.clientY || 0,
  };
};

const delay = 600; // ms

/**
 * A hook to listen to a long touch ("long press") on an element, to workaround the
 * non working onContextMenu on some platforms (Safari on iOS).
 */
export const useLongTouch = (callback: (e: CallbackEvent) => void) => {
  const timeout = React.useRef<?TimeoutID>(null);
  const clear = React.useCallback(() => {
    timeout.current && clearTimeout(timeout.current);
  }, []);

  React.useEffect(
    () => {
      // Cancel the long touch if scrolling (otherwise we can get a long touch
      // being activated while scroll and maintaining the touch on an element,
      // which is weird for the user that just want to scroll).
      document.addEventListener('scroll', clear, {
        // Get notified as soon as the scroll happens.
        capture: true,

        // No need for passive: true
        // According to MDN: "You don't need to worry about the value of passive for the basic scroll event.
        // Since it can't be canceled, event listeners can't block page rendering anyway".
      });

      return () => {
        // Ensure we remove the timeout waiting for the long press
        // if the component is destroyed.
        clear();

        // Remove the listener for the scroll
        document.removeEventListener('scroll', clear, { capture: true });
      };
    },
    [clear]
  );

  const start = React.useCallback(
    (event: TouchEvent | MouseEvent) => {
      // Ensure we remove the timeout waiting for the long press
      // if there is one already. This can happen if start is called
      // multiple times.
      timeout.current && clearTimeout(timeout.current);

      const eventClientXY = getClientXY(event);
      timeout.current = setTimeout(() => {
        callback(eventClientXY);
      }, delay);
    },
    [callback]
  );

  return {
    // onMouseDown: (e: any) => start(e),
    onTouchStart: (e: any) => start(e),
    // onMouseUp: clear,
    // onMouseLeave: clear,
    onTouchEnd: clear,
  };
};
