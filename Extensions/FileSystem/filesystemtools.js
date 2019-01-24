/**
 * @memberof gdjs
 * @class fileSystem
 * @static
 * @private
 */

gdjs.fileSystem = {};

/**
 * Get the path to 'Desktop' folder.
 * @param {gdjs.RuntimeScene} runtimeScene The current scene
 * @return {string} The path to the desktop folder
 */
gdjs.fileSystem.getDesktopPath = function(runtimeScene) {
  const electron = runtimeScene
    .getGame()
    .getRenderer()
    .getElectron();

  if (electron) {
    return electron.remote.app.getPath('desktop') || '';
  } else {
    return '';
  }
};

/**
 * Get the path to 'Documents' folder.
 * @param {gdjs.RuntimeScene} runtimeScene The current scene
 * @return {string} The path to the documents folder
 */
gdjs.fileSystem.getDocumentsPath = function(runtimeScene) {
  const electron = runtimeScene
    .getGame()
    .getRenderer()
    .getElectron();

  if (electron) {
    return electron.remote.app.getPath('documents') || '';
  } else {
    return '';
  }
};

/**
 * Get the path to 'Pictures' folder.
 * @param {gdjs.RuntimeScene} runtimeScene The current scene
 * @return {string} The path to the pictures folder
 */
gdjs.fileSystem.getPicturesPath = function(runtimeScene) {
  const electron = runtimeScene
    .getGame()
    .getRenderer()
    .getElectron();

  if (electron) {
    return electron.remote.app.getPath('pictures') || '';
  } else {
    return '';
  }
};

/**
 * Get the path to this application 'Executable' folder.
 * @param {gdjs.RuntimeScene} runtimeScene The current scene
 * @return {string} The path to this applications executable folder
 */
gdjs.fileSystem.getExecutablePath = function(runtimeScene) {
  const electron = runtimeScene
    .getGame()
    .getRenderer()
    .getElectron();

  if (electron) {
    return electron.remote.app.getPath('exe') || '';
  } else {
    return '';
  }
};

/**
 * Get the path to 'UserData' folder.
 * @param {gdjs.RuntimeScene} runtimeScene The current scene
 * @return {string} The path to userdata folder
 */
gdjs.fileSystem.getUserdataPath = function(runtimeScene) {
  const electron = runtimeScene
    .getGame()
    .getRenderer()
    .getElectron();

  if (electron) {
    return electron.remote.app.getPath('userData') || '';
  } else {
    return '';
  }
};

/**
 * Get the path to 'Temp' folder.
 * @param {gdjs.RuntimeScene} runtimeScene The current scene
 * @return {string} The path to temp folder
 */
gdjs.fileSystem.getTempPath = function(runtimeScene) {
  const electron = runtimeScene
    .getGame()
    .getRenderer()
    .getElectron();

  if (electron) {
    return electron.remote.app.getPath('temp') || '';
  } else {
    return '';
  }
};

/**
 * Get the path delimiter specific to the operating system.
 * @return {string} The path delimiter
 */
gdjs.fileSystem.getPathDelimiter = function() {
  const path = typeof require !== 'undefined' ? require('path') : null;

  if (path) {
    return path.sep || '/';
  } else {
    return '/';
  }
};

/**
 * Create a new directory at the given path.
 * @param {string} directory The path to create a new directory
 * @param {gdjs.Variable} resultVar The variable where to store the result of the operation
 */
gdjs.fileSystem.makeDirectory = function(directory, resultVar) {
  const fileSystem = typeof require !== 'undefined' ? require('fs') : null;
  let result = 'error';

  if (fileSystem) {
    try {
      fileSystem.mkdirSync(directory);
      result = 'ok';
    } catch (err) {
      console.error(
        "Unable to create directory at: '" + directory + "': ",
        err
      );
    }
  }
  resultVar.setString(result);
};

/**
 * Save a string into a file, asynchronously.
 * @param {string} text The string to be saved
 * @param {string} savePath Path to the file
 * @param {gdjs.Variable} resultVar The variable where to store the result of the operation
 */
