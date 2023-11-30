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
    const activeElement = document.activeElement;
    if (
      activeElement &&
      (activeElement.tagName === 'INPUT' ||
        activeElement.tagName === 'TEXTAREA')
    ) {
      // Do not call listeners if the user is typing in an input or textarea.
      // This is particularly helpful on mobile devices, where the virtual
      // keyboard will trigger a resize event.
      // NOTE: this is not perfect, as this does not detect if the virtual
      // keyboard is actually open or not, but it's better than nothing as
      // we assume the user will not resize the window while typing.
      // See https://stackoverflow.com/questions/14902321/how-to-determine-if-a-resize-event-was-triggered-by-soft-keyboard-in-mobile-brow
      // for why we cannot have a perfect solution.
      return;
    }
    clearTimeout(timeout);
    timeout = setTimeout(callListeners, 200);
  });
}

/**
 * A hook to call a callback when the window is resized,
 * while having only one resize DOM event handler.
 */
const useOnResize = (callback: () => void) => {
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

export default useOnResize;
