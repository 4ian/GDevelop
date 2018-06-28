// @flow
import {
  type JsExtensionsLoader,
  type ExtensionLoadingResult,
  loadExtension,
} from '.';
import optionalRequire from '../Utils/OptionalRequire';
import { findJsExtensionModules } from './LocalJsExtensionsFinder';
const gd = global.gd;

/**
 * Loader that will find all JS extensions declared in GDJS/Runtime/Extensions/xxx/JsExtension.js.
 * If you add a new extension and also want it to be available for the web-app version, add it in 
 * BrowserJsExtensionsLoader.js
 */
export default class LocalJsExtensionsLoader implements JsExtensionsLoader {
  loadAllExtensions(): Promise<
    Array<{ extensionModulePath: string, result: ExtensionLoadingResult }>
  > {
    return findJsExtensionModules().then(
      extensionModulePaths => {
        return Promise.all(
          extensionModulePaths.map((extensionModulePath) => {
            console.log(extensionModulePath);
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

            if (extensionModule) {
              return {
                extensionModulePath,
                result: loadExtension(gd.JsPlatform.get(), extensionModule),
              };
            }

            return {
              extensionModulePath,
              result: {
                error: true,
                message:
                  'Unknown error. Please check for any syntax error or error that would prevent it from being run.',
              },
            };
          })
        );
      },
      err => {
        console.error(`Unable to find JS extensions modules`);
        throw err;
      }
    );
  }
}