gdjs.fileSystem.saveStringToFileAsync = function(text, savePath, resultVar) {
  const fileSystem = typeof require !== 'undefined' ? require('fs') : null;

  if (fileSystem) {
    fileSystem.writeFile(savePath, text, 'utf8', err => {
      resultVar.setString('ok');
      if (err) {
        console.error(
          "Unable to save the text to path: '" + savePath + "': ",
          err
        );
        resultVar.setString('error');
      }
    });
  }
};

/**
 * Save a string into a file.
 * @param {string} text The string to be saved
 * @param {string} savePath Path to the file
 * @param {gdjs.Variable} resultVar The variable where to store the result of the operation
 */
gdjs.fileSystem.saveStringToFile = function(text, savePath, resultVar) {
  const fileSystem = typeof require !== 'undefined' ? require('fs') : null;
  let result = 'error';

  if (fileSystem) {
    try {
      fileSystem.writeFileSync(savePath, text, 'utf8');
      result = 'ok';
    } catch (err) {
      console.error(
        "Unable to save the text to path: '" + savePath + "': ",
        err
      );
    }
  }
  resultVar.setString(result);
};

/**
 * Save a variable into a file in JSON format.
 * @param {gdjs.Variable} variable The variable to be saved
 * @param {string} savePath Path to the file
 * @param {gdjs.Variable} resultVar The variable where to store the result of the operation
 */
gdjs.fileSystem.saveVariableToJSONFile = function(
  variable,
  savePath,
  resultVar
) {
  const fileSystem = typeof require !== 'undefined' ? require('fs') : null;
  const network = gdjs.evtTools.network;
  let result = 'error';

  if (fileSystem && network) {
    try {
      fileSystem.writeFileSync(
        savePath,
        network.variableStructureToJSON(variable),
        'utf8'
      );
      result = 'ok';
    } catch (err) {
      console.error(
        "Unable to save the variable to path: '" + savePath + "': ",
        err
      );
    }
  }
  resultVar.setString(result);
};

/**
 * Save a variable into a file in JSON format, asynchronously.
 * @param {string} text The variable to be saved
 * @param {string} savePath Path to the file
 * @param {gdjs.Variable} resultVar The variable where to store the result of the operation
 */
gdjs.fileSystem.saveVariableToJSONFileAsync = function(
  variable,
  savePath,
  resultVar
) {
  const fileSystem = typeof require !== 'undefined' ? require('fs') : null;
  const network = gdjs.evtTools.network;

  if (fileSystem && network) {
    fileSystem.writeFile(
      savePath,
      network.variableStructureToJSON(variable),
      'utf8',
      err => {
        resultVar.setString('ok');
        if (err) {
          console.error(
            "Unable to save the variable to path: '" + savePath + "': ",
            err
          );
          resultVar.setString('error');
        }
      }
    );
  }
};

/**
 * Load a string from a file into a scene variable.
 * @param {gdjs.Variable} stringVar Variable where to store the content
 * @param {string} loadPath Path to the file
 * @param {gdjs.Variable} resultVar The variable where to store the result of the operation
 */
gdjs.fileSystem.loadStringFromFile = function(stringVar, loadPath, resultVar) {
  const fileSystem = typeof require !== 'undefined' ? require('fs') : null;
  let result = 'error';

  if (fileSystem) {
    try {
      const data = fileSystem.readFileSync(loadPath, 'utf8');

      if (data) {
        stringVar.setString(data);
        result = 'ok';
      }
    } catch (err) {
      console.error(
        "Unable to load the file at path: '" + loadPath + "': ",
        err
      );
    }
  }
  resultVar.setString(result);
};

/**
 * Load a JSON file and convert it into a variable.
 * @param {gdjs.Variable} variable Variable to store the variable
 * @param {string} loadPath Path to the file
 * @param {gdjs.Variable} resultVar The variable where to store the result of the operation
 */
