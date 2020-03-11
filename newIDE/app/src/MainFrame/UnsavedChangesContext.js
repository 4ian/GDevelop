import * as React from 'react';
import Toggle from '../UI/Toggle';
export const UnsavedChangesContext = React.createContext({
  hasUnsavedChanges: false,
  sealUnsavedChanges: () => {},
  triggerUnsavedChanges: () => {},
});
