// @flow
const gd = global.gd;

const t = _ => _; //TODO: Implement support for i18n for extensions.

export type JsExtensionModule = {
  createExtension(t, gd): gdPlatformExtension,
};

export type ExtensionLoadingResult = {
  error: boolean,
  message: string,
  rawError?: any,
};

export interface JsExtensionsLoader {
  loadAllExtensions(): Promise<Array<ExtensionLoadingResult>>;
}

/**
 * Load an extension from the specified JavaScript module, which is supposed
 * to contain a "createExtension" function returning a gd.PlatformExtension.
 */
export const loadExtension = (
  platform: gdPlatform,
  jsExtensionModule: JsExtensionModule
): ExtensionLoadingResult => {
  if (!jsExtensionModule.createExtension) {
    return {
      message:
        'Extension module found, but no createExtension method is exported',
      error: true,
    };
  }

  let extension = null;
  try {
    extension = jsExtensionModule.createExtension(t, gd);
    if (!extension) {
      return {
        message: `createExtension did not return any extension. Did you forget to return the extension created?`,
        error: true,
      };
    }
  } catch (ex) {
    return {
      message: `Exception caught while running createExtension. Please fix this error as this could make GDevelop unstable/crash.`,
      error: true,
      rawError: ex,
    };
  }

  platform.addNewExtension(extension);
  extension.delete(); // Release the extension as it was copied inside gd.JsPlatform

  return {
    message: 'Successfully loaded the extension.',
    error: false,
  };
};
