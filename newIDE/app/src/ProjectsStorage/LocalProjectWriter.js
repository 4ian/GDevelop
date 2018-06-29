import { serializeToJSObject } from '../Utils/Serializer';
import optionalRequire from '../Utils/OptionalRequire.js';
const fs = optionalRequire('fs');

export default class LocalProjectWriter {
  static _writeProjectJSONFile = (project, filepath, cb) => {
    if (!fs) return cb('Not supported');

    try {
      const content = JSON.stringify(serializeToJSObject(project), null, 2);
      fs.writeFile(filepath, content, cb);
    } catch (e) {
      return cb(e);
    }
  };

  static saveProject = project => {
    return new Promise((resolve, reject) => {
      const filepath = project.getProjectFile();
      if (!filepath) {
        console.warn('Unimplemented Saveas'); // TODO
        return;
      }

      LocalProjectWriter._writeProjectJSONFile(project, filepath, err => {
        if (err) {
          console.error('Unable to write project', err);
          return reject(err);
        }

        resolve();
      });
    });
  };
}
