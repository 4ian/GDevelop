// @flow
import * as React from 'react';

export type ClientCoordinates = {|
  /* The X position, relative to the viewport, not including scroll offset, of the long touch */
  +clientX: number,
  /* The Y position, relative to the viewport, not including scroll offset, of the long touch */
  +clientY: number,
|};

// Find the position of an event on the screen
const getClientXY = (event: TouchEvent): ClientCoordinates => {
  if (event.touches && event.touches.length > 0) {
    return {
      clientX: event.touches[0].clientX,
      clientY: event.touches[0].clientY,
    };
  }

  return {
    clientX: 0,
    clientY: 0,
  };
};

const defaultDelay = 600; // ms
const moveTolerance = 10; // px

const contextLocks: { [string]: true } = {};

/**
 * A hook to listen to a long touch ("long press") on an element, to workaround the
 * non working onContextMenu on some platforms (Safari on iOS).
 *
 * A long press is characterized by starting a touch and staying pressed, without
 * moving too far from the initial position (to avoid being confused with a drag/scroll).
 */
export const useLongTouch = (
  callback: (e: ClientCoordinates) => void,
  options?: {
    /**
     * To be set when nested elements with watched touches events are in conflict to run a callback.
     * Priority will be given to the nested element.
     */
    context?: string,
    delay?: number,
  }
) => {
  const timeout = React.useRef<?TimeoutID>(null);
  const context = options && options.context ? options.context : null;
  const delay = options && options.delay ? options.delay : defaultDelay;
  const currentClientCoordinates = React.useRef<ClientCoordinates>({
    clientX: 0,
    clientY: 0,
  });
  const clear = React.useCallback(
    () => {
      if (context) delete contextLocks[context];
      timeout.current && clearTimeout(timeout.current);
    },
    [context]
  );

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
    (event: TouchEvent) => {
      // Ensure we remove the timeout waiting for the long press
      // if there is one already. This can happen if start is called
      // multiple times.
      timeout.current && clearTimeout(timeout.current);
      if (context) {
        if (contextLocks[context]) return;
        contextLocks[context] = true;
      }

      currentClientCoordinates.current = getClientXY(event);
      timeout.current = setTimeout(() => {
        callback(currentClientCoordinates.current);
      }, delay);
    },
    [callback, context, delay]
  );

  const onMove = React.useCallback(
    (event: TouchEvent) => {
      // If more than one touch,
      // it's not a long press anymore.
      if (event.touches.length !== 1) {
        clear();
        return;
      }

      // If touch moved too far from the initial touch position,
      // it's not a long press anymore.
      const touch = event.touches[0];
      const { clientX, clientY } = currentClientCoordinates.current;
      if (
        Math.abs(touch.clientX - clientX) > moveTolerance ||
        Math.abs(touch.clientY - clientY) > moveTolerance
      ) {
        clear();
        return;
      }
    },
    [currentClientCoordinates, clear]
  );

  return {
    onTouchStart: start,
    onTouchMove: onMove,
    onTouchEnd: clear,
  };
};
