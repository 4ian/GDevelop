// @flow
import path from 'path-browserify';
import optionalRequire from '../../Utils/OptionalRequire';
import { type FileMetadata } from '..';

const fileWatcher = optionalRequire('chokidar');

export const setupResourcesWatcher =
  fileWatcher && path
    ? (fileMetadata: FileMetadata, callback: () => void) => {
        const folderPath = path.dirname(fileMetadata.fileIdentifier);
        const gameFile = path.basename(fileMetadata.fileIdentifier);
        const watcher = fileWatcher
          .watch(folderPath, {
            ignored: [`**/.DS_Store`, gameFile],
          })
          .on('change', event => {
            callback();
          });
        return () => watcher.unwatch(folderPath);
      }
    : undefined;
