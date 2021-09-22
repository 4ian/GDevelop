// @flow
import { useEffect, useRef, useCallback } from 'react';
import { useIsMounted } from './UseIsMounted';
import debounce from 'lodash/debounce';

/**
 * Debounces a React callback with a specified delay.
 */
export const useDebounce = (cb: any, delay: number) => {
  const options = {
    leading: false,
    trailing: true,
  };
  const isMounted = useIsMounted();
  const inputsRef = useRef({ cb, delay }); // mutable ref like with useThrottle
  useEffect(() => {
    inputsRef.current = { cb, delay };
  }); //also track cur. delay
  return useCallback(
    debounce(
      (...args: any) => {
        // Debounce is an async callback. Cancel it, if in the meanwhile
        // (1) component has been unmounted (see isMounted in snippet)
        // (2) delay has changed
        if (inputsRef.current.delay === delay && isMounted.current)
          inputsRef.current.cb(...args);
      },
      delay,
      options
    ),
    [delay, debounce]
  );
};
