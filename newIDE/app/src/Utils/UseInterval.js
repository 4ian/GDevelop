// @flow
import { useEffect, useRef } from 'react';

/**
 * Creates an interval effect for a callback, with a specified delay.
 */
export const useInterval = (callback: () => void, delay: number | null) => {
  const savedCallback = useRef();

  useEffect(() => {
    savedCallback.current = callback;
  });

  useEffect(
    () => {
      function tick() {
        if (savedCallback.current) savedCallback.current();
      }

      if (delay !== null) {
        const id = setInterval(tick, delay);
        return () => clearInterval(id);
      }
    },
    [delay]
  );
};
