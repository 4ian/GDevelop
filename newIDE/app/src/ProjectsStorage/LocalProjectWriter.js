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

const writeJSONFile = (object: Object, filePath: string): Promise<void> => {
  if (!fs) return Promise.reject(new Error('Filesystem is not supported.'));

  try {
    const content = JSON.stringify(object, null, 2);
    return fs.ensureDir(path.dirname(filePath)).then(
      () =>
        new Promise((resolve, reject) => {
          fs.writeFile(filePath, content, (err: ?Error) => {
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
  filePath: string,
  projectPath: string
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
          path.join(projectPath, partialObject.reference) + '.json'
        ).catch(err => {
          console.error('Unable to write a partial file:', err);
          throw err;
        });
      })
    ).then(() => {
      return writeJSONFile(serializedProjectObject, filePath).catch(err => {
        console.error('Unable to write the split project:', err);
        throw err;
      });
    });
  } else {
    return writeJSONFile(serializedProjectObject, filePath).catch(err => {
      console.error('Unable to write the project:', err);
      throw err;
    });
  }
};

export default class LocalProjectWriter {
  static saveProject = (project: gdProject): Promise<boolean> => {
    const filePath = project.getProjectFile();
    const projectPath = path.dirname(project.getProjectFile());
    if (!filePath) {
      return Promise.reject('Unimplemented "Save as" feature');
    }

    return writeProjectFiles(project, filePath, projectPath).then(() => {
      return true;
    });
  };

  static saveProjectAs = (project: gdProject): Promise<boolean> => {
    let filePath = project.getProjectFile();
    //const filenameWithExtension = path.basename(project.getProjectFile()) || 'game.json';
    let projectPath = path.dirname(filePath);
    const fileSystem = assignIn(new gd.AbstractFileSystemJS(), localFileSystem);
    const browserWindow = electron.remote.getCurrentWindow();
    const options = {
      defaultPath: filePath,
      filters: [{ name: 'GDevelop 5 project', extensions: ['json'] }],
    };

    if (!dialog) {
      return Promise.reject('Unsupported');
    }
    filePath = dialog.showSaveDialog(browserWindow, options);
    if (!filePath) {
      return Promise.reject(false);
    }
    projectPath = path.dirname(filePath);

    gd.ProjectResourcesCopier.copyAllResourcesTo(
      project,
      fileSystem,
      projectPath,
      true,
      false,
      true
    );
    return writeProjectFiles(project, filePath, projectPath).then(() => {
      return true;
    });
  };

  static autoSaveProject = (project: gdProject) => {
    const autoSavePath = project.getProjectFile() + '.autosave';
    writeJSONFile(serializeToJSObject(project), autoSavePath).catch(err => {
      console.error(`Unable to write ${autoSavePath}:`, err);
      throw err;
    });
  };
}
