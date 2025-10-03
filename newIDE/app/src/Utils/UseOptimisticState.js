//@flow
import React from 'react';
import { useDebounce } from './UseDebounce';

/**
 * A hook to handle optimistic changes on a state, typically when making a debounced API
 * call based on said state. functionToDebounce must throw in case of error to ensure that
 * the states are well updated.
 */
export const useOptimisticState = <T>(
  initialState: T,
  functionToDebounce: (newState: T, args: any) => Promise<void>
): [T, (T, any) => void, (T) => void] => {
  const [state, setState] = React.useState<T>(initialState);
  const [pending, setPending] = React.useState<T | null>(null);
  const isMountedRef = React.useRef<boolean>(true);
  
  React.useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);
  
  const debouncedFunction = useDebounce(async (newState: T, previousState: T, ...args) => {
    try {
      await functionToDebounce(newState, ...args);
      if (isMountedRef.current) {
        setState(newState);
        setPending(null);
      }
    } catch (error) {
      console.error(`Error while updating optimistic state: `, error)
      if (isMountedRef.current) {
        setState(previousState);
        setPending(null);
      }
      throw error;
    }
  }, 500);
  
  const setNewState = (newState: T, args: any) => {
    const previousState = state;
    setPending(newState);
    debouncedFunction(newState, previousState, args);
  };
  
  return [pending !== null ? pending : state, setNewState, setState];
};
