// @flow

/**
 * Remove a listener from a WindowProxy without assuming that it is still
 * same-origin. An iframe can navigate after the listener is registered, and
 * Chromium then blocks property access on the existing WindowProxy.
 */
export const safelyRemoveWindowEventListener = (
  targetWindow: any,
  eventName: string,
  listener: any,
  useCapture: boolean
): boolean => {
  try {
    targetWindow.removeEventListener(eventName, listener, useCapture);
    return true;
  } catch (error) {
    if (error && error.name === 'SecurityError') {
      // The iframe has navigated cross-origin. Its old document and listeners
      // are already discarded, so there is nothing left that can be removed
      // from the parent renderer.
      return false;
    }
    throw error;
  }
};
