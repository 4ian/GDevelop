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
    // $FlowFixMe[incompatible-type] - this path is ignored for Flow.
    // $FlowFixMe[cannot-resolve-module]
    extensionModule: require('GDJS-for-web-app-only/Runtime/Extensions/AdMob/JsExtension.js'),
    objectsRenderingServiceModules: {},
  },
  {
    name: 'AdvancedWindow',
    // $FlowFixMe[incompatible-type] - this path is ignored for Flow.
    // $FlowFixMe[cannot-resolve-module]
    extensionModule: require('GDJS-for-web-app-only/Runtime/Extensions/AdvancedWindow/JsExtension.js'),
    objectsRenderingServiceModules: {},
  },
  {
    name: 'FacebookInstantGames',
    // $FlowFixMe[incompatible-type] - this path is ignored for Flow.
    // $FlowFixMe[cannot-resolve-module]
    extensionModule: require('GDJS-for-web-app-only/Runtime/Extensions/FacebookInstantGames/JsExtension.js'),
    objectsRenderingServiceModules: {},
  },
  {
    name: 'DeviceSensors',
    // $FlowFixMe[incompatible-type] - this path is ignored for Flow.
    // $FlowFixMe[cannot-resolve-module]
    extensionModule: require('GDJS-for-web-app-only/Runtime/Extensions/DeviceSensors/JsExtension.js'),
    objectsRenderingServiceModules: {},
  },
  {
    name: 'DeviceVibration',
    // $FlowFixMe[incompatible-type] - this path is ignored for Flow.
    // $FlowFixMe[cannot-resolve-module]
    extensionModule: require('GDJS-for-web-app-only/Runtime/Extensions/DeviceVibration/JsExtension.js'),
    objectsRenderingServiceModules: {},
  },
  {
    name: 'SaveState',
    // $FlowFixMe[incompatible-type] - this path is ignored for Flow.
    // $FlowFixMe[cannot-resolve-module]
    extensionModule: require('GDJS-for-web-app-only/Runtime/Extensions/SaveState/JsExtension.js'),
    objectsRenderingServiceModules: {},
  },
  {
    name: 'DebuggerTools',
    // $FlowFixMe[incompatible-type] - this path is ignored for Flow.
    // $FlowFixMe[cannot-resolve-module]
    extensionModule: require('GDJS-for-web-app-only/Runtime/Extensions/DebuggerTools/JsExtension.js'),
    objectsRenderingServiceModules: {},
  },
  {
    name: 'Physics2',
    // $FlowFixMe[incompatible-type] - this path is ignored for Flow.
    // $FlowFixMe[cannot-resolve-module]
    extensionModule: require('GDJS-for-web-app-only/Runtime/Extensions/Physics2Behavior/JsExtension.js'),
    objectsRenderingServiceModules: {},
  },
  {
    name: 'Physics3D',
    // $FlowFixMe[incompatible-type] - this path is ignored for Flow.
    // $FlowFixMe[cannot-resolve-module]
    extensionModule: require('GDJS-for-web-app-only/Runtime/Extensions/Physics3DBehavior/JsExtension.js'),
    objectsRenderingServiceModules: {},
  },
  {
    name: 'ExampleJsExtension',
    // $FlowFixMe[incompatible-type] - this path is ignored for Flow.
    // $FlowFixMe[cannot-resolve-module]
    extensionModule: require('GDJS-for-web-app-only/Runtime/Extensions/ExampleJsExtension/JsExtension.js'),
    objectsRenderingServiceModules: {},
  },
  {
    name: 'Tween',
    // $FlowFixMe[incompatible-type] - this path is ignored for Flow.
    // $FlowFixMe[cannot-resolve-module]
    extensionModule: require('GDJS-for-web-app-only/Runtime/Extensions/TweenBehavior/JsExtension.js'),
    objectsRenderingServiceModules: {},
  },
  {
    name: 'Video',
    // $FlowFixMe[incompatible-type] - this path is ignored for Flow.
    // $FlowFixMe[cannot-resolve-module]
    extensionModule: require('GDJS-for-web-app-only/Runtime/Extensions/Video/JsExtension.js'),
    objectsRenderingServiceModules: {},
  },
  {
    name: 'FileSystem',
    // $FlowFixMe[incompatible-type] - this path is ignored for Flow.
    // $FlowFixMe[cannot-resolve-module]
    extensionModule: require('GDJS-for-web-app-only/Runtime/Extensions/FileSystem/JsExtension.js'),
    objectsRenderingServiceModules: {},
  },
  {
    name: 'Firebase',
    // $FlowFixMe[incompatible-type] - this path is ignored for Flow.
    // $FlowFixMe[cannot-resolve-module]
    extensionModule: require('GDJS-for-web-app-only/Runtime/Extensions/Firebase/JsExtension.js'),
    objectsRenderingServiceModules: {},
  },
  {
    name: 'Leaderboards',
    // $FlowFixMe[incompatible-type] - this path is ignored for Flow.
    // $FlowFixMe[cannot-resolve-module]
    extensionModule: require('GDJS-for-web-app-only/Runtime/Extensions/Leaderboards/JsExtension.js'),
    objectsRenderingServiceModules: {},
  },
  {
    name: 'PlayerAuthentication',
    // $FlowFixMe[incompatible-type] - this path is ignored for Flow.
    // $FlowFixMe[cannot-resolve-module]
    extensionModule: require('GDJS-for-web-app-only/Runtime/Extensions/PlayerAuthentication/JsExtension.js'),
    objectsRenderingServiceModules: {},
  },
  {
    name: 'Multiplayer',
    // $FlowFixMe[incompatible-type] - this path is ignored for Flow.
    // $FlowFixMe[cannot-resolve-module]
    extensionModule: require('GDJS-for-web-app-only/Runtime/Extensions/Multiplayer/JsExtension.js'),
    objectsRenderingServiceModules: {},
  },
  {
    name: 'DialogueTree',
    // $FlowFixMe[incompatible-type] - this path is ignored for Flow.
    // $FlowFixMe[cannot-resolve-module]
    extensionModule: require('GDJS-for-web-app-only/Runtime/Extensions/DialogueTree/JsExtension.js'),
    objectsRenderingServiceModules: {},
  },
  {
    name: 'BBText',
    // $FlowFixMe[incompatible-type] - this path is ignored for Flow.
    // $FlowFixMe[cannot-resolve-module]
    extensionModule: require('GDJS-for-web-app-only/Runtime/Extensions/BBText/JsExtension.js'),
    objectsRenderingServiceModules: {
      // $FlowFixMe[incompatible-type] - this path is ignored for Flow.
      // $FlowFixMe[cannot-resolve-module]
      'pixi-multistyle-text/dist/pixi-multistyle-text.umd': require('GDJS-for-web-app-only/Runtime/Extensions/BBText/pixi-multistyle-text/dist/pixi-multistyle-text.umd'),
    },
  },
  {
    name: 'TileMap',
    // $FlowFixMe[incompatible-type] - this path is ignored for Flow.
    // $FlowFixMe[cannot-resolve-module]
    extensionModule: require('GDJS-for-web-app-only/Runtime/Extensions/TileMap/JsExtension.js'),
    objectsRenderingServiceModules: {
      // $FlowFixMe[incompatible-type] - this path is ignored for Flow.
      // $FlowFixMe[cannot-resolve-module]
      'pixi-tilemap/dist/pixi-tilemap.umd': require('GDJS-for-web-app-only/Runtime/Extensions/TileMap/pixi-tilemap/dist/pixi-tilemap.umd'),
      // $FlowFixMe[incompatible-type] - this path is ignored for Flow.
      // $FlowFixMe[cannot-resolve-module]
      'helper/TileMapHelper': require('GDJS-for-web-app-only/Runtime/Extensions/TileMap/helper/TileMapHelper.js'),
      // $FlowFixMe[incompatible-type] - this path is ignored for Flow.
      // $FlowFixMe[cannot-resolve-module]
      'pako/dist/pako.min': require('GDJS-for-web-app-only/Runtime/Extensions/TileMap/pako/dist/pako.min'),
    },
  },
  {
    name: 'Effects',
    // $FlowFixMe[incompatible-type] - this path is ignored for Flow.
    // $FlowFixMe[cannot-resolve-module]
    extensionModule: require('GDJS-for-web-app-only/Runtime/Extensions/Effects/JsExtension.js'),
    objectsRenderingServiceModules: {},
  },
  {
    name: 'P2P',
    // $FlowFixMe[incompatible-type] - this path is ignored for Flow.
    // $FlowFixMe[cannot-resolve-module]
    extensionModule: require('GDJS-for-web-app-only/Runtime/Extensions/P2P/JsExtension.js'),
    objectsRenderingServiceModules: {},
  },
  {
    name: 'Lighting',
    // $FlowFixMe[incompatible-type] - this path is ignored for Flow.
    // $FlowFixMe[cannot-resolve-module]
    extensionModule: require('GDJS-for-web-app-only/Runtime/Extensions/Lighting/JsExtension.js'),
    objectsRenderingServiceModules: {},
  },
  {
    name: 'SpatialSound',
    // $FlowFixMe[incompatible-type] - this path is ignored for Flow.
    // $FlowFixMe[cannot-resolve-module]
    extensionModule: require('GDJS-for-web-app-only/Runtime/Extensions/SpatialSound/JsExtension.js'),
    objectsRenderingServiceModules: {},
  },
  {
    name: 'BitmapText',
    // $FlowFixMe[incompatible-type] - this path is ignored for Flow.
    // $FlowFixMe[cannot-resolve-module]
    extensionModule: require('GDJS-for-web-app-only/Runtime/Extensions/BitmapText/JsExtension.js'),
    objectsRenderingServiceModules: {},
  },
  {
    name: 'Screenshot',
    // $FlowFixMe[incompatible-type] - this path is ignored for Flow.
    // $FlowFixMe[cannot-resolve-module]
    extensionModule: require('GDJS-for-web-app-only/Runtime/Extensions/Screenshot/JsExtension.js'),
    objectsRenderingServiceModules: {},
  },
  {
    name: 'TextInput',
    // $FlowFixMe[incompatible-type] - this path is ignored for Flow.
    // $FlowFixMe[cannot-resolve-module]
    extensionModule: require('GDJS-for-web-app-only/Runtime/Extensions/TextInput/JsExtension.js'),
    objectsRenderingServiceModules: {},
  },
  {
    name: 'Scene3D',
    // $FlowFixMe[incompatible-type] - this path is ignored for Flow.
    // $FlowFixMe[cannot-resolve-module]
    extensionModule: require('GDJS-for-web-app-only/Runtime/Extensions/3D/JsExtension.js'),
    objectsRenderingServiceModules: {},
  },
  {
    name: 'SpineObject',
    // $FlowFixMe[incompatible-type] - this path is ignored for Flow.
    // $FlowFixMe[cannot-resolve-module]
    extensionModule: require('GDJS-for-web-app-only/Runtime/Extensions/Spine/JsExtension.js'),
    objectsRenderingServiceModules: {},
  },
];

