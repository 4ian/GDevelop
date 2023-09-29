// @flow
import { useRef } from 'react';

const useValueWithInit = <T>(init: () => T): T => {
  const instanceRef = useRef<T | null>(null);

  let instance = instanceRef.current;
  if (instance !== null) return instance;
  // Lazily create the ref object.
  let newInstance = init();
  instanceRef.current = newInstance;
  return newInstance;
};

export default useValueWithInit;

export const useRefWithInit = <T>(init: () => T): {| current: T |} => {
  const instanceRef = useRef<T | null>(null);

  let instance = instanceRef.current;
  // $FlowFixMe - we have the guarantee that T can't be null.
  if (instance !== null) return instanceRef;

  // Lazily create the ref object.
  let newInstance = init();
  instanceRef.current = newInstance;
  // $FlowFixMe - we have the guarantee that T can't be null.
  return instanceRef;
};
