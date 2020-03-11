// @flow
import * as React from 'react';

export type UnsavedChanges = {|
  hasUnsavedChanges: boolean,
  sealUnsavedChanges: () => void,
  triggerUnsavedChanges: () => void,
|};

const initialUnsavedChanges = {
  hasUnsavedChanges: false,
  sealUnsavedChanges: () => {},
  triggerUnsavedChanges: () => {},
};

const UnsavedChangesContext = React.createContext<UnsavedChanges>(
  initialUnsavedChanges
);

export default UnsavedChangesContext;
