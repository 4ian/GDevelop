// @flow
import * as React from 'react';

/**
 * Whether the page is currently hidden: the browser tab is in the
 * background, the window is minimized, or (on Chrome/Windows/macOS, thanks
 * to native occlusion detection) the window is entirely covered by another
 * one.
 *
 * This matters much more than it looks: while a page is hidden, browsers
 * stop `requestAnimationFrame` entirely and throttle `setTimeout`/
 * `setInterval` - down to a single wake up per minute once the page has
 * been hidden for a few minutes ("intensive throttling"). Anything driven
 * by a timer (like the AI agent watching loop) slows to a crawl, and
 * anything driven by animation frames (like a game running in a gameplay
 * test) stops altogether.
 *
 * In the desktop app, `backgroundThrottling` is disabled on the main window
 * (see `newIDE/electron-app/app/main.js`), so timers and animation frames
 * keep running even when this returns true.
 */
export const getIsPageHidden = (): boolean =>
  typeof document !== 'undefined' && document.visibilityState === 'hidden';

/**
 * Listen to the page being hidden or shown. Returns the function to
 * unregister the listener.
 */
export const addPageVisibilityListener = (
  onVisibilityChanged: (isHidden: boolean) => void
): (() => void) => {
  if (typeof document === 'undefined') return () => {};

  const listener = () => onVisibilityChanged(getIsPageHidden());
  document.addEventListener('visibilitychange', listener);
  return () => document.removeEventListener('visibilitychange', listener);
};

/**
 * Call `onPageBecameVisible` every time the page becomes visible again
 * (never on mount, even if the page is visible).
 */
export const usePageBecameVisible = (onPageBecameVisible: () => void) => {
  // Kept in a ref so that a caller passing a new function on every render
  // does not re-register the listener.
  const callbackRef = React.useRef(onPageBecameVisible);
  callbackRef.current = onPageBecameVisible;

  React.useEffect(() => {
    return addPageVisibilityListener(isHidden => {
      if (!isHidden) callbackRef.current();
    });
  }, []);
};

/** Whether the page is hidden, as a piece of React state. */
export const useIsPageHidden = (): boolean => {
  const [isHidden, setIsHidden] = React.useState<boolean>(getIsPageHidden);

  React.useEffect(() => {
    // The page may have changed visibility between the first render and
    // this effect.
    setIsHidden(getIsPageHidden());
    return addPageVisibilityListener(setIsHidden);
  }, []);

  return isHidden;
};