const getExpectedNumberOfJSExtensionModules = ({
  filterExamples,
}: {|
  filterExamples: boolean,
|}): number => {
  return jsExtensions.filter(
    ({ name }) => !filterExamples || !name.includes('Example')
  ).length;
};

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
    ): Promise<{|
      results: Array<{|
        extensionModulePath: string,
        result: ExtensionLoadingResult,
      |}>,
      expectedNumberOfJSExtensionModulesLoaded: number,
    |}> {
      const results = jsExtensions
        .filter(({ name }) => !filterExamples || !name.includes('Example'))
        .map(({ name, extensionModule, objectsRenderingServiceModules }) => {
          if (
            objectsEditorService &&
            extensionModule.registerEditorConfigurations
          ) {
            extensionModule.registerEditorConfigurations(objectsEditorService);
          }

          if (objectsRenderingService) {
            if (objectsRenderingServiceModules) {
              for (const requirePath in objectsRenderingServiceModules) {
                objectsRenderingService.registerModule(
                  requirePath,
                  // $FlowFixMe[invalid-computed-prop]
                  objectsRenderingServiceModules[requirePath]
                );
              }
            }
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
            extensionModulePath: 'internal-extension://' + name,
            result: loadExtension(_, gd, gd.JsPlatform.get(), extensionModule),
          };
        });
      const expectedNumberOfJSExtensionModulesLoaded = getExpectedNumberOfJSExtensionModules(
        {
          filterExamples,
        }
      );

      return Promise.resolve({
        results,
        expectedNumberOfJSExtensionModulesLoaded,
      });
    },
  };
}
