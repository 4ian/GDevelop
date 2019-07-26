// @flow
import { serializeToJSObject } from '../Utils/Serializer';
import optionalRequire from '../Utils/OptionalRequire.js';
import {
  split,
  splitPaths,
  getSlugifiedUniqueNameFromProperty,
} from '../Utils/ObjectSplitter';
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
  static saveProject = (
    project: gdProject,
    isSaveAs: boolean = true
  ): Promise<void> => {
    let filepath = project.getProjectFile();
    const projectPath = path.dirname(project.getProjectFile());
    if (!filepath) {
      return Promise.reject('Unimplemented "Save as" feature');
    }

    const serializedProjectObject = serializeToJSObject(project);
    const browserWindow = electron.remote.getCurrentWindow();
    const options = {
      defaultPath: projectPath,
    };

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
          //TODO How save as multiple files ?
          return writeJSONFile(
            partialObject.object,
            path.join(projectPath, partialObject.reference) + '.json'
          ).catch(err => {
            console.error('Unable to write a partial file:', err);
            throw err;
          });
        })
      ).then(() => {
        //REVIEW need to be tested
        if (isSaveAs) {
          filepath = dialog.showSaveDialog(browserWindow, options);
        }
        return writeJSONFile(serializedProjectObject, filepath + '.json').catch(
          err => {
            console.error('Unable to write the split project:', err);
            throw err;
          }
        );
      });
    } else {
      //REVIEW  working for simple file
      if (isSaveAs) {
        filepath = dialog.showSaveDialog(browserWindow, options);
      }
      return writeJSONFile(serializedProjectObject, filepath + '.json').catch(
        err => {
          console.error('Unable to write the project:', err);
          throw err;
        }
      );
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
