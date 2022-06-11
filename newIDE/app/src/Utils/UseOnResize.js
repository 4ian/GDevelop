//@flow
import React from 'react';

/**
 * The list of event listeners.
 */
const listeners: Set<() => void> = new Set();

// Event listener set-up
if (typeof window !== 'undefined') {
  const callListeners = () => listeners.forEach(callback => callback());
  let timeout;
  window.addEventListener('resize', () => {
    clearTimeout(timeout);
    timeout = setTimeout(callListeners, 200);
  });
}

/**
 * A hook to call a callback when the window is resized,
 * while having only one resize DOM event handler.
 */
export const useOnResize = (callback: () => void) => {
  React.useEffect(
    () => {
      listeners.add(callback);
      return () => {
        listeners.delete(callback);
      };
    },
    [callback]
  );
};
