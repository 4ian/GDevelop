// @flow
// Note: this file does not use export/imports and use Flow comments to allow its usage from Node.js

const { loadExtension } = require('.');
const optionalRequire = require('../Utils/OptionalRequire');
const { findJsExtensionModules } = require('./LocalJsExtensionsFinder');

/*flow-include
import type {JsExtensionsLoader, TranslationFunction} from '.';
import ObjectsEditorService from '../ObjectEditor/ObjectsEditorService';
import ObjectsRenderingService from '../ObjectsRendering/ObjectsRenderingService';

type MakeExtensionsLoaderArguments = {|
  gd: any,
  objectsEditorService: typeof ObjectsEditorService,
  objectsRenderingService: typeof ObjectsRenderingService,
  filterExamples: boolean,
  onFindGDJS?: ?() => Promise<{gdjsRoot: string}>
|};
*/

/**
 * Loader that will find all JS extensions declared in GDJS/Runtime/Extensions/xxx/JsExtension.js.
 * If you add a new extension and also want it to be available for the web-app version, add it in
 * BrowserJsExtensionsLoader.js
 */
module.exports = function makeExtensionsLoader(
  {
    gd,
    objectsEditorService,
    objectsRenderingService,
    filterExamples,
    onFindGDJS,
  } /*: MakeExtensionsLoaderArguments*/
) /*: JsExtensionsLoader*/ {
  return {
    loadAllExtensions: (_ /*: TranslationFunction */) => {
      return findJsExtensionModules({ filterExamples, onFindGDJS }).then(
        extensionModulePaths => {
          return Promise.all(
            extensionModulePaths.map(extensionModulePath => {
              let extensionModule = null;
              try {
                extensionModule = optionalRequire(extensionModulePath, {
                  rethrowException: true,
                });
              } catch (ex) {
                return {
                  extensionModulePath,
                  result: {
                    message:
                      'Unable to import extension. Please check for any syntax error or error that would prevent it from being run.',
                    error: true,
                    rawError: ex,
                  },
                };
              }

              if (!extensionModule) {
                return {
                  extensionModulePath,
                  result: {
                    error: true,
                    message:
                      'Unknown error. Please check for any syntax error or error that would prevent it from being run.',
                  },
                };
              }

              if (
                objectsEditorService &&
                extensionModule.registerEditorConfigurations
              ) {
                extensionModule.registerEditorConfigurations(
                  objectsEditorService
                );
              }

              if (objectsRenderingService) {
                if (extensionModule.registerInstanceRenderers) {
                  extensionModule.registerInstanceRenderers(
                    objectsRenderingService
                  );
                }
                if (extensionModule.registerClearCache) {
                  extensionModule.registerClearCache(objectsRenderingService);
                }
              }

              return {
                extensionModulePath,
                result: loadExtension(
                  _,
                  gd,
                  gd.JsPlatform.get(),
                  extensionModule
                ),
              };
            })
          );
        },
        err => {
          console.error(`Unable to find JS extensions modules`);
          throw err;
        }
      );
    },
  };
};
