// @flow
import * as React from 'react';

export type UnsavedChanges = {|
  hasUnsavedChanges: boolean,
  sealUnsavedChanges: () => void,
  triggerUnsavedChanges: () => void,
  changesCount: number,
  lastSaveTime: number | null,
|};

const initialState: UnsavedChanges = {
  hasUnsavedChanges: false,
  sealUnsavedChanges: () => {},
  triggerUnsavedChanges: () => {},
  changesCount: 0,
  lastSaveTime: null,
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
  const [changesCount, setChangesCount] = React.useState<number>(0);
  const [lastSaveTime, setLastSaveTime] = React.useState<number | null>(null);

  const triggerUnsavedChanges = (): void => {
    setChangesCount(changesCount_ => changesCount_ + 1);
    if (!hasUnsavedChanges) setHasUnsavedChanges(true);
  };

  const sealUnsavedChanges = (): void => {
    setChangesCount(0);
    setLastSaveTime(Date.now());
    if (hasUnsavedChanges) setHasUnsavedChanges(false);
  };

  return (
    <UnsavedChangesContext.Provider
      value={{
        hasUnsavedChanges,
        triggerUnsavedChanges: triggerUnsavedChanges,
        sealUnsavedChanges: sealUnsavedChanges,
        changesCount,
        lastSaveTime,
      }}
    >
      {props.children}
    </UnsavedChangesContext.Provider>
  );
};
