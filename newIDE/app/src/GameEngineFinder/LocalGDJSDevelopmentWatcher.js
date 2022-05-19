// @flow
import * as React from 'react';
import optionalRequire from '../Utils/OptionalRequire';
import PreferencesContext from '../MainFrame/Preferences/PreferencesContext';
const electron = optionalRequire('electron');
const ipcRenderer = electron ? electron.ipcRenderer : null;

/**
 * Set up some watchers for GDJS and Extensions sources.
 * Stop the watchers when the component is unmounted or `shouldWatch` prop is false.
 */
export const LocalGDJSDevelopmentWatcher = () => {
  const preferences = React.useContext(PreferencesContext);
  const shouldWatch = preferences.values.useGDJSDevelopmentWatcher;

  React.useEffect(
    () => {
      if (!shouldWatch) {
        // Nothing to set up in the effect if watch is deactivated.
        return;
      }

      if (!ipcRenderer) {
        console.error(
          'Unable to find ipcRenderer to set up GDJS development watchers'
        );
        return;
      }

      ipcRenderer.send('setup-local-gdjs-development-watcher');
      return () => {
        ipcRenderer.send('close-local-gdjs-development-watcher');
      };
    },
    [shouldWatch]
  );

  return null;
};
