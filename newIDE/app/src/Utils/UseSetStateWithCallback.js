import React from 'react';

/**
 * A useState hook that returns a promise when the state is set.
 * *Don't use it* excepted for MainFrame. This is used while transitioning
 * MainFrame to hooks - and it's not typed properly.
 */
export default function useStateWithCallback(initialValue) {
  const [state, setState] = React.useState(initialValue);
  // MainFrame can enqueue multiple state updates before React commits a render.
  // Keep every resolver: a single ref would orphan the promise returned by an
  // earlier update when a later update replaced it before the effect ran.
  const callbacks = React.useRef([]);
  // React skips a render when an update resolves to the current state object.
  // Advance a separate commit counter so the associated promise still settles
  // after React processes a no-op state update.
  const [callbackCommit, forceCallbackCommit] = React.useReducer(
    commit => commit + 1,
    0
  );

  const useStateWithCB = React.useCallback(
    newValue => {
      return new Promise(resolve => {
        callbacks.current.push(resolve);
        setState(newValue);
        forceCallbackCommit();
      });
    },
    [setState]
  );

  React.useEffect(
    () => {
      if (callbacks.current.length === 0) return;

      const committedCallbacks = callbacks.current;
      callbacks.current = [];
      committedCallbacks.forEach(callback => callback(state));
    },
    [state, callbackCommit]
  );
  return [state, useStateWithCB];
}
