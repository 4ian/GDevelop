/**
 * @memberof gdjs
 * @class filesystem
 * @static
 * @private
 */

gdjs.filesystem = {}

/**
 * Get the path to 'Desktop' folder.
 * @return {string} The path to the desktop folder
 */
gdjs.filesystem.getFolderDesktop = function (runtimeScene) {
  const electron = runtimeScene.getGame().getRenderer().getElectron();

  if (electron) {
    return electron.getPath('desktop') ? electron.getPath('desktop') : '';
  } else {
    return '';
  }
}

/**
 * Get the path to 'Documents' folder.
 * @return {string} The path to the documents folder
 */
gdjs.filesystem.getFolderDocuments = function (runtimeScene) {
  const electron = runtimeScene.getGame().getRenderer().getElectron();

  if (electron) {
    return electron.getPath('documents') ? electron.getPath('documents') : '';
  } else {
    return '';
  }
}

/**
 * Get the path to 'Pictures' folder.
 * @return {string} The path to the pictures folder
 */
gdjs.filesystem.getFolderPictures = function (runtimeScene) {
  const electron = runtimeScene.getGame().getRenderer().getElectron();

  if (electron) {
    return electron.getPath('pictures') ? electron.getPath('pictures') : '';
  } else {
    return '';
  }
}

/**
 * Get the path to this applications 'executable' folder.
 * @return {string} The path to this applications executable folder
 */
gdjs.filesystem.getFolderExecutable = function (runtimeScene) {
  const electron = runtimeScene.getGame().getRenderer().getElectron();

  if (electron) {
    return electron.getPath('exe') ? electron.getPath('exe') : '';
  } else {
    return '';
  }
}

/**
 * Get the path to 'userdata' folder.
 * @return {string} The path to userdata folder
 */
gdjs.filesystem.getFolderUserdata = function (runtimeScene) {
  const electron = runtimeScene.getGame().getRenderer().getElectron();

  if (electron) {
    return electron.getPath('userData') ? electron.getPath('userData') : '';
  } else {
    return '';
  }
}

/**
 * Get the path to 'temp' folder.
 * @return {string} The path to temp folder
 */
gdjs.filesystem.getFolderTemp = function (runtimeScene) {
  const electron = runtimeScene.getGame().getRenderer().getElectron();

  if (electron) {
    return electron.getPath('temp') ? electron.getPath('temp') : '';
  } else {
    return '';
  }
}