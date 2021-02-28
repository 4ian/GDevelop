// @flow
import * as React from 'react';
import optionalRequire from '../Utils/OptionalRequire';
import PreferencesContext from '../MainFrame/Preferences/PreferencesContext';
import debounce from 'lodash/debounce';
import { RESOURCE_EXTENSIONS } from '../ResourcesList/ResourceUtils.js';

import resourcesLoader from './index';

const fs = optionalRequire('fs');
const path = optionalRequire('path');
const glob = optionalRequire('glob');
const chokidar = optionalRequire('chokidar');

/*
  Detecte un type d'event si un fichier change.
  eventName = change: lorsque le fichier est édité.
 */
const onWatchEvent = debounce((event: ?string, filename: ?string) => {
  const eventName = event || 'unknown-event';
  const resolvedFilename = filename || 'unknown-file';
  console.warn(
    `Resources watchers found a "${eventName}" in ${resolvedFilename}, updating state Warning or Error for this resource...`
  );
}, 100 /* Avoid running the script too much in case multiple changes are fired at the same time. */);

const genericWatcherErrorMessage =
  'Error in watcher for parse resources from the game.';

/**
 * Set up some watchers for GDJS and Extensions sources.
 * Stop the watchers when the component is unmounted or `shouldWatch` prop is false.
 */

export type Props = {|
  project?: any,
  updateResource?: any,
|};

export const ResourcesWatcher = (props: Props) => {
  const { project, updateResource } = props;

  const resourcesManager = project.getResourcesManager();
  const projectPath = path.dirname(project.getProjectFile());

  const preferences = React.useContext(PreferencesContext);
  const shouldWatch = preferences.values.useResourcesWatcher;

  const getAllResourcesPaths = (src, callback) => {
    for (var type in RESOURCE_EXTENSIONS) {
      glob(src + '/**/*.{' + RESOURCE_EXTENSIONS[type] + '}', callback);
    }
  };

  React.useEffect(
    () => {
      // Preference disable resource watcher.
      if (!shouldWatch) return;

      let watchers = [];

      //faire de getAllResourcesPaths une fonction externe au composant ?
      getAllResourcesPaths(projectPath, (err, res) => {
        if (err) {
          console.error('Error parse resources', err);
          return;
        }

        if (!fs || !chokidar) {
          console.error(
            "Unable to use 'fs' or 'chokidar' from Node.js to watch changes in resources."
          );
          return;
        }

        res.forEach(pathResourceFound => {
          let watcher = null;
          try {
            watcher = chokidar.watch(pathResourceFound, {}, onWatchEvent);
            //console.warn(`Watcher started on: ${pathResourceFound}`);
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
            watcher.on('change', resourceFullPath => {
              const resourceName = path.basename(resourceFullPath);
              if (!resourcesManager.hasResource(resourceName)) {
                console.log('Resource not found:' + resourceFullPath);
                return;
              }

              console.log(`Resource changed: ${resourceName}`);

              // Avertir l'onglet resource que le fichier X a changer et relancé un diagnostique de dimensions.
              updateResource([resourceName]);

              // Reload the resource by cleaning the PIXI cache used in IDE (scene editor, not resource editor?)
              resourcesLoader.burstUrl(project, resourceFullPath);

              let statusCode = '';
              if (
                resourcesManager.getResource(resourceName).getKind() === 'image'
              ) {
                // Load the image in cache
                let img = new Image();
                img.src = resourcesLoader.getResourceFullUrl(
                  project,
                  resourceFullPath,
                  {}
                );
                // Check if the size of the image is below 2048
                if (img.width > 2048 || img.height > 2048) {
                  console.warn('watcher warning size');
                  statusCode = 'WARNING_IMAGE_EXCEEDED_2048_PIXELS';
                  console.log('TROP GRAND 1');
                }
                resourcesLoader.setStatusCode(
                  project,
                  resourceFullPath,
                  statusCode
                );

                // No need image anymore, deletion.
                img = null;
              }
            });

            watchers.push(watcher);
          }
        });
      });

      // Close all the watchers when the React effect is unregistered
      return () => {
        if (!watchers.length) return;

        watchers.forEach(watcher => {
          watcher.close();
        });
        console.info('Watchers for resources closed.');
      };
    },
    [shouldWatch, project, projectPath, resourcesManager]
  );

  return null;
};
