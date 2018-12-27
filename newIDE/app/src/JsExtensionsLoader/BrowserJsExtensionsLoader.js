// @flow
import {
  type JsExtensionsLoader,
  type ExtensionLoadingResult,
  loadExtension,
} from '.';
const gd = global.gd;

const jsExtensions = [
  {
    name: 'AdMob',
    extensionModule: require('GDJS-for-web-app-only/Runtime/Extensions/AdMob/JsExtension.js'),
  },
  {
    name: 'FacebookInstantGames',
    extensionModule: require('GDJS-for-web-app-only/Runtime/Extensions/FacebookInstantGames/JsExtension.js'),
  },
  {
    name: 'DeviceSensors',
    extensionModule: require('GDJS-for-web-app-only/Runtime/Extensions/DeviceSensors/JsExtension.js'),
  },
  {
    name: 'DeviceVibration',
    extensionModule: require('GDJS-for-web-app-only/Runtime/Extensions/DeviceVibration/JsExtension.js'),
  },
  {
    name: 'Physics2',
    extensionModule: require('GDJS-for-web-app-only/Runtime/Extensions/Physics2Behavior/JsExtension.js'),
  },
];

/**
 * Loader that load all JS extensions required in this file.
 * Extensions are usually auto-discovered when declared in Extensions/xxx/JsExtension.js, but not
 * for the web-app where everything must be bundled.
 */
export default class BrowserJsExtensionsLoader implements JsExtensionsLoader {
  loadAllExtensions(): Promise<
    Array<{ extensionModulePath: string, result: ExtensionLoadingResult }>
  > {
    return Promise.resolve(
      jsExtensions.map(({ name, extensionModule }) => ({
        extensionModulePath: 'internal-extension://' + name,
        result: loadExtension(gd, gd.JsPlatform.get(), extensionModule),
      }))
    );
  }
}
