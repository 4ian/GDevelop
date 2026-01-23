// @flow
import * as React from 'react';

/**
 * A hook that makes visibility changes "sticky" - it waits for a delay before
 * showing when the condition becomes true, and waits for a delay before hiding
 * when the condition becomes false. This prevents flickering during rapid state changes.
 *
 * @param params.shouldShow - The current condition for whether the element should be visible
 * @param params.showDelayMs - How long to wait before showing after shouldShow becomes true (default: 0ms)
 * @param params.hideDelayMs - How long to wait before hiding after shouldShow becomes false (default: 300ms)
 * @returns A stable boolean indicating whether to show the element
 */
export const useStickyVisibility = ({
  shouldShow,
  showDelayMs = 0,
  hideDelayMs = 300,
}: {
  shouldShow: boolean,
  showDelayMs?: number,
  hideDelayMs?: number,
}): boolean => {
  const [isVisible, setIsVisible] = React.useState(false);

  React.useEffect(() => {
    if (shouldShow) {
      // Schedule showing after delay
      const showTimer = setTimeout(() => {
        setIsVisible(true);
      }, showDelayMs);

      return () => clearTimeout(showTimer);
    } else {
      // Schedule hiding after delay
      const hideTimer = setTimeout(() => {
        setIsVisible(false);
      }, hideDelayMs);

      return () => clearTimeout(hideTimer);
    }
  }, [shouldShow, showDelayMs, hideDelayMs]);

  return isVisible;
};