gdjs.fileSystem.loadVariableFromJSONFile = function(
  variable,
  loadPath,
  resultVar
) {
  const fileSystem = typeof require !== 'undefined' ? require('fs') : null;
  const network = gdjs.evtTools.network;
  let result = 'error';

  if (fileSystem && network) {
    try {
      const data = fileSystem.readFileSync(loadPath, 'utf8');
      if (data) {
        network.jsonToVariableStructure(data, variable);
        result = 'ok';
      }
    } catch (err) {
      console.error(
        "Unable to load variable from the file at path: '" + loadPath + "': ",
        err
      );
    }
  }
  resultVar.setString(result);
};

/**
 * Load a JSON file and convert it into a variable, asynchronously.
 * @param {gdjs.Variable} variable Variable to store the variable
 * @param {string} loadPath Path to the file
 * @param {gdjs.Variable} resultVar The variable where to store the result of the operation
 */
gdjs.fileSystem.loadVariableFromJSONFileAsync = function(
  variable,
  loadPath,
  resultVar
) {
  const fileSystem = typeof require !== 'undefined' ? require('fs') : null;
  const network = gdjs.evtTools.network;

  if (fileSystem && network) {
    fileSystem.readFile(loadPath, 'utf8', (err, data) => {
      if (data) {
        network.jsonToVariableStructure(data, variable);
        resultVar.setString('ok');
      }
      if (err) {
        console.error(
          "Unable to load variable from the file at path: '" + loadPath + "': ",
          err
        );
        resultVar.setString('error');
      }
    });
  }
};

/**
 * Load a string from a file into a scene variable, asynchronously.
 * @param {gdjs.Variable} stringVar Variable where to store the content
 * @param {string} loadPath Path to the file
 * @param {gdjs.Variable} resultVar The variable where to store the result of the operation
 */
gdjs.fileSystem.loadStringFromFileAsync = function(
  stringVar,
  loadPath,
  resultVar
) {
  const fileSystem = typeof require !== 'undefined' ? require('fs') : null;

  if (fileSystem) {
    fileSystem.readFile(loadPath, 'utf8', (err, data) => {
      if (data) {
        stringVar.setString(data);
        resultVar.setString('ok');
      }
      if (err) {
        console.error(
          "Unable to load the file at path: '" + loadPath + "': ",
          err
        );
        resultVar.setString('error');
      }
    });
  }
};

/**
 * Delete a file from the filesystem.
 * @param {string} filePath Path to the file
 * @param {gdjs.Variable} resultVar The variable where to store the result of the operation
 */
gdjs.fileSystem.deleteFile = function(filePath, resultVar) {
  const fileSystem = typeof require !== 'undefined' ? require('fs') : null;
  let result = 'error';

  if (fileSystem) {
    try {
      fileSystem.unlinkSync(filePath);
      result = 'ok';
    } catch (err) {
      console.error("Unable to delete the file: '" + filePath + "': ", err);
      result = 'error';
    }
  }
  resultVar.setString(result);
};

/**
 * Delete a file from the filesystem, asynchronously.
 * @param {string} filePath Path to the file
 * @param {gdjs.Variable} resultVar The variable where to store the result of the operation
 */
gdjs.fileSystem.deleteFileAsync = function(filePath, resultVar) {
  const fileSystem = typeof require !== 'undefined' ? require('fs') : null;

  if (fileSystem) {
    fileSystem.unlink(filePath, err => {
      resultVar.setString('ok');
      if (err) {
        console.error("Unable to delete the file: '" + filePath + "': ", err);
        resultVar.setString('error');
      }
    });
  }
};

/**
 * Check if the file or directory exists.
 * @param {string} filePath The path to the file or directory
 * @return {boolean} true if fhe file or directory exists
 */
gdjs.fileSystem.pathExists = function(filePath) {
  const fileSystem = typeof require !== 'undefined' ? require('fs') : null;

  if (fileSystem) {
    return fileSystem.existsSync(filePath);
  } else {
    return false;
  }
};
