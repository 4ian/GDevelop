namespace gdjs {
  /**
   * @memberof gdjs
   * @namespace fileSystem
   *
   */
  gdjs.fileSystem = {
    // The Node.js path module, or null if it can't be loaded.
    _path: null,
    // The Node.js fs module, or null if it can't be loaded.
    _fs: null,
  };

  /** Get the Node.js path module, or null if it can't be loaded */
  gdjs.fileSystem._getPath = function () {
    if (!gdjs.fileSystem._path) {
      // @ts-ignore
      gdjs.fileSystem._path =
        typeof require !== 'undefined' ? require('path') : null;
    }
    return gdjs.fileSystem._path;
  };

  /** Get the Node.js fs module, or null if it can't be loaded */
  gdjs.fileSystem._getFs = function () {
    if (!gdjs.fileSystem._fs) {
      // @ts-ignore
      gdjs.fileSystem._fs =
        typeof require !== 'undefined' ? require('fs') : null;
    }
    return gdjs.fileSystem._fs;
  };
  gdjs.fileSystem.getDirectoryName = function (fileOrFolderPath: string) {
    const path = gdjs.fileSystem._getPath();
    if (!path) {
      return '';
    }
    return path.dirname(fileOrFolderPath);
  };
  gdjs.fileSystem.getFileName = function (filePath: string) {
    const path = gdjs.fileSystem._getPath();
    if (!path) {
      return '';
    }
    return path.basename(filePath);
  };
  gdjs.fileSystem.getExtensionName = function (filePath: string) {
    const path = gdjs.fileSystem._getPath();
    if (!path) {
      return '';
    }
    return path.extname(filePath);
  };

  /**
   * Get the path to 'Desktop' folder.
   * @param runtimeScene The current scene
   * @return The path to the desktop folder
   */
  gdjs.fileSystem.getDesktopPath = function (
    runtimeScene: gdjs.RuntimeScene
  ): string {
    const electron = runtimeScene.getGame().getRenderer().getElectron();
    if (electron) {
      return electron.remote.app.getPath('desktop') || '';
    } else {
      return '';
    }
  };

  /**
   * Get the path to 'Documents' folder.
   * @param runtimeScene The current scene
   * @return The path to the documents folder
   */
  gdjs.fileSystem.getDocumentsPath = function (
    runtimeScene: gdjs.RuntimeScene
  ): string {
    const electron = runtimeScene.getGame().getRenderer().getElectron();
    if (electron) {
      return electron.remote.app.getPath('documents') || '';
    } else {
      return '';
    }
  };

  /**
   * Get the path to 'Pictures' folder.
   * @param runtimeScene The current scene
   * @return The path to the pictures folder
   */
  gdjs.fileSystem.getPicturesPath = function (
    runtimeScene: gdjs.RuntimeScene
  ): string {
    const electron = runtimeScene.getGame().getRenderer().getElectron();
    if (electron) {
      return electron.remote.app.getPath('pictures') || '';
    } else {
      return '';
    }
  };

  /**
   * Get the path to this application 'Executable' file.
   * @param runtimeScene The current scene
   * @return The path to this applications executable file
   */
  gdjs.fileSystem.getExecutablePath = function (
    runtimeScene: gdjs.RuntimeScene
  ): string {
    const electron = runtimeScene.getGame().getRenderer().getElectron();
    if (electron) {
      return electron.remote.app.getPath('exe') || '';
    } else {
      return '';
    }
  };

  /**
   * Get the path to this application 'Executable' folder.
   * @param runtimeScene The current scene
   * @return The path to this applications executable folder
   */
  gdjs.fileSystem.getExecutableFolderPath = function (
    runtimeScene: gdjs.RuntimeScene
  ): string {
    const path = gdjs.fileSystem._getPath();
    const executablePath = gdjs.fileSystem.getExecutablePath(runtimeScene);
    if (!path) {
      return '';
    }
    return path.dirname(executablePath);
  };

  /**
   * Get the path to 'UserData' folder.
   * @param runtimeScene The current scene
   * @return The path to userdata folder
   */
  gdjs.fileSystem.getUserdataPath = function (
    runtimeScene: gdjs.RuntimeScene
  ): string {
    const electron = runtimeScene.getGame().getRenderer().getElectron();
    if (electron) {
      return electron.remote.app.getPath('userData') || '';
    } else {
      return '';
    }
  };

  /**
   * Get the path to the user's home folder (on Windows `C:\Users\<USERNAME>\` for example).
   * @return The path to user's "home" folder
   */
  gdjs.fileSystem.getUserHomePath = function (runtimeScene): string {
    const electron = runtimeScene.getGame().getRenderer().getElectron();
    if (electron) {
      return electron.remote.app.getPath('home') || '';
    } else {
      return '';
    }
  };

  /**
   * Get the path to 'Temp' folder.
   * @param runtimeScene The current scene
   * @return The path to temp folder
   */
  gdjs.fileSystem.getTempPath = function (
    runtimeScene: gdjs.RuntimeScene
  ): string {
    const electron = runtimeScene.getGame().getRenderer().getElectron();
    if (electron) {
      return electron.remote.app.getPath('temp') || '';
    } else {
      return '';
    }
  };

  /**
   * Get the path delimiter specific to the operating system.
   * @return The path delimiter
   */
  gdjs.fileSystem.getPathDelimiter = function (): string {
    const path = gdjs.fileSystem._getPath();
    if (path) {
      return path.sep || '/';
    } else {
      return '/';
    }
  };

  /**
   * Create a new directory at the given path.
   * @param directory The path to create a new directory
   * @param resultVar The variable where to store the result of the operation
   */
  gdjs.fileSystem.makeDirectory = function (
    directory: string,
    resultVar: gdjs.Variable
  ) {
    const fileSystem = gdjs.fileSystem._getFs();
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
   * @param text The string to be saved
   * @param savePath Path to the file
   * @param resultVar The variable where to store the result of the operation
   */
  gdjs.fileSystem.saveStringToFileAsync = function (
    text: string,
    savePath: string,
    resultVar: gdjs.Variable
  ) {
    const fileSystem = gdjs.fileSystem._getFs();
    if (fileSystem) {
      fileSystem.writeFile(savePath, text, 'utf8', (err) => {
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
   * @param text The string to be saved
   * @param savePath Path to the file
   * @param resultVar The variable where to store the result of the operation
   */
  gdjs.fileSystem.saveStringToFile = function (
    text: string,
    savePath: string,
    resultVar: gdjs.Variable
  ) {
    const fileSystem = gdjs.fileSystem._getFs();
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
   * @param variable The variable to be saved
   * @param savePath Path to the file
   * @param resultVar The variable where to store the result of the operation
   */
  gdjs.fileSystem.saveVariableToJSONFile = function (
    variable: gdjs.Variable,
    savePath: string,
    resultVar: gdjs.Variable
  ) {
    const fileSystem = gdjs.fileSystem._getFs();
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
   * @param variable The variable to be saved
   * @param savePath Path to the file
   * @param resultVar The variable where to store the result of the operation
   */
  gdjs.fileSystem.saveVariableToJSONFileAsync = function (
    variable: gdjs.Variable,
    savePath: string,
    resultVar: gdjs.Variable
  ) {
    const fileSystem = gdjs.fileSystem._getFs();
    const network = gdjs.evtTools.network;
    if (fileSystem && network) {
      fileSystem.writeFile(
        savePath,
        network.variableStructureToJSON(variable),
        'utf8',
        (err) => {
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
   * @param stringVar Variable where to store the content
   * @param loadPath Path to the file
   * @param resultVar The variable where to store the result of the operation
   */
  gdjs.fileSystem.loadStringFromFile = function (
    stringVar: gdjs.Variable,
    loadPath: string,
    resultVar: gdjs.Variable
  ) {
    const fileSystem = gdjs.fileSystem._getFs();
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
   * @param variable Variable to store the variable
   * @param loadPath Path to the file
   * @param resultVar The variable where to store the result of the operation
   */
  gdjs.fileSystem.loadVariableFromJSONFile = function (
    variable: gdjs.Variable,
    loadPath: string,
    resultVar: gdjs.Variable
  ) {
    const fileSystem = gdjs.fileSystem._getFs();
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
   * @param variable Variable to store the variable
   * @param loadPath Path to the file
   * @param resultVar The variable where to store the result of the operation
   */
  gdjs.fileSystem.loadVariableFromJSONFileAsync = function (
    variable: gdjs.Variable,
    loadPath: string,
    resultVar: gdjs.Variable
  ) {
    const fileSystem = gdjs.fileSystem._getFs();
    const network = gdjs.evtTools.network;
    if (fileSystem && network) {
      fileSystem.readFile(loadPath, 'utf8', (err, data) => {
        if (data) {
          network.jsonToVariableStructure(data, variable);
          resultVar.setString('ok');
        }
        if (err) {
          console.error(
            "Unable to load variable from the file at path: '" +
              loadPath +
              "': ",
            err
          );
          resultVar.setString('error');
        }
      });
    }
  };

  /**
   * Load a string from a file into a scene variable, asynchronously.
   * @param stringVar Variable where to store the content
   * @param loadPath Path to the file
   * @param resultVar The variable where to store the result of the operation
   */
  gdjs.fileSystem.loadStringFromFileAsync = function (
    stringVar: gdjs.Variable,
    loadPath: string,
    resultVar: gdjs.Variable
  ) {
    const fileSystem = gdjs.fileSystem._getFs();
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
   * @param filePath Path to the file
   * @param resultVar The variable where to store the result of the operation
   */
  gdjs.fileSystem.deleteFile = function (
    filePath: string,
    resultVar: gdjs.Variable
  ) {
    const fileSystem = gdjs.fileSystem._getFs();
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
   * @param filePath Path to the file
   * @param resultVar The variable where to store the result of the operation
   */
  gdjs.fileSystem.deleteFileAsync = function (
    filePath: string,
    resultVar: gdjs.Variable
  ) {
    const fileSystem = gdjs.fileSystem._getFs();
    if (fileSystem) {
      fileSystem.unlink(filePath, (err) => {
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
   * @param filePath The path to the file or directory
   * @return true if fhe file or directory exists
   */
  gdjs.fileSystem.pathExists = function (filePath: string): boolean {
    const fileSystem = gdjs.fileSystem._getFs();
    if (fileSystem) {
      return fileSystem.existsSync(filePath);
    } else {
      return false;
    }
  };
}
