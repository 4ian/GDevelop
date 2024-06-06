// @flow
import * as React from 'react';

export type UnsavedChanges = {|
  hasUnsavedChanges: boolean,
  sealUnsavedChanges: (options?: {| setCheckpointTime: boolean |}) => void,
  triggerUnsavedChanges: () => void,
  getChangesCount: () => number,
  getLastCheckpointTime: () => number | null,
|};

const initialState: UnsavedChanges = {
  hasUnsavedChanges: false,
  sealUnsavedChanges: () => {},
  triggerUnsavedChanges: () => {},
  getChangesCount: () => 0,
  getLastCheckpointTime: () => null,
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
  const lastCheckpointTime = React.useRef<number | null>(null); // Cannot be stored in a state variable, otherwise it re-renders children at each change.

  const triggerUnsavedChanges = React.useCallback((): void => {
    changesCount.current = changesCount.current + 1;
    setHasUnsavedChanges(true);
  }, []);

  const sealUnsavedChanges = React.useCallback(
    (options?: {| setCheckpointTime: boolean |}): void => {
      changesCount.current = 0;
      lastCheckpointTime.current =
        options && options.setCheckpointTime ? Date.now() : null;
      setHasUnsavedChanges(false);
    },
    []
  );

  const getChangesCount = React.useCallback(() => changesCount.current, []);
  const getLastCheckpointTime = React.useCallback(
    () => lastCheckpointTime.current,
    []
  );

  return (
    <UnsavedChangesContext.Provider
      value={{
        hasUnsavedChanges,
        triggerUnsavedChanges,
        sealUnsavedChanges,
        getChangesCount,
        getLastCheckpointTime,
      }}
    >
      {props.children}
    </UnsavedChangesContext.Provider>
  );
};
