// @flow
import * as React from 'react';
import optionalRequire from '../Utils/OptionalRequire';
import PreferencesContext from '../MainFrame/Preferences/PreferencesContext';
import debounce from 'lodash/debounce';
import { RESOURCE_EXTENSIONS } from '../ResourcesList/ResourceUtils.js';

const fs = optionalRequire('fs');
const path = optionalRequire('path');
const glob = optionalRequire('glob');


/**
 * Callback for fs.watch, so that  whenever a source file is changed,
 * it relaunchs automatically the script to import.
 */
const onWatchEvent = debounce((event: ?string, filename: ?string) => {
  const eventName = event || 'unknown-event';
  const resolvedFilename = filename || 'unknown-file';
  console.info(
    `Resources watchers found a "${eventName}" in ${resolvedFilename}, updating state Warning or Error for this resource...`
  );
  //importGDJSRuntime().catch(() => {});
}, 100 /* Avoid running the script too much in case multiple changes are fired at the same time. */);

const genericWatcherErrorMessage =
  'Error in watcher for parse resources from the game.';

/**
 * Set up some watchers for GDJS and Extensions sources.
 * Stop the watchers when the component is unmounted or `shouldWatch` prop is false.
 */

export type Props = {|
  project?: any,
|};

export const ResourcesWatcher = (props: Props) => {
  const { project } = props;

  //const resourcesManager = project.getResourcesManager();
  const projectPath = path.dirname(project.getProjectFile());

  const preferences = React.useContext(PreferencesContext);
  const shouldWatch = preferences.values.useResourcesWatcher;

  const getAllResourcesPaths = (src, callback) => {
    for (var type in RESOURCE_EXTENSIONS) {
      glob(src + '/**/*.{' + RESOURCE_EXTENSIONS[type] + '}', callback);
    }
  };

  let watchers = [];

  React.useEffect(
    () => {
      if (!shouldWatch) {
        // inverse la ligne ici
        // Nothing to set up in the effect if watch is deactivated.
        return;
      }

      //faire de getAllResourcesPaths une fonction externe au composant ?
      getAllResourcesPaths(projectPath, (err, res) => {
        if (err) {
          console.error('Error parse resources', err);
        } else {
          //mettre tout les path dans un array.
          // utilisé l'array et bouclé dessus dans le useEffect plus bas.
          res.forEach(pathResourceFound => {
            //watchere ici
            //const fileName = path.relative(projectPath, pathResourceFound);
            // if (!resourcesManager.hasResource(fileName)) {
            //createOrUpdateResource(project, createResource(), fileName);
            console.log(`${pathResourceFound}`);

            let watcher = null;
            try {
              watcher = fs.watch(pathResourceFound, {}, onWatchEvent);
              console.warn(`Watcher started on: ${pathResourceFound}`);
            } catch (error) {
              //pathsWithErrors[pathResourceFound] = error;
              console.warn(
                `Watcher error on: ${pathResourceFound}, error: ${error}`
              );
              return null;
            }

            if (watcher) {
              watcher.on('error', error => {
                console.warn(genericWatcherErrorMessage, error);
              });
              watcher.on('change', (eventType, filename) => {
                console.log(`File Changed: ${filename}`);
              });

              watchers.push(watcher);
            }
          });
        }
      });

      // Close all the watchers when the React effect is unregistered
      return () => {
        //stopWatchers = true;
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
