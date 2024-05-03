// @flow
import { useEffect, useRef } from 'react';

/**
 * Creates an interval effect for a callback, with a specified delay.
 */
const useIsElementVisibleInScroll = (
  element: ?HTMLElement,
  callback: (IntersectionObserverEntry[]) => void,
  intersectionObserverOptions?: IntersectionObserverOptions
) => {
  const observerRef = useRef<?IntersectionObserver>(null);

  useEffect(
    () => {
      if (!element) return;
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
