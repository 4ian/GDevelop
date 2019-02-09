// @flow
import {
  type JsExtensionsLoader,
  type ExtensionLoadingResult,
  type TranslationFunction,
  loadExtension,
} from '.';
import ObjectsEditorService from '../ObjectEditor/ObjectsEditorService';
import ObjectsRenderingService from '../ObjectsRendering/ObjectsRenderingService';
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
  {
    name: 'ExampleJsExtension',
    extensionModule: require('GDJS-for-web-app-only/Runtime/Extensions/ExampleJsExtension/JsExtension.js'),
  },
];

type MakeExtensionsLoaderArguments = {|
  objectsEditorService: typeof ObjectsEditorService,
  objectsRenderingService: typeof ObjectsRenderingService,
  filterExamples: boolean,
|};

/**
 * Loader that load all JS extensions required in this file.
 * Extensions are usually auto-discovered when declared in Extensions/xxx/JsExtension.js, but not
 * for the web-app where everything must be bundled.
 */
export default function makeExtensionsLoader({
  objectsEditorService,
  objectsRenderingService,
  filterExamples,
}: MakeExtensionsLoaderArguments): JsExtensionsLoader {
  return {
    loadAllExtensions(
      _: TranslationFunction
    ): Promise<
      Array<{ extensionModulePath: string, result: ExtensionLoadingResult }>
    > {
      return Promise.resolve(
        jsExtensions
          .filter(({ name }) => !filterExamples || !name.includes('Example'))
          .map(({ name, extensionModule }) => {
            // Load any editor for objects, if we have somewhere where
            // to register them.
            if (
              objectsEditorService &&
              extensionModule.registerEditorConfigurations
            ) {
              extensionModule.registerEditorConfigurations(
                objectsEditorService
              );
            }

            // Load any renderer for objects, if we have somewhere where
            // to register them.
            if (
              objectsRenderingService &&
              extensionModule.registerInstanceRenderers
            ) {
              extensionModule.registerInstanceRenderers(
                objectsRenderingService
              );
            }

            return {
              extensionModulePath: 'internal-extension://' + name,
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
  };
}
