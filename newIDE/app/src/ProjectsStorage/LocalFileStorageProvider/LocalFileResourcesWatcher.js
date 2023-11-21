// @flow
import optionalRequire from '../../Utils/OptionalRequire';
import debounce from 'lodash/debounce';
import wrap from 'lodash/wrap';
import memoize from 'lodash/memoize';
import { splittedProjectFolderNames } from './LocalProjectWriter';

const path = optionalRequire('path');
const electron = optionalRequire('electron');
const ipcRenderer = electron ? electron.ipcRenderer : null;

export const setupResourcesWatcher =
  ipcRenderer && path
    ? ({
        fileIdentifier,
        callback,
        options,
      }: {
        fileIdentifier: string,
        callback: ({| identifier: string |}) => void,
        options?: {| isProjectSplitInMultipleFiles: boolean |},
      }) => {
        // We can't just debounce the whole callback, it has to be done file-wise,
        // otherwise we would miss all the debounced calls but the last one.
        // See https://stackoverflow.com/questions/28787436/debounce-a-function-with-argument
        const debouncedCallback = wrap(
          memoize(() =>
            debounce(
              filePath => {
                const relativePath = path
                  .relative(folderPath, filePath)
                  .replace(/\\/g, '/');

                callback({ identifier: relativePath });
              },
              200,
              { leading: false, trailing: true }
            )
          ),
          (getMemoizedFunc, obj) => getMemoizedFunc(obj)(obj)
        );
        const folderPath = path.dirname(fileIdentifier);
        const gameFile = path.basename(fileIdentifier);
        const autosaveFile = gameFile + '.autosave';
        ipcRenderer.on('project-file-changed', (event, path) => {
          // TODO: Is it safe to let it like that since the OS could for some reason
          // do never-ending operations on the folder or its children, making the debounce
          // never ending.
          debouncedCallback(path);
        });
        const ignore = [
          '**/.DS_Store', // macOS folder attributes file
          '**/.git/**', // For projects using git as a versioning tool.
          path.join(folderPath, gameFile),
          path.join(folderPath, autosaveFile),
        ];
        if (options && options.isProjectSplitInMultipleFiles) {
          ignore.push(
            ...splittedProjectFolderNames.map(folderName =>
              path.join(folderPath, folderName, '*.json')
            )
          );
        }
        const subscriptionIdPromise = ipcRenderer.invoke(
          'local-filesystem-watcher-setup',
          folderPath,
          JSON.stringify({
            ignore,
          })
        );

        return () => {
          ipcRenderer.removeAllListeners('project-file-changed');
          subscriptionIdPromise.then(subscriptionId => {
            ipcRenderer.invoke(
              'local-filesystem-watcher-disable',
              subscriptionId
            );
          });
        };
      }
    : undefined;
