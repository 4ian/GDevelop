// @flow

import * as React from 'react';

type Props = {|
  onSwipeUp: () => void,
  onSwipeDown: () => void,
|};

const useSwipeGesture = (props: Props) => {
  const startTimeRef = React.useRef<?number>(null);
  const startYRef = React.useRef<?number>(null);

  const onTouchStart = React.useCallback((event: TouchEvent) => {
    console.log(event)
    console.log(event.touches)
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
      console.log('END')
      console.log(Math.abs(deltaY))
      console.log(Math.abs(deltaY) / deltaTimeInSeconds)
      if (
        Math.abs(deltaY) > 30 &&
        Math.abs(deltaY) / deltaTimeInSeconds > 200
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
