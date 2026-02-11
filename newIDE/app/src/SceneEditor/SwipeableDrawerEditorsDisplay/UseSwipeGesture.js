// @flow

import * as React from 'react';

type Props = {|
  onSwipeUp: () => void,
  onSwipeDown: () => void,
  containerRef: {| current: ?HTMLDivElement |},
|};

const minMovement = 30; // px
const minSpeed = 200; // px/s
const absoluteMaxDelta = 30; // px

const useSwipeGesture = ({ containerRef, onSwipeDown, onSwipeUp }: Props) => {
  const startTimeRef = React.useRef<?number>(null);
  const startYRef = React.useRef<?number>(null);

  const onTouchStart = React.useCallback(
    (event: TouchEvent) => {
      startTimeRef.current = Date.now();
      startYRef.current = event.touches[0].clientY;

      // Reset the position of the movement with the touch, if any.
      if (containerRef.current) {
        containerRef.current.style.transform = `translateY(0px)`;
      }
    },
    [containerRef]
  );

  const onTouchMove = React.useCallback(
    (event: TouchEvent) => {
      const currentY = event.touches[0].clientY;
      const startY = startYRef.current || currentY;
      // Follow the movement of the touch (by moving the panel by the delta
      // between the touch position and the start point), but up to a point
      // (the absoluteMaxDelta).
      const deltaY = Math.min(
        absoluteMaxDelta,
        Math.max(-absoluteMaxDelta, currentY - startY)
      );

      if (containerRef.current) {
        containerRef.current.style.transform = `translateY(${deltaY}px)`;
      }
    },
    [containerRef]
  );

  const onTouchEnd = React.useCallback(
    (event: TouchEvent) => {
      if (!startYRef.current || !startTimeRef.current) return;
      const { current: startY } = startYRef;
      const { current: startTime } = startTimeRef;

      const deltaY = event.changedTouches[0].clientY - startY;
      const deltaTimeInSeconds = (Date.now() - startTime) / 1000;
      if (
        Math.abs(deltaY) > minMovement &&
        Math.abs(deltaY) / deltaTimeInSeconds > minSpeed
      ) {
        if (deltaY < 0) onSwipeUp();
        else onSwipeDown();
      }

      // Reset the position of the movement with the touch.
      if (containerRef.current) {
        containerRef.current.style.transform = `translateY(0px)`;
      }

      startTimeRef.current = null;
      startYRef.current = null;
    },
    [onSwipeUp, onSwipeDown, containerRef]
  );

  return {
    onTouchStart,
    onTouchMove,
    onTouchEnd,
  };
};

export default useSwipeGesture;
