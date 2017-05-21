import {serializeToJSObject} from './Serializer';
import optionalRequire from './OptionalRequire.js';
const fs = optionalRequire('fs');

export default class FileOpener {
  static writeProjectJSONFile(project, filepath, cb) {
    if (!fs) return cb('Not supported');

    try {
      const content = JSON.stringify(serializeToJSObject(project));
      fs.writeFile(filepath, content, cb);
    } catch(e) {
      return cb(e);
    }
  }
}
