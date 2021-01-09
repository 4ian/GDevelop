// @flow
import * as React from 'react';
import optionalRequire from '../Utils/OptionalRequire';
import PreferencesContext from '../MainFrame/Preferences/PreferencesContext';
import debounce from 'lodash/debounce';
const electron = optionalRequire('electron');
const fs = optionalRequire('fs');
const child_process = optionalRequire('child_process');
const process = optionalRequire('process');
const path = optionalRequire('path');

type DevelopmentWatchPaths = {
  paths: Array<string>,
  pathsWithErrors: { [string]: Error },
};

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
 * Returns the list of folders to watch containing the **sources** of
 * GDJS and Extensions, found relatively to the current working directory which is the
 * Electron working directory during **development**. Won't work
 * if running on production.
 */
const getAllDevelopmentWatchPaths = (): Promise<DevelopmentWatchPaths> => {
  if (!electron || !fs)
    return Promise.resolve({ paths: [], pathsWithErrors: {} });

  const pathsWithErrors: { [string]: Error } = {};

  const gdevelopRepositoryRoot = path.join(
    findDevelopmentNewIdeAppPath(),
    '../..'
  );
  const gdjsSourcesRuntimePath = path.join(
    gdevelopRepositoryRoot,
    'GDJS/Runtime'
  );
  const gdExtensionsPath = path.join(gdevelopRepositoryRoot, 'Extensions');

  const getExtensionDevelopmentWatchPaths = (): Promise<Array<string>> =>
    new Promise(resolve =>
      fs.readdir(gdExtensionsPath, (error: ?Error, files: Array<string>) => {
        if (error) {
          pathsWithErrors[gdExtensionsPath] = error;
          resolve([]);
          return;
        }

        resolve(
          Promise.all(
            files.map(
              (file): Promise<?string> =>
                new Promise(resolve => {
                  const extensionPath = path.join(gdExtensionsPath, file);
                  fs.stat(extensionPath, (error, stat) => {
                    if (error) {
                      pathsWithErrors[extensionPath] = error;
                      resolve(extensionPath);
                      return;
                    }

                    resolve(stat.isDirectory() ? extensionPath : null);
                  });
                })
            )
          ).then(paths => paths.filter(Boolean))
        );
      })
    );

  const getGDJSDevelopmentWatchPaths = (): Promise<Array<string>> => {
    return Promise.resolve(
      [gdjsSourcesRuntimePath].concat(
        [
          // List of all sub folders in GDJS Runtime.
          // If you add any folder, add it here too so that it
          // can be watched for changes.
          'Cocos2d',
          'Cordova',
          'Electron',
          'FacebookInstantGames',
          'cocos-renderers',
          'cocos-sound-manager',
          'events-tools',
          'fontfaceobserver-font-manager',
          'howler-sound-manager',
          'libs',
          'pixi-renderers',
          'websocket-debugger-client',
        ].map(folder => path.join(gdjsSourcesRuntimePath, folder))
      )
    );
  };

  return getExtensionDevelopmentWatchPaths().then(
    extensionDevelopmentWatchPaths => {
      return getGDJSDevelopmentWatchPaths().then(gdjsDevelopmentWatchPaths => {
        return {
          paths: [
            ...gdjsDevelopmentWatchPaths,
            ...extensionDevelopmentWatchPaths,
          ],
          pathsWithErrors,
        };
      });
    }
  );
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
  'Error in watcher for GDJS Runtime - manually call npm run `node import-GDJS-Runtime.js` in the newIDE/app/scripts folder if you make changes to GDJS.';

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

      let stopWatchers = false;
      let watchers = [];
      let startTime = performance.now();
      getAllDevelopmentWatchPaths().then(({ paths, pathsWithErrors }) => {
        // There is a non nul chance that for some reason the effect was cleaned up
        // before we retrieved all the paths. Stop there if it's the case.
        if (stopWatchers) return;

        if (!fs) {
          console.error(
            "Unable to use 'fs' from Node.js to watch changes in GDJS."
          );
          return;
        }

        // Reload extensions when the component is first mounted
        importGDJSRuntime().catch(() => {});

        // Create watchers
        paths.forEach(watchPath => {
          let watcher = null;
          try {
            watcher = fs.watch(watchPath, {}, onWatchEvent);
          } catch (error) {
            pathsWithErrors[watchPath] = error;
            return null;
          }

          if (watcher) {
            watcher.on('error', error => {
              console.warn(genericWatcherErrorMessage, error);
            });

            watchers.push(watcher);
          }
        });

        if (Object.keys(pathsWithErrors).length) {
          console.warn(
            'Error while setting up watchers for some paths: ',
            pathsWithErrors
          );
        }

        const totalTimeStr = (performance.now() - startTime).toFixed(2);
        if (watchers.length) {
          console.info(
            `Watchers for GDJS Runtime/extensions installed in ${totalTimeStr}ms.`
          );
        } else {
          console.warn(
            `No watchers for GDJS Runtime/extensions installed (took ${totalTimeStr}ms).`
          );
        }
      });

      // Close all the watchers when the React effect is unregistered
      return () => {
        stopWatchers = true;
        if (!watchers.length) return;

        watchers.forEach(watcher => {
          watcher.close();
        });
        console.info('Watchers for GDJS Runtime closed.');
      };
    },
    [shouldWatch]
  );

  return null;
};
