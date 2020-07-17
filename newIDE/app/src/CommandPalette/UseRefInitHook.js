// @flow
import { useRef } from 'react';

const useRefInit = <T>(init: () => T): T => {
  const instanceRef = useRef(null);

  let instance = instanceRef.current;
  if (instance !== null) return instance;
  // Lazily create the ref object
  let newInstance = init();
  instanceRef.current = newInstance;
  return newInstance;
};

export default useRefInit;
