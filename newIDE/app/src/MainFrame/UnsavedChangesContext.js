// @flow
import * as React from 'react';

export type UnsavedChanges = {|
  hasUnsavedChanges: boolean,
  sealUnsavedChanges: (options?: {| setSaveTime: boolean |}) => void,
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

  const sealUnsavedChanges = React.useCallback(
    (options?: {| setSaveTime: boolean |}): void => {
      changesCount.current = 0;
      lastSaveTime.current = options && options.setSaveTime ? Date.now() : null;
      setHasUnsavedChanges(false);
    },
    []
  );

  const getChangesCount = React.useCallback(() => changesCount.current, []);
  const getLastSaveTime = React.useCallback(() => lastSaveTime.current, []);

  return (
    <UnsavedChangesContext.Provider
      value={{
        hasUnsavedChanges,
        triggerUnsavedChanges,
        sealUnsavedChanges,
        getChangesCount,
        getLastSaveTime,
      }}
    >
      {props.children}
    </UnsavedChangesContext.Provider>
  );
};
