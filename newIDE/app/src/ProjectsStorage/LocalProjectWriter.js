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

const writeProjectFiles = (
  project: gdProject,
  newFilepath: string,
  newProjectFolder: string
): Promise<void> => {

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
          path.join(newProjectFolder, partialObject.reference) + '.json'
        ).catch(err => {
          console.error('Unable to write a partial file:', err);
          throw err;
        });
      })
    ).then(() => {
      return writeJSONFile(serializedProjectObject, newFilepath).catch(err => {
        console.error('Unable to write the split project:', err);
        throw err;
      });
    });
  } else {
    return writeJSONFile(serializedProjectObject, newFilepath).catch(err => {
      console.error('Unable to write the project:', err);
      throw err;
    });
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
    const filepath = project.getProjectFile();
    const filenameWithExtension = path.basename(project.getProjectFile()) || "game.json";
    const projectPath = path.dirname(project.getProjectFile());
    const fileSystem = assignIn(new gd.AbstractFileSystemJS(), localFileSystem);
    const browserWindow = electron.remote.getCurrentWindow();
    const options = {
    defaultPath: path.join(projectPath, filenameWithExtension),
    filters: [{ name: 'GDevelop 5 project', extensions: ['json'] }],
    };

    if (!dialog) {
    return Promise.reject('Unsupported');
    }
    const newFilepath = dialog.showSaveDialog(browserWindow, options);
    if (!newFilepath || newFilepath === '') {
    return Promise.reject('Filepath from dialog is empty');
    }
    const newProjectFolder = path.dirname(newFilepath);

    gd.ProjectResourcesCopier.copyAllResourcesTo(
    project,
    fileSystem,
    newProjectFolder,
    true,
    false,
    true
    );

    return writeProjectFiles(project, newFilepath, newProjectFolder);
  };

  static autoSaveProject = (project: gdProject) => {
    const autoSavePath = project.getProjectFile() + '.autosave';
    writeJSONFile(serializeToJSObject(project), autoSavePath).catch(err => {
      console.error(`Unable to write ${autoSavePath}:`, err);
      throw err;
    });
  };
}
