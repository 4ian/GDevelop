//@flow
import React from 'react';
import { useDebounce } from './UseDebounce';

/**
 * A hook to handle optimistic changes on a state, typically when making a debounced API
 * call based on said state. functionToDebounce must throw in case of error to ensure that
 * the states are well updated.
 */
export const useOptimisticState = (
  initialState: any,
  functionToDebounce: (newState: any, args: any) => Promise<void>
) => {
  const [pending, setPending] = React.useState<?any>(null);
  const debouncedFunction = useDebounce(async (newState, ...args) => {
    try {
      await functionToDebounce(newState, ...args);
    } catch (error) {
      console.error(`Error while updating optimistic state: `, error);
    } finally {
      setPending(null);
    }
  }, 500);
  const setNewState = (newState: any, args: any) => {
    setPending(newState);
    debouncedFunction(newState, args);
  };
  return [pending !== null ? pending : initialState, setNewState];
};
