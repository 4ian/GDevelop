// @flow
import generateName from '../../Utils/NewNameGenerator';
import optionalRequire from '../../Utils/OptionalRequire';
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
  let documentsPath = '';
  try {
    documentsPath = electronApp.getPath('documents');
  } catch (ex) {
    // A user may not have the Documents folder defined on Windows.
    documentsPath = electronApp.getPath('home');
  }
  return findEmptyPath(path.join(documentsPath, 'GDevelop projects'));
};
