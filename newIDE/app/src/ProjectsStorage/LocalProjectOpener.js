import optionalRequire from '../Utils/OptionalRequire.js';
const fs = optionalRequire('fs');
const electron = optionalRequire('electron');
const dialog = electron ? electron.remote.dialog : null;

export default class LocalProjectOpener {
  static chooseProjectFile() {
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
  }

  static readProjectJSONFile(filepath) {
    return new Promise((resolve, reject) => {
      if (!fs) return reject('Not supported');

      fs.readFile(filepath, { encoding: 'utf8' }, (err, data) => {
        if (err) return reject(err);

        try {
          const dataObject = JSON.parse(data);
          return resolve(dataObject);
        } catch (ex) {
          return reject('Malformed file');
        }
      });
    });
  }
}
