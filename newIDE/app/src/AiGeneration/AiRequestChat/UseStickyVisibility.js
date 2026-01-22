// @flow
import * as React from 'react';

/**
 * A hook that makes visibility changes "sticky" - it shows immediately when
 * the condition becomes true, but waits for a delay before hiding when the
 * condition becomes false. This prevents flickering during rapid state changes.
 *
 * @param shouldShow - The current condition for whether the element should be visible
 * @param hideDelayMs - How long to wait before hiding after shouldShow becomes false (default: 300ms)
 * @returns A stable boolean indicating whether to show the element
 */
export const useStickyVisibility = (
  shouldShow: boolean,
  hideDelayMs: number = 300
): boolean => {
  const lastShouldShowTimeRef = React.useRef<number>(0);
  const stableShowRef = React.useRef<boolean>(false);

  // Update the stable value:
  // - If it should show now, always update to true and track the time
  // - If it should hide now, only hide if it's been hidden for at least hideDelayMs
  if (shouldShow) {
    lastShouldShowTimeRef.current = Date.now();
    stableShowRef.current = true;
  } else if (Date.now() - lastShouldShowTimeRef.current > hideDelayMs) {
    stableShowRef.current = false;
  }

  return stableShowRef.current;
};
