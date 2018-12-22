import generateName from '../Utils/NewNameGenerator';
import optionalRequire from '../Utils/OptionalRequire.js';
const path = optionalRequire('path');
var fs = optionalRequire('fs-extra');

export const findEmptyPath = basePath => {
  if (!path) return basePath;

  const folderName = generateName('My project', name => {
    try {
      fs.accessSync(path.join(basePath, name));
    } catch (ex) {
      return false;
    }
    return true;
  });

  return path.join(basePath, folderName);
};
