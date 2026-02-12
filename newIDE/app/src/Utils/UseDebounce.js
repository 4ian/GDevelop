// @flow
import { useEffect, useRef, useCallback } from 'react';
import { useIsMounted } from './UseIsMounted';
import debounce from 'lodash/debounce';

// Function taken from https://stackoverflow.com/questions/54666401/how-to-use-throttle-or-debounce-with-react-hook/62017005#62017005

/**
 * Debounces a React callback with a specified delay.
 */
export const useDebounce = (cb: any, delay: number) => {
  const options = {
    leading: false,
    trailing: true,
  };
  const isMounted = useIsMounted();
  const inputsRef = useRef({ cb, delay });
  useEffect(() => {
    inputsRef.current = { cb, delay };
  });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useCallback(
    debounce(
      (...args: any) => {
        if (inputsRef.current.delay === delay && isMounted.current)
          inputsRef.current.cb(...args);
      },
      delay,
      options
    ),
    [delay, debounce]
  );
};
