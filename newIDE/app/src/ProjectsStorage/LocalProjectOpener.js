// @flow
import optionalRequire from '../Utils/OptionalRequire.js';
import { unsplit } from '../Utils/ObjectSplitter.js';
const fs = optionalRequire('fs');
const path = optionalRequire('path');
const electron = optionalRequire('electron');
const dialog = electron ? electron.remote.dialog : null;

const readJSONFile = (filepath: string): Promise<Object> => {
  if (!fs) return Promise.reject('Filesystem is not supported.');

  return new Promise((resolve, reject) => {
    fs.readFile(filepath, { encoding: 'utf8' }, (err, data) => {
      if (err) return reject(err);

      try {
        const dataObject = JSON.parse(data);
        return resolve(dataObject);
      } catch (ex) {
        return reject(filepath + ' is a corrupted/malformed file.');
      }
    });
  });
};

export default class LocalProjectOpener {
  static chooseProjectFile = (): Promise<?string> => {
    return new Promise((resolve, reject) => {
      if (!dialog) return reject('Not supported');

      const browserWindow = electron.remote.getCurrentWindow();
      dialog.showOpenDialog(
        browserWindow,
        {
          title: 'Open a project',
          properties: ['openFile'],
          message:
            'If you want to open your GDevelop 4 project, be sure to save it as a .json file',
          filters: [{ name: 'GDevelop 5 project', extensions: ['json'] }],
        },
        paths => {
          if (!paths || !paths.length) return resolve(null);

          return resolve(paths[0]);
        }
      );
    });
  };

  static readProjectFile = (filepath: string): Object => {
    const projectPath = path.dirname(filepath);
    return readJSONFile(filepath).then(object => {
      return unsplit(object, {
        getReferencePartialObject: referencePath => {
          return readJSONFile(path.join(projectPath, referencePath) + '.json');
        },
        isReferenceMagicPropertyName: '__REFERENCE_TO_SPLIT_OBJECT',
      }).then(() => {
        return object;
      });
    });
  };

  static shouldOpenAutosave = (
    filePath: string,
    autoSavePath: string,
    compareLastModified: boolean
  ): boolean => {
    if (fs.existsSync(autoSavePath)) {
      if (!compareLastModified) {
        return true;
      }
      try {
        const autoSavedTime = fs.statSync(autoSavePath).mtime.getTime();
        const saveTime = fs.statSync(filePath).mtime.getTime();
        if (autoSavedTime > saveTime) {
          return true;
        }
      } catch (err) {
        console.error('Unable to compare *.autosave to project', err);
        return false;
      }
      return false;
    }
    return false;
  };
}
