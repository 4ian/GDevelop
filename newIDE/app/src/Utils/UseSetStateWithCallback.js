import React from 'react';

/**
 * A useState hook that returns a promise when the state is set.
 * *Don't use it* excepted for MainFrame. This is used while transitioning
 * MainFrame to hooks - and it's not typed properly.
 */
export default function useStateWithCallback(initialValue) {
  const [state, setState] = React.useState(initialValue);
  const callback = React.useRef(null);

  const useStateWithCB = React.useCallback(
    newValue => {
      return new Promise(resolve => {
        callback.current = resolve;
        setState(newValue);
      });
    },
    [setState]
  );

  React.useEffect(
    () => {
      if (callback.current !== null) {
        callback.current(state);
        callback.current = null;
      }
    },
    [state]
  );
  return [state, useStateWithCB];
}
