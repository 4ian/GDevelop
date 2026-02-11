// @flow
import * as React from 'react';
import optionalRequire from '../Utils/OptionalRequire';
import PreferencesContext from '../MainFrame/Preferences/PreferencesContext';
const electron = optionalRequire('electron');
const ipcRenderer = electron ? electron.ipcRenderer : null;

type Props = {
  onGDJSUpdated: () => Promise<void> | void,
};

/**
 * Set up some watchers for GDJS and Extensions sources.
 * Stop the watchers when the component is unmounted or `shouldWatch` prop is false.
 */
export const LocalGDJSDevelopmentWatcher = ({ onGDJSUpdated }: Props) => {
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

  React.useEffect(
    () => {
      if (!shouldWatch) {
        // Nothing to set up in the effect if watch is deactivated.
        return;
      }

      if (!ipcRenderer) {
        return;
      }

      ipcRenderer.removeAllListeners(
        'local-gdjs-development-watcher-runtime-updated'
      );
      ipcRenderer.on(
        'local-gdjs-development-watcher-runtime-updated',
        (event, err) => {
          onGDJSUpdated();
        }
      );

      return () => {
        ipcRenderer.removeAllListeners(
          'local-gdjs-development-watcher-runtime-updated'
        );
      };
    },
    [shouldWatch, onGDJSUpdated]
  );

  return null;
};
