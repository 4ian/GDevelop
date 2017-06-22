import optionalRequire from './OptionalRequire.js';
const fs = optionalRequire('fs');
const electron = optionalRequire('electron');
const dialog = electron ? electron.remote.dialog : null;

// TODO: Rename LocalFileOpener
export default class FileOpener {
  static chooseProjectFile(cb) {
    if (!dialog) return cb('Not supported');

    const browserWindow = electron.remote.getCurrentWindow();
    dialog.showOpenDialog(
      browserWindow,
      {
        title: 'Open a project',
        properties: ['openFile'],
        message: 'If you want to open your GDevelop 4 project, be sure to save it as a .json file',
        filters: [
          { name: 'GDevelop project', extensions: ['json'] },
          { name: 'All Files', extensions: ['*'] },
        ],
      },
      paths => {
        if (!paths || !paths.length) return cb(null, null);

        return cb(null, paths[0]);
      }
    );
  }

  static readProjectJSONFile(filepath, cb) {
    if (!fs) return cb('Not supported');

    fs.readFile(filepath, {encoding: 'utf8'}, (err, data) => {
      if (err) return cb(err);

      try {
        const dataObject = JSON.parse(data);
        return cb(null, dataObject);
      } catch (ex) {
        return cb('Malformed file');
      }
    });
  }
}
