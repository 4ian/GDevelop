// @flow
import {
  type JsExtensionsLoader,
  type ExtensionLoadingResult,
  type TranslationFunction,
  loadExtension,
} from '.';
import ObjectsEditorService from '../ObjectEditor/ObjectsEditorService';
import ObjectsRenderingService from '../ObjectsRendering/ObjectsRenderingService';
const gd: libGDevelop = global.gd;

// The list of "JsExtension.js" files to be bundled in the webapp, keyed by their extension name.
const jsExtensions = [
  {
    name: 'AdMob',
    // $FlowExpectedError - this path is ignored for Flow.
    extensionModule: require('GDJS-for-web-app-only/Runtime/Extensions/AdMob/JsExtension.js'),
    objectsRenderingServiceModules: {},
  },
  {
    name: 'FacebookInstantGames',
    // $FlowExpectedError - this path is ignored for Flow.
    extensionModule: require('GDJS-for-web-app-only/Runtime/Extensions/FacebookInstantGames/JsExtension.js'),
    objectsRenderingServiceModules: {},
  },
  {
    name: 'DeviceSensors',
    // $FlowExpectedError - this path is ignored for Flow.
    extensionModule: require('GDJS-for-web-app-only/Runtime/Extensions/DeviceSensors/JsExtension.js'),
    objectsRenderingServiceModules: {},
  },
  {
    name: 'DeviceVibration',
    // $FlowExpectedError - this path is ignored for Flow.
    extensionModule: require('GDJS-for-web-app-only/Runtime/Extensions/DeviceVibration/JsExtension.js'),
    objectsRenderingServiceModules: {},
  },
  {
    name: 'DebuggerTools',
    // $FlowExpectedError - this path is ignored for Flow.
    extensionModule: require('GDJS-for-web-app-only/Runtime/Extensions/DebuggerTools/JsExtension.js'),
    objectsRenderingServiceModules: {},
  },
  {
    name: 'Physics2',
    // $FlowExpectedError - this path is ignored for Flow.
    extensionModule: require('GDJS-for-web-app-only/Runtime/Extensions/Physics2Behavior/JsExtension.js'),
    objectsRenderingServiceModules: {},
  },
  {
    name: 'ExampleJsExtension',
    // $FlowExpectedError - this path is ignored for Flow.
    extensionModule: require('GDJS-for-web-app-only/Runtime/Extensions/ExampleJsExtension/JsExtension.js'),
    objectsRenderingServiceModules: {},
  },
  {
    name: 'Tween',
    // $FlowExpectedError - this path is ignored for Flow.
    extensionModule: require('GDJS-for-web-app-only/Runtime/Extensions/TweenBehavior/JsExtension.js'),
    objectsRenderingServiceModules: {},
  },
  {
    name: 'Video',
    // $FlowExpectedError - this path is ignored for Flow.
    extensionModule: require('GDJS-for-web-app-only/Runtime/Extensions/Video/JsExtension.js'),
    objectsRenderingServiceModules: {},
  },
  {
    name: 'FileSystem',
    // $FlowExpectedError - this path is ignored for Flow.
    extensionModule: require('GDJS-for-web-app-only/Runtime/Extensions/FileSystem/JsExtension.js'),
    objectsRenderingServiceModules: {},
  },
  {
    name: 'Firebase',
    // $FlowExpectedError - this path is ignored for Flow.
    extensionModule: require('GDJS-for-web-app-only/Runtime/Extensions/Firebase/JsExtension.js'),
    objectsRenderingServiceModules: {},
  },
  {
    name: 'DialogueTree',
    // $FlowExpectedError - this path is ignored for Flow.
    extensionModule: require('GDJS-for-web-app-only/Runtime/Extensions/DialogueTree/JsExtension.js'),
    objectsRenderingServiceModules: {},
  },
  {
    name: 'BBText',
    // $FlowExpectedError - this path is ignored for Flow.
    extensionModule: require('GDJS-for-web-app-only/Runtime/Extensions/BBText/JsExtension.js'),
    objectsRenderingServiceModules: {
      // $FlowExpectedError - this path is ignored for Flow.
      'pixi-multistyle-text/dist/pixi-multistyle-text.umd': require('GDJS-for-web-app-only/Runtime/Extensions/BBText/pixi-multistyle-text/dist/pixi-multistyle-text.umd'),
    },
  },
  {
    name: 'TileMap',
    // $FlowExpectedError - this path is ignored for Flow.
    extensionModule: require('GDJS-for-web-app-only/Runtime/Extensions/TileMap/JsExtension.js'),
    objectsRenderingServiceModules: {
      // $FlowExpectedError - this path is ignored for Flow.
      'pixi-tilemap/dist/pixi-tilemap.umd': require('GDJS-for-web-app-only/Runtime/Extensions/TileMap/pixi-tilemap/dist/pixi-tilemap.umd'),
      // $FlowExpectedError - this path is ignored for Flow.
      'pixi-tilemap-helper': require('GDJS-for-web-app-only/Runtime/Extensions/TileMap/pixi-tilemap-helper'),
      // $FlowExpectedError - this path is ignored for Flow.
      'pako/dist/pako.min': require('GDJS-for-web-app-only/Runtime/Extensions/TileMap/pako/dist/pako.min'),
    },
  },
  {
    name: 'Effects',
    // $FlowExpectedError - this path is ignored for Flow.
    extensionModule: require('GDJS-for-web-app-only/Runtime/Extensions/Effects/JsExtension.js'),
    objectsRenderingServiceModules: {},
  },
  {
    name: 'P2P',
    // $FlowExpectedError - this path is ignored for Flow.
    extensionModule: require('GDJS-for-web-app-only/Runtime/Extensions/P2P/JsExtension.js'),
    objectsRenderingServiceModules: {},
  },
  {
    name: 'Lighting',
    // $FlowExpectedError - this path is ignored for Flow.
    extensionModule: require('GDJS-for-web-app-only/Runtime/Extensions/Lighting/JsExtension.js'),
    objectsRenderingServiceModules: {},
  },
  {
    name: 'SpatialSound',
    // $FlowExpectedError - this path is ignored for Flow.
    extensionModule: require('GDJS-for-web-app-only/Runtime/Extensions/SpatialSound/JsExtension.js'),
    objectsRenderingServiceModules: {},
  },
  {
    name: 'BitmapText',
    // $FlowExpectedError - this path is ignored for Flow.
    extensionModule: require('GDJS-for-web-app-only/Runtime/Extensions/BitmapText/JsExtension.js'),
    objectsRenderingServiceModules: {},
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
          .map(({ name, extensionModule, objectsRenderingServiceModules }) => {
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

            // Register modules for ObjectsRenderingService
            if (objectsRenderingService && objectsRenderingServiceModules) {
              for (let requirePath in objectsRenderingServiceModules) {
                objectsRenderingService.registerModule(
                  requirePath,
                  objectsRenderingServiceModules[requirePath]
                );
              }
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
