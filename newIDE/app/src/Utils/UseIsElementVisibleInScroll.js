// @flow
import { useEffect, useRef } from 'react';

/**
 * Creates an interval effect for a callback, with a specified delay.
 */
const useIsElementVisibleInScroll = (
  // $FlowFixMe[cannot-resolve-name]
  element: ?HTMLElement,
  // $FlowFixMe[cannot-resolve-name]
  callback: (IntersectionObserverEntry[]) => void,
  // $FlowFixMe[cannot-resolve-name]
  intersectionObserverOptions?: IntersectionObserverOptions
) => {
  // $FlowFixMe[cannot-resolve-name]
  const observerRef = useRef<?IntersectionObserver>(null);

  useEffect(
    () => {
      if (!element) return;
      // $FlowFixMe[cannot-resolve-name]
      observerRef.current = new IntersectionObserver(callback, {
        root: null,
        threshold: 0.8,
        ...intersectionObserverOptions,
      });
      observerRef.current.observe(element);
      return () => {
        if (observerRef.current) observerRef.current.disconnect();
      };
    },
    [element, callback, intersectionObserverOptions]
  );
};

export default useIsElementVisibleInScroll;
