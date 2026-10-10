const fs = require('fs');

/**
 * Write the benchmark results sent by the browser (see `reportBenchmarkResult`
 * in `benchmarks/init.js`) to the file given with `--benchmarkResultsFile`.
 */
function BenchmarkResultsReporter(config) {
  const benchmarkResults = [];
  this.onBrowserInfo = (browser, info) => {
    if (info && info.benchmarkResult)
      benchmarkResults.push(info.benchmarkResult);
  };
  this.onRunComplete = () => {
    fs.writeFileSync(
      config.benchmarkResultsFile,
      JSON.stringify(benchmarkResults, null, 2)
    );
  };
}
BenchmarkResultsReporter.$inject = ['config'];

module.exports = function (config) {
  // The built game engine to test, relative to the repository root. Changed
  // to compare the benchmarks of two versions (see `compare-benchmarks.js`).
  const gdjsRuntimePath =
    config.gdjsRuntimePath || 'newIDE/app/resources/GDJS/Runtime';

  const testFiles = [
    './Extensions/TweenBehavior/tests/CubicBezierEasingTestCases.js',
    './Extensions/**/tests/**.spec.js',
    './GDJS/tests/tests/**/*.js',
  ];

  const benchmarkFiles = [
    './GDJS/tests/benchmarks/init.js',
    './Extensions/**/benchmarks/**.benchmark.js',
    './GDJS/tests/benchmarks/*.js',
    // Last, so that the micro benchmarks are not affected by what the scenes
    // leave behind (memory to collect, rendering to finish...).
    './GDJS/tests/benchmarks/scenes/*.js',
  ];

  config.set({
    frameworks: ['mocha', 'sinon'],
    browserNoActivityTimeout: 400000,
    browsers: [
      'ChromeHeadless',
      'EdgeHeadless',
      'Chrome',
      'Edge',
      'Firefox',
      'ChromeHeadlessNoSandbox',
    ],
    customLaunchers: {
      // This is useful to run tests in a CI environment like Ubuntu 24.04 on Semaphore CI.
      ChromeHeadlessNoSandbox: {
        base: 'ChromeHeadless',
        flags: [
          '--no-sandbox',
          '--disable-gpu',
          '--use-gl=swiftshader',
          '--enable-webgl',
          '--use-angle=swiftshader',
        ],
      },
      // Same, with the garbage collector exposed so that benchmarks can run
      // it before measuring.
      ChromeHeadlessBenchmark: {
        base: 'ChromeHeadless',
        flags: [
          '--no-sandbox',
          '--disable-gpu',
          '--use-gl=swiftshader',
          '--enable-webgl',
          '--use-angle=swiftshader',
          '--js-flags=--expose-gc',
          // Never slow down the timers used to yield between frames.
          '--disable-background-timer-throttling',
          '--disable-renderer-backgrounding',
          '--disable-backgrounding-occluded-windows',
        ],
      },
    },
    plugins: [
      require('karma-chrome-launcher'),
      require('@chiragrupani/karma-chromium-edge-launcher'),
      require('karma-firefox-launcher'),
      require('karma-mocha'),
      require('karma-sinon'),
      { 'reporter:benchmark-results': ['type', BenchmarkResultsReporter] },
    ],
    reporters: config.benchmarkResultsFile
      ? ['dots', 'benchmark-results']
      : ['progress'],
    client: {
      args: config.grep ? ['--grep', config.grep] : [],
      mocha: {
        reporter: 'html',
        timeout: 10000, // Give a bit more time for CIs (the default 2s can be too low sometimes, as a real browser is involved).
      },
    },
    basePath: '../..',
    proxies: {
      '/base/tests-utils/': '/base/GDJS/tests/tests-utils/',
      // Jolt is loaded with a dynamic `import('./jolt-physics.wasm.js')`,
      // which is resolved relatively to the page, not to the script.
      '/jolt-physics.wasm.js': `/base/${gdjsRuntimePath}/Extensions/Physics3DBehavior/jolt-physics.wasm.js`,
      '/jolt-physics.wasm.wasm': `/base/${gdjsRuntimePath}/Extensions/Physics3DBehavior/jolt-physics.wasm.wasm`,
    },
    files: [
      './GDJS/tests/node_modules/expect.js/index.js',

      //GDJS game engine files: (Order is important)
      `${gdjsRuntimePath}/libs/jshashtable.js`,
      `${gdjsRuntimePath}/logger.js`,
      `${gdjsRuntimePath}/gd.js`,
      `${gdjsRuntimePath}/AsyncTasksManager.js`,
      `${gdjsRuntimePath}/libs/rbush.js`,
      `${gdjsRuntimePath}/pixi-renderers/pixi.js`,
      `${gdjsRuntimePath}/pixi-renderers/three.js`,
      `${gdjsRuntimePath}/pixi-renderers/*.js`,
      `${gdjsRuntimePath}/howler-sound-manager/howler.min.js`,
      `${gdjsRuntimePath}/howler-sound-manager/howler-sound-manager.js`,
      `${gdjsRuntimePath}/fontfaceobserver-font-manager/fontfaceobserver.js`,
      `${gdjsRuntimePath}/fontfaceobserver-font-manager/fontfaceobserver-font-manager.js`,
      `${gdjsRuntimePath}/Model3DManager.js`,
      `${gdjsRuntimePath}/jsonmanager.js`,
      `${gdjsRuntimePath}/ResourceLoader.js`,
      `${gdjsRuntimePath}/ResourceCache.js`,
      `${gdjsRuntimePath}/timemanager.js`,
      `${gdjsRuntimePath}/polygon.js`,
      `${gdjsRuntimePath}/runtimeobject.js`,
      `${gdjsRuntimePath}/RuntimeInstanceContainer.js`,
      `${gdjsRuntimePath}/runtimescene.js`,
      `${gdjsRuntimePath}/scenestack.js`,
      `${gdjsRuntimePath}/profiler.js`,
      `${gdjsRuntimePath}/force.js`,
      `${gdjsRuntimePath}/RuntimeLayer.js`,
      `${gdjsRuntimePath}/layer.js`,
      `${gdjsRuntimePath}/RuntimeCustomObjectLayer.js`,
      `${gdjsRuntimePath}/timer.js`,
      `${gdjsRuntimePath}/inputmanager.js`,
      `${gdjsRuntimePath}/capturemanager.js`,
      `${gdjsRuntimePath}/named-easings-manager.js`,
      `${gdjsRuntimePath}/runtimegame.js`,
      `${gdjsRuntimePath}/runtimewatermark.js`,
      `${gdjsRuntimePath}/variable.js`,
      `${gdjsRuntimePath}/variablescontainer.js`,
      `${gdjsRuntimePath}/oncetriggers.js`,
      `${gdjsRuntimePath}/runtimebehavior.js`,
      `${gdjsRuntimePath}/SpriteAnimator.js`,
      `${gdjsRuntimePath}/spriteruntimeobject.js`,
      `${gdjsRuntimePath}/CustomRuntimeObject.js`,
      `${gdjsRuntimePath}/CustomRuntimeObject2D.js`,
      `${gdjsRuntimePath}/CustomRuntimeObjectInstanceContainer.js`,
      `${gdjsRuntimePath}/events-tools/commontools.js`,
      `${gdjsRuntimePath}/events-tools/runtimescenetools.js`,
      `${gdjsRuntimePath}/events-tools/inputtools.js`,
      `${gdjsRuntimePath}/events-tools/networktools.js`,
      `${gdjsRuntimePath}/events-tools/objecttools.js`,
      `${gdjsRuntimePath}/events-tools/cameratools.js`,
      `${gdjsRuntimePath}/events-tools/soundtools.js`,
      `${gdjsRuntimePath}/events-tools/storagetools.js`,
      `${gdjsRuntimePath}/indexeddb.js`,
      `${gdjsRuntimePath}/events-tools/stringtools.js`,
      `${gdjsRuntimePath}/events-tools/windowtools.js`,
      `${gdjsRuntimePath}/debugger-client/abstract-debugger-client.js`,
      `${gdjsRuntimePath}/debugger-client/hot-reloader.js`,
      `${gdjsRuntimePath}/gameplay-tests/gameplay-test-runner.js`,
      `${gdjsRuntimePath}/affinetransformation.js`,

      //Extensions:
      `${gdjsRuntimePath}/Extensions/DraggableBehavior/draggableruntimebehavior.js`,
      `${gdjsRuntimePath}/Extensions/AnchorBehavior/anchorruntimebehavior.js`,
      `${gdjsRuntimePath}/Extensions/PlatformBehavior/platformerobjectruntimebehavior.js`,
      `${gdjsRuntimePath}/Extensions/PlatformBehavior/platformruntimebehavior.js`,
      `${gdjsRuntimePath}/Extensions/LinkedObjects/linkedobjects.js`,
      `${gdjsRuntimePath}/Extensions/Inventory/inventory.js`,
      `${gdjsRuntimePath}/Extensions/Inventory/inventorytools.js`,
      {
        pattern: `${gdjsRuntimePath}/Extensions/Physics2Behavior/Box2D_v2.3.1_min.wasm.wasm`,
        watched: true,
        included: false,
        served: true,
        nocache: false,
      },
      `${gdjsRuntimePath}/Extensions/Physics2Behavior/Box2D_v2.3.1_min.wasm.js`,
      `${gdjsRuntimePath}/Extensions/Physics2Behavior/physics2runtimebehavior.js`,
      `${gdjsRuntimePath}/Extensions/Physics2Behavior/physics2tools.js`,
      `${gdjsRuntimePath}/Extensions/Leaderboards/leaderboardstools.js`,
      `${gdjsRuntimePath}/Extensions/PlayerAuthentication/playerauthenticationtools.js`,
      `${gdjsRuntimePath}/Extensions/PlayerAuthentication/playerauthenticationcomponents.js`,
      `${gdjsRuntimePath}/Extensions/Multiplayer/messageManager.js`,
      `${gdjsRuntimePath}/Extensions/Multiplayer/multiplayerVariablesManager.js`,
      `${gdjsRuntimePath}/Extensions/Multiplayer/multiplayertools.js`,
      `${gdjsRuntimePath}/Extensions/Multiplayer/multiplayercomponents.js`,
      `${gdjsRuntimePath}/Extensions/Multiplayer/multiplayerobjectruntimebehavior.js`,
      `${gdjsRuntimePath}/Extensions/Lighting/lightruntimeobject.js`,
      `${gdjsRuntimePath}/Extensions/Lighting/lightruntimeobject-pixi-renderer.js`,
      `${gdjsRuntimePath}/Extensions/Lighting/lightobstacleruntimebehavior.js`,
      `${gdjsRuntimePath}/Extensions/PathfindingBehavior/PathTools.js`,
      `${gdjsRuntimePath}/Extensions/PathfindingBehavior/pathfindingobstacleruntimebehavior.js`,
      `${gdjsRuntimePath}/Extensions/PathfindingBehavior/pathfindingruntimebehavior.js`,
      `${gdjsRuntimePath}/Extensions/NavMeshPathfinding/A_recast-navigation-generators.js`,
      {
        pattern: `${gdjsRuntimePath}/Extensions/NavMeshPathfinding/recast-navigation.wasm.js`,
        watched: true,
        included: false,
        served: true,
        nocache: false,
      },
      {
        pattern: `${gdjsRuntimePath}/Extensions/NavMeshPathfinding/recast-navigation.wasm.wasm`,
        watched: true,
        included: false,
        served: true,
        nocache: false,
      },
      `${gdjsRuntimePath}/Extensions/NavMeshPathfinding/NavMeshObstacleRuntimeBehavior.js`,
      `${gdjsRuntimePath}/Extensions/NavMeshPathfinding/NavMeshCharacterRuntimeBehavior.js`,
      `${gdjsRuntimePath}/Extensions/PrimitiveDrawing/shapepainterruntimeobject.js`,
      `${gdjsRuntimePath}/Extensions/PrimitiveDrawing/shapepainterruntimeobject-pixi-renderer.js`,
      `${gdjsRuntimePath}/Extensions/TextInput/textinputruntimeobject.js`,
      `${gdjsRuntimePath}/Extensions/TextInput/textinputruntimeobject-pixi-renderer.js`,
      `${gdjsRuntimePath}/Extensions/TextObject/textruntimeobject.js`,
      `${gdjsRuntimePath}/Extensions/TextObject/textruntimeobject-pixi-renderer.js`,
      `${gdjsRuntimePath}/Extensions/3D/A_RuntimeObject3D.js`,
      `${gdjsRuntimePath}/Extensions/3D/A_RuntimeObject3DRenderer.js`,
      `${gdjsRuntimePath}/Extensions/3D/Cube3DRuntimeObject.js`,
      `${gdjsRuntimePath}/Extensions/3D/Cube3DRuntimeObjectPixiRenderer.js`,
      `${gdjsRuntimePath}/Extensions/3D/Model3DRuntimeObject.js`,
      `${gdjsRuntimePath}/Extensions/3D/Model3DRuntimeObject3DRenderer.js`,
      `${gdjsRuntimePath}/Extensions/3D/CustomRuntimeObject3D.js`,
      `${gdjsRuntimePath}/Extensions/3D/CustomRuntimeObject3DRenderer.js`,
      `${gdjsRuntimePath}/Extensions/3D/BloomEffect.js`,
      `${gdjsRuntimePath}/Extensions/3D/BrightnessAndContrastEffect.js`,
      `${gdjsRuntimePath}/Extensions/3D/DepthOfFieldEffect.js`,
      `${gdjsRuntimePath}/Extensions/3D/N8AOEffect.js`,
      `${gdjsRuntimePath}/Extensions/3D/DirectionalLight.js`,
      {
        pattern: `${gdjsRuntimePath}/Extensions/Physics3DBehavior/jolt-physics.wasm.js`,
        watched: true,
        included: false,
        served: true,
        nocache: false,
      },
      {
        pattern: `${gdjsRuntimePath}/Extensions/Physics3DBehavior/jolt-physics.wasm.wasm`,
        watched: true,
        included: false,
        served: true,
        nocache: false,
      },
      `${gdjsRuntimePath}/Extensions/Physics3DBehavior/Physics3DRuntimeBehavior.js`,
      `${gdjsRuntimePath}/Extensions/Physics3DBehavior/Physics3DTools.js`,
      `${gdjsRuntimePath}/Extensions/Physics3DBehavior/PhysicsCharacter3DRuntimeBehavior.js`,
      `${gdjsRuntimePath}/Extensions/TopDownMovementBehavior/topdownmovementruntimebehavior.js`,
      `${gdjsRuntimePath}/Extensions/TweenBehavior/TweenManager.js`,
      `${gdjsRuntimePath}/Extensions/TweenBehavior/tweentools.js`,
      `${gdjsRuntimePath}/Extensions/TweenBehavior/tweenruntimebehavior.js`,
      `${gdjsRuntimePath}/Extensions/Firebase/A_firebasejs/*.js`,
      `${gdjsRuntimePath}/Extensions/Firebase/B_firebasetools/*.js`,
      `${gdjsRuntimePath}/Extensions/Effects/outline-pixi-filter.js`,
      `${gdjsRuntimePath}/Extensions/Effects/pixi-filters/filter-outline.js`,
      `${gdjsRuntimePath}/Extensions/Effects/blur-pixi-filter.js`,
      `${gdjsRuntimePath}/Extensions/Effects/kawase-blur-pixi-filter.js`,
      `${gdjsRuntimePath}/Extensions/Effects/pixi-filters/filter-kawase-blur.js`,
      `${gdjsRuntimePath}/Extensions/TileMap/tilemapcollisionmaskruntimeobject.js`,
      `${gdjsRuntimePath}/Extensions/TileMap/TileMapRuntimeManager.js`,
      `${gdjsRuntimePath}/Extensions/TileMap/TileMapBehavior.js`,
      `${gdjsRuntimePath}/Extensions/TileMap/AbstractTileMapRuntimeObject.js`,
      `${gdjsRuntimePath}/Extensions/TileMap/tilemapruntimeobject-pixi-renderer.js`,
      `${gdjsRuntimePath}/Extensions/TileMap/tilemapruntimeobject.js`,
      `${gdjsRuntimePath}/Extensions/TileMap/collision/TileMapCollisionMaskRenderer.js`,
      `${gdjsRuntimePath}/Extensions/TileMap/collision/TransformedTileMap.js`,
      `${gdjsRuntimePath}/Extensions/TileMap/helper/TileMapHelper.js`,
      `${gdjsRuntimePath}/Extensions/TileMap/pako/dist/pako.min.js`,
      `${gdjsRuntimePath}/Extensions/Spine/spine-pixi-v7/A_spine-pixi-v7-pre.js`,
      `${gdjsRuntimePath}/Extensions/Spine/spine-pixi-v7/B_spine-pixi-v7.js`,
      `${gdjsRuntimePath}/Extensions/Spine/spine-pixi-v7/C_spine-pixi-v7-post.js`,
      `${gdjsRuntimePath}/Extensions/Spine/spineruntimeobject.js`,
      `${gdjsRuntimePath}/Extensions/Spine/spineruntimeobject-pixi-renderer.js`,
      `${gdjsRuntimePath}/Extensions/Spine/managers/*.js`,
      `${gdjsRuntimePath}/Extensions/SaveState/SaveStateTools.js`,
      `${gdjsRuntimePath}/Extensions/SaveState/SaveConfigurationRuntimeBehavior.js`,

      // Test extensions:
      './GDJS/tests/tests/Extensions/**.js',

      // Other test initialization files:
      './GDJS/tests/tests-utils/init.js',
      './GDJS/tests/tests-utils/init.pixiruntimegamewithassets.js',
      './GDJS/tests/tests-utils/init.pixiruntimegame.js',
      './GDJS/tests/tests-utils/MockedCustomObject.js',

      // Test helpers
      './Extensions/PlatformBehavior/tests/PlatformerTestHelper.js',

      // Source maps
      {
        pattern: `${gdjsRuntimePath}/**/*.map`,
        watched: false,
        included: false,
        served: true,
        nocache: true,
      },

      // Assets
      {
        pattern: './GDJS/tests/tests-utils/assets/*.jpg',
        watched: false,
        included: false,
        served: true,
        nocache: false,
      },
      {
        pattern: './GDJS/tests/tests-utils/assets/*.glb',
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

      ...(config.benchmarksOnly ? [] : testFiles),
      ...(config.enableBenchmarks || config.benchmarksOnly
        ? benchmarkFiles
        : []),
    ],
  });
};
