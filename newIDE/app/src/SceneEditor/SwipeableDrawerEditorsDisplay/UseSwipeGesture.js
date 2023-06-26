// @flow

import * as React from 'react';

type Props = {|
  onSwipeUp: () => void,
  onSwipeDown: () => void,
|};

const minMovement = 30; // px
const minSpeed = 200; // px/s

const useSwipeGesture = (props: Props) => {
  const startTimeRef = React.useRef<?number>(null);
  const startYRef = React.useRef<?number>(null);

  const onTouchStart = React.useCallback((event: TouchEvent) => {
    startTimeRef.current = Date.now();
    startYRef.current = event.touches[0].clientY;
  }, []);

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
        if (deltaY < 0) props.onSwipeUp();
        else props.onSwipeDown();
      }

      startTimeRef.current = null;
      startYRef.current = null;
    },
    [props]
  );

  return {
    onTouchStart,
    onTouchEnd,
  };
};

export default useSwipeGesture;
