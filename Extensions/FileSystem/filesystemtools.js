/**
 * @memberof gdjs
 * @class filesystem
 * @static
 * @private
 */

gdjs.filesystem = {}

/**
 * Get the path to 'Desktop' folder.
 * @param {gdjs.RuntimeScene} runtimeScene The current scene
 * @return {string} The path to the desktop folder
 */
gdjs.filesystem.getDesktopPath = function (runtimeScene) {
  const electron = runtimeScene.getGame().getRenderer().getElectron();

  if (electron) {
    return electron.remote.app.getPath('desktop') || '';
  } else {
    return '';
  }
}

/**
 * Get the path to 'Documents' folder.
 * @param {gdjs.RuntimeScene} runtimeScene The current scene
 * @return {string} The path to the documents folder
 */
gdjs.filesystem.getDocumentsPath = function (runtimeScene) {
  const electron = runtimeScene.getGame().getRenderer().getElectron();

  if (electron) {
    return electron.remote.app.getPath('documents') || '';
  } else {
    return '';
  }
}

/**
 * Get the path to 'Pictures' folder.
 * @param {gdjs.RuntimeScene} runtimeScene The current scene
 * @return {string} The path to the pictures folder
 */
gdjs.filesystem.getPicturesPath = function (runtimeScene) {
  const electron = runtimeScene.getGame().getRenderer().getElectron();

  if (electron) {
    return electron.remote.app.getPath('pictures') || '';
  } else {
    return '';
  }
}

/**
 * Get the path to this applications 'executable' folder.
 * @param {gdjs.RuntimeScene} runtimeScene The current scene
 * @return {string} The path to this applications executable folder
 */
gdjs.filesystem.getExecutablePath = function (runtimeScene) {
  const electron = runtimeScene.getGame().getRenderer().getElectron();

  if (electron) {
    return electron.remote.app.getPath('exe') || '';
  } else {
    return '';
  }
}

/**
 * Get the path to 'userdata' folder.
 * @param {gdjs.RuntimeScene} runtimeScene The current scene
 * @return {string} The path to userdata folder
 */
gdjs.filesystem.getUserdataPath = function (runtimeScene) {
  const electron = runtimeScene.getGame().getRenderer().getElectron();

  if (electron) {
    return electron.remote.app.getPath('userData') || '';
  } else {
    return '';
  }
}

/**
 * Get the path to 'temp' folder.
 * @param {gdjs.RuntimeScene} runtimeScene The current scene
 * @return {string} The path to temp folder
 */
gdjs.filesystem.getTempPath = function (runtimeScene) {
  const electron = runtimeScene.getGame().getRenderer().getElectron();

  if (electron) {
    return electron.remote.app.getPath('temp') || '';
  } else {
    return '';
  }
}

/**
 * Get the path delimiter specific to the operating system.
 * @param {gdjs.RuntimeScene} runtimeScene The current scene
 * @return {string} The path delimiter
 */
gdjs.filesystem.getPathDelimiter = function (runtimeScene) {
  const electron = runtimeScene.getGame().getRenderer().getElectron();
  const path = require('path');

  if (electron && path) {
    return path.sep || '';
  } else {
    return '';
  }
}

/**
 * Create a new directory at the given path.
 * @param {gdjs.RuntimeScene} runtimeScene The current scene
 * @param {string} directory The path to create a new directory
 */
gdjs.filesystem.getMakeDirectory = function (runtimeScene, directory) {
  const electron = runtimeScene.getGame().getRenderer().getElectron();

  if (electron) {
    const filesystem = require('fs');
    if (!filesystem.existsSync(directory))
      filesystem.mkdirSync(directory);
  }
}

/**
 * Check if the file or directory exists.
 * @param {gdjs.RuntimeScene} runtimeScene The current scene
 * @param {string} directory The path to the file or directory
 * @return {boolean} True if fhe file or directory exists
 */
gdjs.filesystem.pathExists = function (runtimeScene, path) {
  const electron = runtimeScene.getGame().getRenderer().getElectron();
  
  if (electron) {
    const filesystem = require('fs');
    return filesystem.existsSync(path) ? 1 : 0;
  } else {
    return 0;
  }
}
