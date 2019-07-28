// @flow
import { serializeToJSObject } from '../Utils/Serializer';
import optionalRequire from '../Utils/OptionalRequire.js';
import {
  split,
  splitPaths,
  getSlugifiedUniqueNameFromProperty,
} from '../Utils/ObjectSplitter';
import localFileSystem from '../Export/LocalExporters/LocalFileSystem';
import assignIn from 'lodash/assignIn';

const gd = global.gd;

const fs = optionalRequire('fs-extra');
const path = optionalRequire('path');
const electron = optionalRequire('electron');
const dialog = electron ? electron.remote.dialog : null;

const writeJSONFile = (object: Object, filepath: string): Promise<void> => {
  if (!fs) return Promise.reject(new Error('Filesystem is not supported.'));

  try {
    const content = JSON.stringify(object, null, 2);
    return fs.ensureDir(path.dirname(filepath)).then(
      () =>
        new Promise((resolve, reject) => {
          fs.writeFile(filepath, content, (err: ?Error) => {
            if (err) {
              return reject(err);
            }

            return resolve();
          });
        })
    );
  } catch (stringifyException) {
    return Promise.reject(stringifyException);
  }
};

export default class LocalProjectWriter {
  static saveProject = (project: gdProject): Promise<void> => {
    const filepath = project.getProjectFile();
    const projectPath = path.dirname(project.getProjectFile());
    if (!filepath) {
      return Promise.reject('Unimplemented "Save as" feature');
    }
    const serializedProjectObject = serializeToJSObject(project);
    if (project.isFolderProject()) {
      const partialObjects = split(serializedProjectObject, {
        pathSeparator: '/',
        getArrayItemReferenceName: getSlugifiedUniqueNameFromProperty('name'),
        shouldSplit: splitPaths(
          new Set([
            '/layouts/*',
            '/externalLayouts/*',
            '/externalEvents/*',
            '/layouts/*',
            '/eventsFunctionsExtensions/*',
          ])
        ),
        isReferenceMagicPropertyName: '__REFERENCE_TO_SPLIT_OBJECT',
      });

      return Promise.all(
        partialObjects.map(partialObject => {
          return writeJSONFile(
            partialObject.object,
            path.join(projectPath, partialObject.reference) + '.json'
          ).catch(err => {
            console.error('Unable to write a partial file:', err);
            throw err;
          });
        })
      ).then(() => {
        return writeJSONFile(serializedProjectObject, filepath).catch(err => {
          console.error('Unable to write the split project:', err);
          throw err;
        });
      });
    } else {
      return writeJSONFile(serializedProjectObject, filepath).catch(err => {
        console.error('Unable to write the project:', err);
        throw err;
      });
    }
  };

  static saveProjectAs = (project: gdProject): Promise<void> => {
    const fileSystem = assignIn(new gd.AbstractFileSystemJS(), localFileSystem);
    let filepath = project.getProjectFile();
    const projectPath = path.dirname(project.getProjectFile());
    const browserWindow = electron.remote.getCurrentWindow();
    const options = {
      defaultPath: projectPath + '\\game.json',
      filters: [{ name: 'GDevelop 5 project', extensions: ['json'] }],
    };

    const newFilepath = dialog.showSaveDialog(browserWindow, options);
    const newProjectFolder = path.dirname(newFilepath);

    if (!filepath || filepath === '') {
      return Promise.reject('Filepath from dialog is empty');
    }

    if (!dialog) {
      return Promise.reject('Unimplemented dialog electron feature');
    }

    const serializedProjectObject = serializeToJSObject(project);
    gd.ProjectResourcesCopier.copyAllResourcesTo(project, fileSystem, newProjectFolder, true, false, true);

    if (project.isFolderProject()) {
      const partialObjects = split(serializedProjectObject, {
        pathSeparator: '/',
        getArrayItemReferenceName: getSlugifiedUniqueNameFromProperty('name'),
        shouldSplit: splitPaths(
          new Set([
            '/layouts/*',
            '/externalLayouts/*',
            '/externalEvents/*',
            '/layouts/*',
            '/eventsFunctionsExtensions/*',
          ])
        ),
        isReferenceMagicPropertyName: '__REFERENCE_TO_SPLIT_OBJECT',
      });

      return Promise.all(
        partialObjects.map(partialObject => {
          return writeJSONFile(
            partialObject.object,
            path.join(newProjectFolder, partialObject.reference) + '.json'
          ).catch(err => {
            console.error('Unable to write a partial file:', err);
            throw err;
          });
        })
      ).then(() => {
        return writeJSONFile(serializedProjectObject, newFilepath).catch(
          err => {
            console.error('Unable to write the split project:', err);
            throw err;
          }
        );
      });
    } else {
      return writeJSONFile(serializedProjectObject, newFilepath).catch(err => {
        console.error('Unable to write the project:', err);
        throw err;
      });
    }
  };

  static autoSaveProject = (project: gdProject) => {
    const autoSavePath = project.getProjectFile() + '.autosave';
    writeJSONFile(serializeToJSObject(project), autoSavePath).catch(err => {
      console.error(`Unable to write ${autoSavePath}:`, err);
      throw err;
    });
  };
}
