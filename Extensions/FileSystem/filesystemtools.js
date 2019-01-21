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
 * @param {scenevar} resultVar (optional) The variable to store the result of the operation
 */
gdjs.fileSystem.makeDirectory = function (directory, resultVar) {
  const fileSystem = typeof require !== 'undefined' ? require('fs') : null;
  let result = 'ok';

  if (fileSystem) {
    try {
      fileSystem.mkdirSync(directory);
    }
    catch (err) {
      console.error("Unable to create directory at: '" + directory + "': ", err);
      result = 'error';
    }
  }
  resultVar.setString(result);
}

/**
 * Save a string into a file.
 * @param {string} text The string to be saved
 * @param {string} savePath The absolute path on the filesystem
 * @param {scenevar} resultVar (optional) The variable to store the result of the operation
 */
gdjs.fileSystem.saveStringToFile = function (text, savePath, resultVar) {
  const fileSystem = typeof require !== 'undefined' ? require('fs') : null;
  let result = 'ok';

  if (fileSystem) {
    fileSystem.writeFile(savePath, text, (err) => {
      if (err) {
        console.error("Unable to save the text to path: '" + savePath + "': ", err);
        result = 'error';
      }
    });
  }
  resultVar.setString(result);
}

/**
 * Load a string from a file into a scene variable.
 * @param {scenevar} stringVar The scene variable to store the string
 * @param {string} loadPath The absolute path on the filesystem
 * @param {scenevar} resultVar (optional) The variable to store the result of the operation
 */
gdjs.fileSystem.loadStringFromFileSync = function (stringVar, loadPath, resultVar) {
  const fileSystem = typeof require !== 'undefined' ? require('fs') : null;
  let result = 'ok';

  if (fileSystem) {
    try {
      const data = fileSystem.readFileSync(loadPath, 'utf8');

      if (data) {
        stringVar.setString(data);
      }
    }
    catch (err) {
      console.error("Unable to load the file at path: '" + loadPath + "': ", err);
      result = 'error';
    }
  }
  resultVar.setString(result);
}

/**
 * Load a string from a file into a scene variable asyncrounousely.
 * @param {scenevar} stringVar The scene variable to store the string
 * @param {string} loadPath The absolute path on the filesystem
 * @param {scenevar} resultVar (optional) The variable to store the result of the operation
 */
gdjs.fileSystem.loadStringFromFileAsync = function (stringVar, loadPath, resultVar) {
  const fileSystem = typeof require !== 'undefined' ? require('fs') : null;
  let result = 'ok';

  if (fileSystem) {
    fileSystem.readFile(loadPath, 'utf8', (err, data) => {
      if (data) {
        stringVar.setString(data);
      }
      if (err) {
        console.error("Unable to load the file at path: '" + loadPath + "': ", err);
        result = 'error';
      }
    });
  }
  resultVar.setString(result);
}

/**
 * Delete a file from the filesystem.
 * @param {string} filePath The absolute path on the filesystem
 * @param {scenevar} resultVar (optional) The variable to store the result of the operation 
 */
gdjs.fileSystem.deleteFile = function (filePath, resultVar) {
  const fileSystem = typeof require !== 'undefined' ? require('fs') : null;
  let result = 'ok';

  if (fileSystem) {
    fileSystem.unlink(filePath, (err) => {
      if (err) {
        console.error("Unable to delete the file: '" + filePath + "': ", err);
        result = 'error';
      }
    });
  }
  resultVar.setString(result);
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
