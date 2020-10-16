import React from 'react';

/**
 * The list of event listeners.
 */
const listeners: Map<Symbol, Function> = new Map();

// Event listener set-up
const callListeners = () =>
  Array.from(listeners.values()).forEach(callback => callback());
let timeout;
window.addEventListener('resize', () => {
  clearTimeout(timeout);
  timeout = setTimeout(callListeners, 200);
});

/**
 * A hook to call a callback when the window is resized,
 * while having only one resize DOM event handler.
 */
export const useOnResize = callback => {
  const [ownID] = React.useState(Symbol('On-Resize event handler ID'));
  React.useEffect(
    () => {
      listeners.set(ownID, callback);
      return () => listeners.delete(ownID);
    },
    [callback, ownID]
  );
};
