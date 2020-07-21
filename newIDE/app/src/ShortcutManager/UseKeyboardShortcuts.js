// @flow
import * as React from 'react';
import PreferencesContext from '../MainFrame/Preferences/PreferencesContext';

type Props = {};

const useKeyboardShortcuts = (props: Props) => {
  const preferences = React.useContext(PreferencesContext);
  console.log(preferences);
};

export default useKeyboardShortcuts;
