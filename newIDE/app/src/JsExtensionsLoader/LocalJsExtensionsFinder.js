// Note: this file does not use export/imports nor Flow to allow its usage from Node.js

const { findGDJS } = require('../GameEngineFinder/LocalGDJSFinder');
const optionalRequire = require('../Utils/OptionalRequire');
const path = optionalRequire('path');
const fs = optionalRequire('fs');

const checkIfPathHasJsExtensionModule = extensionFolderPath => {
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

const findJsExtensionModules = ({ filterExamples, onFindGDJS }) => {
  return (onFindGDJS ? onFindGDJS() : findGDJS()).then(({ gdjsRoot }) => {
    const extensionsRoot = path.join(gdjsRoot, 'Runtime', 'Extensions');
    console.info(
      `Searching for JS extensions (file called JsExtension.js) in ${extensionsRoot}...`
    );
    return new Promise((resolve, reject) => {
      fs.readdir(extensionsRoot, (error, extensionFolders) => {
        if (error) {
          return reject(error);
        }

        const filteredExtensionFolders = extensionFolders.filter(folder => {
          if (!filterExamples) return true;

          return folder.indexOf('Example') === -1;
        });

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

module.exports = {
  findJsExtensionModules,
};
