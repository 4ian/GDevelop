// @flow
// Note: this file does not use export/imports and use Flow comments to allow its usage from Node.js

const some = require('lodash/some');
/*flow-include
export type TranslationFunction = (string) => string;

export type JsExtensionModule = {
  createExtension(_: TranslationFunction, gd: any): gdPlatformExtension,
  runExtensionSanityTests(gd: any, extension: gdPlatformExtension): Array<string>,
};

export type ExtensionLoadingResult = {
  error: boolean,
  message: string,
  dangerous?: boolean,
  rawError?: any,
};

export interface JsExtensionsLoader {
  loadAllExtensions(_: TranslationFunction): Promise<
    Array<{ extensionModulePath: string, result: ExtensionLoadingResult }>
  >,
}
*/

/**
 * Run extensions tests and check for any non-empty results.
 */
const runExtensionSanityTests = (
  gd /*: any */,
  extension /*: gdPlatformExtension*/,
  jsExtensionModule /*: JsExtensionModule*/
) /*: ExtensionLoadingResult*/ => {
  if (!jsExtensionModule.runExtensionSanityTests) {
    return {
      error: true,
      message:
        'Missing runExtensionSanityTests in the extension module exports',
    };
  }

  const testResults = jsExtensionModule.runExtensionSanityTests(gd, extension);
  if (some(testResults)) {
    return {
      error: true,
      message: 'One or more tests are failing for the extension (see rawError)',
      rawError: testResults,
    };
  }

  return {
    error: false,
    message: 'Tests passed successfully',
  };
};

/**
 * Load an extension from the specified JavaScript module, which is supposed
 * to contain a "createExtension" function returning a gd.PlatformExtension.
 */
const loadExtension = (
  _ /*: TranslationFunction */,
  gd /*: any */,
  platform /*: gdJsPlatform*/,
  jsExtensionModule /*: JsExtensionModule*/
) /*: ExtensionLoadingResult*/ => {
  if (!jsExtensionModule.createExtension) {
    return {
      message:
        'Extension module found, but no createExtension method is exported',
      error: true,
    };
  }

  let extension = null;
  try {
    extension = jsExtensionModule.createExtension(_, gd);
    if (!extension) {
      return {
        message: `createExtension did not return any extension. Did you forget to return the extension created?`,
        error: true,
      };
    }
  } catch (ex) {
    return {
      message: `🚨 Exception caught while running createExtension. 💣 Please fix this error as this will make GDevelop crash at some point.`,
      error: true,
      dangerous: true,
      rawError: ex,
    };
  }

  try {
    const testsResult = runExtensionSanityTests(
      gd,
      extension,
      jsExtensionModule
    );
    if (testsResult.error) {
      extension.delete();
      return testsResult;
    }
  } catch (ex) {
    return {
      message: `🚨 Exception caught while running runExtensionSanityTests. 💣 Please fix this error as this will make GDevelop crash at some point.`,
      error: true,
      dangerous: true,
      rawError: ex,
    };
  }

  platform.addNewExtension(extension);
  extension.delete(); // Release the extension as it was copied inside gd.JsPlatform

  return {
    message: '✅ Successfully loaded the extension.',
    error: false,
  };
};

module.exports = {
  runExtensionSanityTests,
  loadExtension,
};
