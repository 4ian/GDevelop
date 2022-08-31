module.exports = function (config) {
  const testFiles = [
    './Extensions/**/tests/**.spec.js',
    './GDJS/tests/tests/**/*.js',
  ];

  const benchmarkFiles = [
    './GDJS/tests/benchmarks/init.js',
    './Extensions/**/benchmark/**.benchmark.js',
    './GDJS/tests/benchmarks/**/*.js',
  ];

  config.set({
    frameworks: ['mocha'],
    browserNoActivityTimeout: 400000,
    browsers: ['ChromeHeadless', 'EdgeHeadless', 'Chrome', 'Edge', 'Firefox'],
    plugins: [
      require('karma-chrome-launcher'),
      require('@chiragrupani/karma-chromium-edge-launcher'),
      require('karma-firefox-launcher'),
      require('karma-mocha'),
    ],
    client: {
      mocha: {
        reporter: 'html',
        timeout: 10000, // Give a bit more time for CIs (the default 2s can be too low sometimes, as a real browser is involved).
      },
    },
    basePath: '../..',
    proxies: {
      '/base/tests-utils/': '/base/GDJS/tests/tests-utils/',
    },
    files: [
      './GDJS/tests/node_modules/expect.js/index.js',

      //GDJS game engine files: (Order is important)
      './newIDE/app/resources/GDJS/Runtime/libs/jshashtable.js',
      './newIDE/app/resources/GDJS/Runtime/logger.js',
      './newIDE/app/resources/GDJS/Runtime/gd.js',
      './newIDE/app/resources/GDJS/Runtime/AsyncTasksManager.js',
      './newIDE/app/resources/GDJS/Runtime/libs/rbush.js',
      './newIDE/app/resources/GDJS/Runtime/pixi-renderers/pixi.js',
      './newIDE/app/resources/GDJS/Runtime/pixi-renderers/*.js',
      './newIDE/app/resources/GDJS/Runtime/howler-sound-manager/howler.min.js',
      './newIDE/app/resources/GDJS/Runtime/howler-sound-manager/howler-sound-manager.js',
      './newIDE/app/resources/GDJS/Runtime/fontfaceobserver-font-manager/fontfaceobserver.js',
      './newIDE/app/resources/GDJS/Runtime/fontfaceobserver-font-manager/fontfaceobserver-font-manager.js',
      './newIDE/app/resources/GDJS/Runtime/jsonmanager.js',
      './newIDE/app/resources/GDJS/Runtime/timemanager.js',
      './newIDE/app/resources/GDJS/Runtime/polygon.js',
      './newIDE/app/resources/GDJS/Runtime/runtimeobject.js',
      './newIDE/app/resources/GDJS/Runtime/RuntimeInstancesContainer.js',
      './newIDE/app/resources/GDJS/Runtime/runtimescene.js',
      './newIDE/app/resources/GDJS/Runtime/scenestack.js',
      './newIDE/app/resources/GDJS/Runtime/profiler.js',
      './newIDE/app/resources/GDJS/Runtime/force.js',
      './newIDE/app/resources/GDJS/Runtime/layer.js',
      './newIDE/app/resources/GDJS/Runtime/timer.js',
      './newIDE/app/resources/GDJS/Runtime/inputmanager.js',
      './newIDE/app/resources/GDJS/Runtime/runtimegame.js',
      './newIDE/app/resources/GDJS/Runtime/variable.js',
      './newIDE/app/resources/GDJS/Runtime/variablescontainer.js',
      './newIDE/app/resources/GDJS/Runtime/oncetriggers.js',
      './newIDE/app/resources/GDJS/Runtime/runtimebehavior.js',
      './newIDE/app/resources/GDJS/Runtime/spriteruntimeobject.js',
      './newIDE/app/resources/GDJS/Runtime/events-tools/commontools.js',
      './newIDE/app/resources/GDJS/Runtime/events-tools/runtimescenetools.js',
      './newIDE/app/resources/GDJS/Runtime/events-tools/inputtools.js',
      './newIDE/app/resources/GDJS/Runtime/events-tools/networktools.js',
      './newIDE/app/resources/GDJS/Runtime/events-tools/objecttools.js',
      './newIDE/app/resources/GDJS/Runtime/events-tools/cameratools.js',
      './newIDE/app/resources/GDJS/Runtime/events-tools/soundtools.js',
      './newIDE/app/resources/GDJS/Runtime/events-tools/storagetools.js',
      './newIDE/app/resources/GDJS/Runtime/events-tools/stringtools.js',
      './newIDE/app/resources/GDJS/Runtime/events-tools/windowtools.js',
      './newIDE/app/resources/GDJS/Runtime/debugger-client/hot-reloader.js',
      './newIDE/app/resources/GDJS/Runtime/affinetransformation.js',

      //Extensions:
      './newIDE/app/resources/GDJS/Runtime/Extensions/DraggableBehavior/draggableruntimebehavior.js',
      './newIDE/app/resources/GDJS/Runtime/Extensions/AnchorBehavior/anchorruntimebehavior.js',
      './newIDE/app/resources/GDJS/Runtime/Extensions/PlatformBehavior/platformerobjectruntimebehavior.js',
      './newIDE/app/resources/GDJS/Runtime/Extensions/PlatformBehavior/platformruntimebehavior.js',
      './newIDE/app/resources/GDJS/Runtime/Extensions/LinkedObjects/linkedobjects.js',
      './newIDE/app/resources/GDJS/Runtime/Extensions/Inventory/inventory.js',
      './newIDE/app/resources/GDJS/Runtime/Extensions/Inventory/inventorytools.js',
      {
        pattern:
          './newIDE/app/resources/GDJS/Runtime/Extensions/Physics2Behavior/Box2D_v2.3.1_min.wasm.wasm',
        watched: true,
        included: false,
        served: true,
        nocache: false,
      },
      './newIDE/app/resources/GDJS/Runtime/Extensions/Physics2Behavior/Box2D_v2.3.1_min.wasm.js',
      './newIDE/app/resources/GDJS/Runtime/Extensions/Physics2Behavior/physics2runtimebehavior.js',
      './newIDE/app/resources/GDJS/Runtime/Extensions/Physics2Behavior/physics2tools.js',
      './newIDE/app/resources/GDJS/Runtime/Extensions/Leaderboards/leaderboardstools.js',
      './newIDE/app/resources/GDJS/Runtime/Extensions/PlayerAuthentication/playerauthenticationtools.js',
      './newIDE/app/resources/GDJS/Runtime/Extensions/PlayerAuthentication/playerauthenticationcomponents.js',
      './newIDE/app/resources/GDJS/Runtime/Extensions/Lighting/lightruntimeobject.js',
      './newIDE/app/resources/GDJS/Runtime/Extensions/Lighting/lightruntimeobject-pixi-renderer.js',
      './newIDE/app/resources/GDJS/Runtime/Extensions/Lighting/lightobstacleruntimebehavior.js',
      './newIDE/app/resources/GDJS/Runtime/Extensions/PathfindingBehavior/pathfindingobstacleruntimebehavior.js',
      './newIDE/app/resources/GDJS/Runtime/Extensions/PathfindingBehavior/pathfindingruntimebehavior.js',
      './newIDE/app/resources/GDJS/Runtime/Extensions/PrimitiveDrawing/shapepainterruntimeobject.js',
      './newIDE/app/resources/GDJS/Runtime/Extensions/PrimitiveDrawing/shapepainterruntimeobject-pixi-renderer.js',
      './newIDE/app/resources/GDJS/Runtime/Extensions/TextInput/textinputruntimeobject.js',
      './newIDE/app/resources/GDJS/Runtime/Extensions/TextInput/textinputruntimeobject-pixi-renderer.js',
      './newIDE/app/resources/GDJS/Runtime/Extensions/TopDownMovementBehavior/topdownmovementruntimebehavior.js',
      './newIDE/app/resources/GDJS/Runtime/Extensions/Firebase/A_firebasejs/*.js',
      './newIDE/app/resources/GDJS/Runtime/Extensions/Firebase/B_firebasetools/*.js',
      './newIDE/app/resources/GDJS/Runtime/Extensions/Effects/kawase-blur-pixi-filter.js',
      './newIDE/app/resources/GDJS/Runtime/Extensions/Effects/pixi-filters/filter-kawase-blur.js',
      './newIDE/app/resources/GDJS/Runtime/Extensions/TileMap/tilemapcollisionmaskruntimeobject.js',
      './newIDE/app/resources/GDJS/Runtime/Extensions/TileMap/TileMapRuntimeManager.js',
      './newIDE/app/resources/GDJS/Runtime/Extensions/TileMap/tilemapruntimeobject-pixi-renderer.js',
      './newIDE/app/resources/GDJS/Runtime/Extensions/TileMap/tilemapruntimeobject.js',
      './newIDE/app/resources/GDJS/Runtime/Extensions/TileMap/collision/TileMapCollisionMaskRenderer.js',
      './newIDE/app/resources/GDJS/Runtime/Extensions/TileMap/collision/TransformedTileMap.js',
      './newIDE/app/resources/GDJS/Runtime/Extensions/TileMap/helper/TileMapHelper.js',
      './newIDE/app/resources/GDJS/Runtime/Extensions/TileMap/pako/dist/pako.min.js',

      // Test extensions:
      './GDJS/tests/tests/Extensions/**.js',

      // Other test initialization files:
      './GDJS/tests/tests-utils/init.js',
      './GDJS/tests/tests-utils/init.pixiruntimegamewithassets.js',

      // Test helpers
      './Extensions/PlatformBehavior/tests/PlatformerTestHelper.js',

      // Assets
      {
        pattern: './GDJS/tests/tests-utils/assets/*.jpg',
        watched: false,
        included: false,
        served: true,
        nocache: false,
      },
      {
        pattern: './GDJS/tests/tests-utils/simple-tiled-map/*.json',
        watched: false,
        included: false,
        served: true,
        nocache: false,
      },

      ...testFiles,
      ...(config.enableBenchmarks ? benchmarkFiles : []),
    ],
  });
};
