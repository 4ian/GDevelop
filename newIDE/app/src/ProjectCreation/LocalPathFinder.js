// @flow
import generateName from '../Utils/NewNameGenerator';
import optionalRequire from '../Utils/OptionalRequire.js';
const path = optionalRequire('path');
var fs = optionalRequire('fs-extra');

const findEmptyPath = (basePath: string) => {
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

export const findEmptyPathInDefaultFolder = (electronApp: any): string => {
  return findEmptyPath(
    path.join(electronApp.getPath('documents'), 'GDevelop projects')
  );
};
