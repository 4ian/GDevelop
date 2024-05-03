namespace gdjs {
  const logger = new gdjs.Logger('Filesystem');
  export namespace fileSystem {
    // The Node.js path module, or null if it can't be loaded.
    const path: typeof import('path') | null =
      typeof require !== 'undefined' ? require('path') : null;
    // The Node.js fs module, or null if it can't be loaded.
    const fs: typeof import('fs') | null =
      typeof require !== 'undefined' ? require('fs') : null;
    const asyncFs: typeof import('fs/promises') | null =
      typeof require !== 'undefined' ? require('fs/promises') : null;

    if (!fs)
      logger.warn(
        'Filesystem is not supported on this platform! Only PC builds support filesystem access.'
      );

    export const getDirectoryName = function (fileOrFolderPath: string) {
      if (!path) {
        return '';
      }
      return path.dirname(fileOrFolderPath);
    };

    export const getFileName = function (filePath: string) {
      if (!path) {
        return '';
      }
      return path.basename(filePath);
    };

    export const getExtensionName = function (filePath: string) {
      if (!path) {
        return '';
      }
      return path.extname(filePath);
    };

    /**
     * Get the path to 'Desktop' folder.
     * @param instanceContainer The current container
     * @return The path to the desktop folder
     */
    export const getDesktopPath = function (
      instanceContainer: gdjs.RuntimeInstanceContainer
    ): string {
      const remote = instanceContainer
        .getGame()
        .getRenderer()
        .getElectronRemote();
      const app = remote ? remote.app : null;
      if (app) {
        return app.getPath('desktop') || '';
      } else {
        return '';
      }
    };

    /**
     * Get the path to 'Documents' folder.
     * @param instanceContainer The current container
     * @return The path to the documents folder
     */
    export const getDocumentsPath = function (
      instanceContainer: gdjs.RuntimeInstanceContainer
    ): string {
      const remote = instanceContainer
        .getGame()
        .getRenderer()
        .getElectronRemote();
      const app = remote ? remote.app : null;
      if (app) {
        return app.getPath('documents') || '';
      } else {
        return '';
      }
    };

    /**
     * Get the path to 'Pictures' folder.
     * @param instanceContainer The current container
     * @return The path to the pictures folder
     */
    export const getPicturesPath = function (
      instanceContainer: gdjs.RuntimeInstanceContainer
    ): string {
      const remote = instanceContainer
        .getGame()
        .getRenderer()
        .getElectronRemote();
      const app = remote ? remote.app : null;
      if (app) {
        return app.getPath('pictures') || '';
      } else {
        return '';
      }
    };

    /**
     * Get the path to this application 'Executable' file.
     * @param instanceContainer The current container
     * @return The path to this applications executable file
     */
    export const getExecutablePath = function (
      instanceContainer: gdjs.RuntimeInstanceContainer
    ): string {
      const remote = instanceContainer
        .getGame()
        .getRenderer()
        .getElectronRemote();
      const app = remote ? remote.app : null;
      if (app) {
        return app.getPath('exe') || '';
      } else {
        return '';
      }
    };

    /**
     * Get the path to this application 'Executable' folder.
     * @param instanceContainer The current container
     * @return The path to this applications executable folder
     */
    export const getExecutableFolderPath = function (
      instanceContainer: gdjs.RuntimeInstanceContainer
    ): string {
      const executablePath = getExecutablePath(instanceContainer);
      if (!path) {
        return '';
      }
      return path.dirname(executablePath);
    };

    /**
     * Get the path to 'UserData' folder.
     * @param instanceContainer The current container
     * @return The path to userdata folder
     */
    export const getUserdataPath = function (
      instanceContainer: gdjs.RuntimeInstanceContainer
    ): string {
      const remote = instanceContainer
        .getGame()
        .getRenderer()
        .getElectronRemote();
      const app = remote ? remote.app : null;
      if (app) {
        return app.getPath('userData') || '';
      } else {
        return '';
      }
    };

    /**
     * Get the path to the user's home folder (on Windows `C:\Users\<USERNAME>\` for example).
     * @return The path to user's "home" folder
     */
    export const getUserHomePath = function (
      instanceContainer: gdjs.RuntimeInstanceContainer
    ): string {
      const remote = instanceContainer
        .getGame()
        .getRenderer()
        .getElectronRemote();
      const app = remote ? remote.app : null;
      if (app) {
        return app.getPath('home') || '';
      } else {
        return '';
      }
    };

    /**
     * Get the path to 'Temp' folder.
     * @param instanceContainer The current container
     * @return The path to temp folder
     */
    export const getTempPath = function (
      instanceContainer: gdjs.RuntimeInstanceContainer
    ): string {
      const remote = instanceContainer
        .getGame()
        .getRenderer()
        .getElectronRemote();
      const app = remote ? remote.app : null;
      if (app) {
        return app.getPath('temp') || '';
      } else {
        return '';
      }
    };

    /**
     * Get the path delimiter specific to the operating system.
     * @return The path delimiter
     */
    export const getPathDelimiter = function (): string {
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
    export const makeDirectory = function (
      directory: string,
      resultVar: gdjs.Variable
    ) {
      let result = 'error';
      if (fs) {
        try {
          fs.mkdirSync(directory);
          result = 'ok';
        } catch (err) {
          logger.error(
            "Unable to create directory at: '" + directory + "': ",
            err
          );
        }
      }
      resultVar.setString(result);
    };

    export const makeDirectoryAsync = (
      directory: string,
      resultVar: gdjs.Variable
    ) =>
      asyncFs
        ? new gdjs.PromiseTask(
            asyncFs
              .mkdir(directory, { recursive: true })
              .then(() => {
                resultVar.setString('ok');
              })
              .catch((err) => {
                resultVar.setString('error');
                logger.error(
                  "Unable to create directory at: '" + directory + "': ",
                  err
                );
              })
          )
        : (resultVar.setString('error'), new gdjs.ResolveTask());

    /**
     * Save a string into a file, asynchronously.
     * @param text The string to be saved
     * @param savePath Path to the file
     * @param resultVar The variable where to store the result of the operation
     */
    export const saveStringToFileAsync = function (
      text: string,
      savePath: string,
      resultVar: gdjs.Variable
    ) {
      if (fs) {
        fs.writeFile(savePath, text, 'utf8', (err) => {
          resultVar.setString('ok');
          if (err) {
            logger.error(
              "Unable to save the text to path: '" + savePath + "': ",
              err
            );
            resultVar.setString('error');
          }
        });
      }
    };

    export const saveStringToFileAsyncTask = (
      text: string,
      savePath: string,
      resultVar: gdjs.Variable
    ) =>
      asyncFs
        ? new gdjs.PromiseTask(
            asyncFs
              .writeFile(savePath, text, { encoding: 'utf8' })
              .then(() => {
                resultVar.setString('ok');
              })
              .catch((err) => {
                resultVar.setString('error');
                logger.error(
                  "Unable to save the text to path: '" + savePath + "': ",
                  err
                );
              })
          )
        : (resultVar.setString('error'), new gdjs.ResolveTask());

    /**
     * Save a string into a file.
     * @param text The string to be saved
     * @param savePath Path to the file
     * @param resultVar The variable where to store the result of the operation
     */
    export const saveStringToFile = function (
      text: string,
      savePath: string,
      resultVar: gdjs.Variable
    ) {
      let result = 'error';
      if (fs) {
        try {
          fs.writeFileSync(savePath, text, 'utf8');
          result = 'ok';
        } catch (err) {
          logger.error(
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
    export const saveVariableToJSONFile = function (
      variable: gdjs.Variable,
      savePath: string,
      resultVar: gdjs.Variable
    ) {
      let result = 'error';
      if (fs) {
        try {
          fs.writeFileSync(
            savePath,
            JSON.stringify(variable.toJSObject()),
            'utf8'
          );
          result = 'ok';
        } catch (err) {
          logger.error(
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
    export const saveVariableToJSONFileAsync = function (
      variable: gdjs.Variable,
      savePath: string,
      resultVar: gdjs.Variable
    ) {
      if (fs) {
        fs.writeFile(
          savePath,
          JSON.stringify(variable.toJSObject()),
          'utf8',
          (err) => {
            resultVar.setString('ok');
            if (err) {
              logger.error(
                "Unable to save the variable to path: '" + savePath + "': ",
                err
              );
              resultVar.setString('error');
            }
          }
        );
      }
    };

    export const saveVariableToJSONFileAsyncTask = (
      variable: gdjs.Variable,
      savePath: string,
      resultVar: gdjs.Variable
    ) =>
      asyncFs
        ? new gdjs.PromiseTask(
            asyncFs
              .writeFile(savePath, JSON.stringify(variable.toJSObject()), {
                encoding: 'utf8',
              })
              .then(() => {
                resultVar.setString('ok');
              })
              .catch((err) => {
                resultVar.setString('error');
                logger.error(
                  "Unable to save the text to path: '" + savePath + "': ",
                  err
                );
              })
          )
        : (resultVar.setString('error'), new gdjs.ResolveTask());

    /**
     * Load a string from a file into a scene variable.
     * @param stringVar Variable where to store the content
     * @param loadPath Path to the file
     * @param resultVar The variable where to store the result of the operation
     * @param removeCRCharacters If true, will remove \r characters usually added by Windows when editing files
     */
    export const loadStringFromFile = function (
      stringVar: gdjs.Variable,
      loadPath: string,
      resultVar: gdjs.Variable,
      removeCRCharacters: boolean
    ) {
      let result = 'error';
      if (fs) {
        try {
          const data = fs.readFileSync(loadPath, 'utf8');
          if (data) {
            stringVar.setString(
              removeCRCharacters ? data.replace(/\r/g, '') : data
            );
            result = 'ok';
          }
        } catch (err) {
          logger.error(
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
     * @param removeCRCharacters If true, will remove \r characters usually added by Windows when editing files
     */
    export const loadVariableFromJSONFile = function (
      variable: gdjs.Variable,
      loadPath: string,
      resultVar: gdjs.Variable,
      removeCRCharacters: boolean
    ) {
      let result = 'error';
      if (fs) {
        try {
          const data = fs.readFileSync(loadPath, 'utf8');
          if (data) {
            variable.fromJSON(
              removeCRCharacters ? data.replace(/\r/g, '') : data
            );
            result = 'ok';
          }
        } catch (err) {
          logger.error(
            "Unable to load variable from the file at path: '" +
              loadPath +
              "': ",
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
     * @param removeCRCharacters If true, will remove \r characters usually added by Windows when editing files
     */
    export const loadVariableFromJSONFileAsync = function (
      variable: gdjs.Variable,
      loadPath: string,
      resultVar: gdjs.Variable,
      removeCRCharacters: boolean
    ) {
      if (fs) {
        fs.readFile(loadPath, 'utf8', (err, data) => {
          if (data) {
            variable.fromJSON(
              removeCRCharacters ? data.replace(/\r/g, '') : data
            );
            resultVar.setString('ok');
          }
          if (err) {
            logger.error(
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

    export const loadVariableFromJSONFileAsyncTask = (
      variable: gdjs.Variable,
      loadPath: string,
      resultVar: gdjs.Variable,
      removeCRCharacters: boolean
    ) =>
      asyncFs
        ? new gdjs.PromiseTask(
            asyncFs
              .readFile(loadPath, { encoding: 'utf8' })
              .then((data) => {
                if (data)
                  variable.fromJSON(
                    removeCRCharacters ? data.replace(/\r/g, '') : data
                  );
                resultVar.setString('ok');
              })
              .catch((err) => {
                resultVar.setString('error');
                logger.error(
                  "Unable to load the JSON file from path: '" +
                    loadPath +
                    "': ",
                  err
                );
              })
          )
        : (resultVar.setString('error'), new gdjs.ResolveTask());

    /**
     * Load a string from a file into a scene variable, asynchronously.
     * @param stringVar Variable where to store the content
     * @param loadPath Path to the file
     * @param resultVar The variable where to store the result of the operation
     * @param removeCRCharacters If true, will remove \r characters usually added by Windows when editing files
     */
    export const loadStringFromFileAsync = function (
      stringVar: gdjs.Variable,
      loadPath: string,
      resultVar: gdjs.Variable,
      removeCRCharacters: boolean
    ) {
      if (fs) {
        fs.readFile(loadPath, 'utf8', (err, data) => {
          if (data) {
            stringVar.setString(
              removeCRCharacters ? data.replace(/\r/g, '') : data
            );
            resultVar.setString('ok');
          }
          if (err) {
            logger.error(
              "Unable to load the file at path: '" + loadPath + "': ",
              err
            );
            resultVar.setString('error');
          }
        });
      }
    };

    export const loadStringFromFileAsyncTask = (
      variable: gdjs.Variable,
      loadPath: string,
      resultVar: gdjs.Variable,
      removeCRCharacters: boolean
    ) =>
      asyncFs
        ? new gdjs.PromiseTask(
            asyncFs
              .readFile(loadPath, { encoding: 'utf8' })
              .then((data) => {
                if (data)
                  variable.setString(
                    removeCRCharacters ? data.replace(/\r/g, '') : data
                  );
                resultVar.setString('ok');
              })
              .catch((err) => {
                resultVar.setString('error');
                logger.error(
                  "Unable to load the text file from path: '" +
                    loadPath +
                    "': ",
                  err
                );
              })
          )
        : (resultVar.setString('error'), new gdjs.ResolveTask());

    /**
     * Delete a file from the filesystem.
     * @param filePath Path to the file
     * @param resultVar The variable where to store the result of the operation
     */
    export const deleteFile = function (
      filePath: string,
      resultVar: gdjs.Variable
    ) {
      let result = 'error';
      if (fs) {
        try {
          fs.unlinkSync(filePath);
          result = 'ok';
        } catch (err) {
          logger.error("Unable to delete the file: '" + filePath + "': ", err);
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
    export const deleteFileAsync = function (
      filePath: string,
      resultVar: gdjs.Variable
    ) {
      if (fs) {
        fs.unlink(filePath, (err) => {
          resultVar.setString('ok');
          if (err) {
            logger.error(
              "Unable to delete the file: '" + filePath + "': ",
              err
            );
            resultVar.setString('error');
          }
        });
      }
    };

    export const deleteFileAsyncTask = (
      filePath: string,
      resultVar: gdjs.Variable
    ) =>
      asyncFs
        ? new gdjs.PromiseTask(
            asyncFs
              .rm(filePath, { recursive: true })
              .then(() => {
                resultVar.setString('ok');
              })
              .catch((err) => {
                resultVar.setString('error');
                logger.error(
                  "Unable to delete the file: '" + filePath + "': ",
                  err
                );
              })
          )
        : (resultVar.setString('error'), new gdjs.ResolveTask());

    /**
     * Check if the file or directory exists.
     * @param filePath The path to the file or directory
     * @return true if fhe file or directory exists
     */
    export const pathExists = function (filePath: string): boolean {
      if (fs) {
        return fs.existsSync(filePath);
      } else {
        return false;
      }
    };
  }
}
