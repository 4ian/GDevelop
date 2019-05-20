// @flow
import optionalRequire from '../../Utils/OptionalRequire.js';
const fs = optionalRequire('fs');
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

export default class LocalEventsFunctionsExtensionOpener {
  static chooseEventsFunctionExtensionFile = (): Promise<?string> => {
    return new Promise((resolve, reject) => {
      if (!dialog) return reject('Not supported');

      const browserWindow = electron.remote.getCurrentWindow();
      dialog.showOpenDialog(
        browserWindow,
        {
          title: 'Import an extension in the project',
          properties: ['openFile'],
          message: 'Choose an extension file to import (.json file)',
          filters: [
            {
              name: 'GDevelop 5 "events based" extension',
              extensions: ['json'],
            },
          ],
        },
        paths => {
          if (!paths || !paths.length) return resolve(null);

          return resolve(paths[0]);
        }
      );
    });
  };

  static readEventsFunctionExtensionFile = (
    filepath: string
  ): Promise<Object> => {
    return readJSONFile(filepath);
  };
}
