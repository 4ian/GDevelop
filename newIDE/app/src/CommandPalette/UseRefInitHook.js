// @flow
import { useRef } from 'react';

const useRefInit = <T>(init: () => T): T => {
  const instanceRef = useRef(null);

  let instance = instanceRef.current;
  if (instance !== null) return instance;
  // Lazy init
  let newInstance = init();
  instanceRef.current = newInstance;
  return newInstance;
};

export default useRefInit;
