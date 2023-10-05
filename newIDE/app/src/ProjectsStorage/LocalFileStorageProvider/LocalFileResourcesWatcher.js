// @flow
import path from 'path-browserify';
import optionalRequire from '../../Utils/OptionalRequire';
import { type FileMetadata } from '..';
import debounce from 'lodash/debounce';

const fileWatcher = optionalRequire('chokidar');

export const setupResourcesWatcher =
  fileWatcher && path
    ? (fileMetadata: FileMetadata, callback: (resourceInfo: any) => void) => {
        const folderPath = path.dirname(fileMetadata.fileIdentifier);
        const gameFile = path.basename(fileMetadata.fileIdentifier);
        const watcher = fileWatcher
          .watch(folderPath, {
            ignored: [`**/.DS_Store`, gameFile],
          })
          .on(
            'change',
            // TODO: Is it safe to let it like that since the OS could for some reason
            // do never-ending operations on the folder or its children, making the debounce
            // never ending.
            debounce(
              filePath => {
                const relativePath = path.relative(folderPath, filePath);

                callback({ path: relativePath });
              },
              200,
              { leading: false, trailing: true }
            )
          );
        return () => watcher.unwatch(folderPath);
      }
    : undefined;
