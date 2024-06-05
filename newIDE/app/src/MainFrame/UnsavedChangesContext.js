// @flow
import * as React from 'react';

export type UnsavedChanges = {|
  hasUnsavedChanges: boolean,
  sealUnsavedChanges: () => void,
  triggerUnsavedChanges: () => void,
  getChangesCount: () => number,
  getLastSaveTime: () => number | null,
|};

const initialState: UnsavedChanges = {
  hasUnsavedChanges: false,
  sealUnsavedChanges: () => {},
  triggerUnsavedChanges: () => {},
  getChangesCount: () => 0,
  getLastSaveTime: () => null,
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
  const changesCount = React.useRef<number>(0);
  const lastSaveTime = React.useRef<number | null>(null);

  const triggerUnsavedChanges = React.useCallback((): void => {
    changesCount.current = changesCount.current + 1;
    setHasUnsavedChanges(true);
  }, []);

  const sealUnsavedChanges = React.useCallback((): void => {
    changesCount.current = 0;
    lastSaveTime.current = Date.now();
    setHasUnsavedChanges(false);
  }, []);

  const getChangesCount = () => changesCount.current;
  const getLastSaveTime = () => lastSaveTime.current;

  return (
    <UnsavedChangesContext.Provider
      value={{
        hasUnsavedChanges,
        triggerUnsavedChanges: triggerUnsavedChanges,
        sealUnsavedChanges: sealUnsavedChanges,
        getChangesCount,
        getLastSaveTime,
      }}
    >
      {props.children}
    </UnsavedChangesContext.Provider>
  );
};
