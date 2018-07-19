// @flow
import { findGDJS } from '../Export/LocalExporters/LocalGDJSFinder';
import optionalRequire from '../Utils/OptionalRequire';
import Window from '../Utils/Window';
const path = optionalRequire('path');
const fs = optionalRequire('fs');

const checkIfPathHasJsExtensionModule = (
  extensionFolderPath
): Promise<?string> => {
  return new Promise(resolve => {
    const jsExtensionModulePath = path.join(
      extensionFolderPath,
      'JsExtension.js'
    );
    fs.stat(jsExtensionModulePath, (err, stats) => {
      if (err) {
        return resolve(null);
      }

      return resolve(stats.isFile() ? jsExtensionModulePath : null);
    });
  });
};

export const findJsExtensionModules = (): Promise<any> => {
  return new Promise((resolve, reject) => {
    findGDJS((gdjsRoot: ?string) => {
      if (!gdjsRoot) {
        return reject();
      }

      const extensionsRoot = path.join(gdjsRoot, 'Runtime', 'Extensions');
      console.info(
        `Searching for JS extensions (file called JsExtension.js) in ${extensionsRoot}...`
      );
      fs.readdir(extensionsRoot, (error, extensionFolders) => {
        if (error) {
          return reject(error);
        }

        const filteredExtensionFolders = extensionFolders.filter(folder => {
          if (Window.isDev()) return true;

          return folder.indexOf("Example") === -1;
        })

        Promise.all(
          filteredExtensionFolders.map(extensionFolder =>
            checkIfPathHasJsExtensionModule(
              path.join(extensionsRoot, extensionFolder)
            )
          )
        ).then(modulePaths => {
          resolve(modulePaths.filter(modulePath => !!modulePath));
        }, reject);
      });
    });
  });
};
