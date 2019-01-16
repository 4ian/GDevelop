/**
 * @memberof gdjs
 * @class fileSystem
 * @static
 * @private
 */

gdjs.fileSystem = {}

/**
 * Get the path to 'Desktop' folder.
 * @param {gdjs.RuntimeScene} runtimeScene The current scene
 * @return {string} The path to the desktop folder
 */
gdjs.fileSystem.getDesktopPath = function (runtimeScene) {
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
gdjs.fileSystem.getDocumentsPath = function (runtimeScene) {
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
gdjs.fileSystem.getPicturesPath = function (runtimeScene) {
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
gdjs.fileSystem.getExecutablePath = function (runtimeScene) {
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
gdjs.fileSystem.getUserdataPath = function (runtimeScene) {
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
gdjs.fileSystem.getTempPath = function (runtimeScene) {
  const electron = runtimeScene.getGame().getRenderer().getElectron();

  if (electron) {
    return electron.remote.app.getPath('temp') || '';
  } else {
    return '';
  }
}

/**
 * Get the path delimiter specific to the operating system.
 * @return {string} The path delimiter
 */
gdjs.fileSystem.getPathDelimiter = function () {
  const path = typeof require !== 'undefined' ? require('path') : null;

  if (path) {
    return path.sep || '';
  } else {
    return '';
  }
}

/**
 * Create a new directory at the given path.
 * @param {string} directory The path to create a new directory
 */
gdjs.fileSystem.makeDirectory = function (directory) {
  const fileSystem = typeof require !== 'undefined' ? require('fs') : null;

  if (fileSystem) {
    if (!fileSystem.existsSync(directory))
      fileSystem.mkdirSync(directory);
  }
}

/**
 * Save a string into a file.
 * @param {string} text The text string to be saved
 * @param {string} savePath The absolute path on the filesystem
 */
gdjs.fileSystem.saveTextToFile = function (text, savePath) {
  const fileSystem = typeof require !== 'undefined' ? require('fs') : null;

  if (fileSystem) {
    fileSystem.writeFile(savePath, text, (err) => {
      if (err) {
        console.error("Unable to save the text to path: '" + savePath + "' " + err);
      }
    });
  }
}

/**
 * Check if the file or directory exists.
 * @param {string} path The path to the file or directory
 * @return {boolean} True if fhe file or directory exists
 */
gdjs.fileSystem.pathExists = function (path) {
  const fileSystem = typeof require !== 'undefined' ? require('fs') : null;

  if (fileSystem) {
    return fileSystem.existsSync(path);
  } else {
    return false;
  }
}
