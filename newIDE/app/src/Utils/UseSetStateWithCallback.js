import React from 'react';

export default function useStateWithCallback(initialValue) {
  const [state, setState] = React.useState(initialValue);
  const callback = React.useRef(null);
  const useStateWithCB = newValue => {
    return new Promise(resolve => {
      callback.current = resolve;
      setState(newValue);
    });
  };
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
