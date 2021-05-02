// @flow
import * as React from 'react';
import optionalRequire from '../Utils/OptionalRequire';
import PreferencesContext from '../MainFrame/Preferences/PreferencesContext';
import debounce from 'lodash/debounce';
const electron = optionalRequire('electron');
const child_process = optionalRequire('child_process');
const process = optionalRequire('process');
const path = optionalRequire('path');
const chokidar = optionalRequire('chokidar');

/**
 * Returns the folder corresponding to newIDE/app in **development**. Works
 * only when running in Electron.
 */
const findDevelopmentNewIdeAppPath = () /*: string */ => {
  if (!electron) return '';

  const developmentElectronAppFolder = process.cwd();
  return path.join(developmentElectronAppFolder, '../app');
};

/**
 * Launch the newIDE script `import-GDJS-Runtime`.
 */
const importGDJSRuntime = (): Promise<void> => {
  if (!child_process || !path) return Promise.reject(new Error('Unsupported'));

  return new Promise((resolve, reject) => {
    const startTime = performance.now();
    child_process.exec(
      `node "${path.join(
        findDevelopmentNewIdeAppPath(),
        'scripts/import-GDJS-Runtime.js'
      )}"`,
      (error, stdout, stderr) => {
        if (error) {
          console.error(`GDJS Runtime update error:\n${error}`);
          reject(error);
          return;
        }

        const duration = (performance.now() - startTime).toFixed(0);
        console.info(`GDJS Runtime updated in ${duration}ms:\n${stdout}`);

        if (stderr) {
          console.error(`GDJS Runtime update error:\n${stderr}`);
          reject(new Error('Error while updating GDJS Runtime'));
          return;
        }

        resolve();
      }
    );
  });
};

/**
 * Callback for fs.watch, so that  whenever a source file is changed,
 * it relaunchs automatically the script to import.
 */
const onWatchEvent = debounce((event: ?string, filename: ?string) => {
  const eventName = event || 'unknown-event';
  const resolvedFilename = filename || 'unknown-file';
  console.info(
    `GDJS/extensions watchers found a "${eventName}" in ${resolvedFilename}, updating GDJS Runtime...`
  );
  importGDJSRuntime().catch(() => {});
}, 100 /* Avoid running the script too much in case multiple changes are fired at the same time. */);

const genericWatcherErrorMessage =
  'Error in watcher for GDJS Runtime - manually call npm run `node import-GDJS-Runtime.js` in the newIDE/app/scripts folder if you make changes to GDJS. Error:';

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

      const startTime = performance.now();
      if (!chokidar) {
        console.error(
          "Unable to use 'chokidar' from Node.js to watch changes in GDJS."
        );
        return;
      }

      const gdjsSourcesRuntimePath = path.join(
        findDevelopmentNewIdeAppPath(),
        '../../GDJS/Runtime/**/*'
      );
      const extensionsSourcesPath = path.join(
        findDevelopmentNewIdeAppPath(),
        '../../Extensions/**/*'
      );

      // Reload extensions when the component is first mounted
      importGDJSRuntime().catch(() => {});

      const watcher = chokidar
        .watch([gdjsSourcesRuntimePath, extensionsSourcesPath], {
          awaitWriteFinish: true,
          ignoreInitial: true,
        })
        .on('all', onWatchEvent)
        .on('error', e => console.error(genericWatcherErrorMessage, e))
        .on('ready', () => {
          const totalTimeStr = (performance.now() - startTime).toFixed(2);
          console.info(
            `Watchers for GDJS Runtime/extensions installed in ${totalTimeStr}ms.`
          );
        });

      return () => watcher.close();
    },
    [shouldWatch]
  );

  return null;
};
