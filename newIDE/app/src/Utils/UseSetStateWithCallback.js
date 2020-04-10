import React from 'react';

export default function useStateWithCallback(initialValue) {
  const [state, setState] = React.useState(initialValue);
  const callback = React.useRef(null);
  const useStateWithCB = (newValue) => {
    return new Promise(resolve => {
      setState(newValue);
      callback.current = resolve;
    });
  };
  React.useEffect(
    () => {
      if (callback.current !== null) {
        callback.current(state);
        callback.current = null;
      }
    },
    [callback, state]
  );
  return [state, useStateWithCB];
};