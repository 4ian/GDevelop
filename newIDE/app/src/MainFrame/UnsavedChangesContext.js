// @flow
import * as React from 'react';

export type UnsavedChanges = {|
  hasUnsavedChanges: boolean,
  sealUnsavedChanges: () => void,
  triggerUnsavedChanges: () => void,
  getChangesCount: () => number,
  getTimeOfFirstChangeSinceLastSave: () => number | null,
|};

const initialState: UnsavedChanges = {
  hasUnsavedChanges: false,
  sealUnsavedChanges: () => {},
  triggerUnsavedChanges: () => {},
  getChangesCount: () => 0,
  getTimeOfFirstChangeSinceLastSave: () => null,
};

const UnsavedChangesContext = React.createContext<UnsavedChanges>(initialState);

export default UnsavedChangesContext;

type Props = {|
  children?: React.Node,
|};

export const UnsavedChangesContextProvider = (props: Props) => {
  const [hasUnsavedChanges, setHasUnsavedChanges] = React.useState<boolean>(
    false
  );
  const changesCount = React.useRef<number>(0); // Cannot be stored in a state variable, otherwise it re-renders children at each change.
  const timeOfFirstChangeSinceLastSave = React.useRef<number | null>(null); // Cannot be stored in a state variable, otherwise it re-renders children at each change.

  const triggerUnsavedChanges = React.useCallback((): void => {
    if (changesCount.current === 0) {
      timeOfFirstChangeSinceLastSave.current = Date.now();
    }
    changesCount.current = changesCount.current + 1;
    setHasUnsavedChanges(true);
  }, []);

  const sealUnsavedChanges = React.useCallback((): void => {
    changesCount.current = 0;
    timeOfFirstChangeSinceLastSave.current = null;
    setHasUnsavedChanges(false);
  }, []);

  const getChangesCount = React.useCallback(() => changesCount.current, []);
  const getTimeOfFirstChangeSinceLastSave = React.useCallback(
    () => timeOfFirstChangeSinceLastSave.current,
    []
  );

  return (
    <UnsavedChangesContext.Provider
      value={{
        hasUnsavedChanges,
        triggerUnsavedChanges,
        sealUnsavedChanges,
        getChangesCount,
        getTimeOfFirstChangeSinceLastSave,
      }}
    >
      {props.children}
    </UnsavedChangesContext.Provider>
  );
};
