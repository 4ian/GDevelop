module.exports = function (config) {
  const testFiles = ['../../Extensions/**/tests/**.spec.js', './tests/**/*.js'];

  const benchmarkFiles = [
    './benchmarks/init.js',
    '../../Extensions/**/benchmark/**.benchmark.js',
    './benchmarks/**/*.js',
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
    files: [
      'node_modules/expect.js/index.js',

      //GDJS game engine files: (Order is important)
      '../../newIDE/app/resources/GDJS/Runtime/Core/libs/jshashtable.js',
      '../../newIDE/app/resources/GDJS/Runtime/Core/logger.js',
      '../../newIDE/app/resources/GDJS/Runtime/Core/gd.js',
      '../../newIDE/app/resources/GDJS/Runtime/Core/libs/rbush.js',
      '../../newIDE/app/resources/GDJS/Runtime/Managers/Implementations/pixi-renderers/pixi.js',
      '../../newIDE/app/resources/GDJS/Runtime/Managers/Implementations/pixi-renderers/*.js',
      '../../newIDE/app/resources/GDJS/Runtime/Managers/Implementations/howler-sound-manager/howler.min.js',
      '../../newIDE/app/resources/GDJS/Runtime/Managers/Implementations/howler-sound-manager/howler-sound-manager.js',
      '../../newIDE/app/resources/GDJS/Runtime/Managers/Implementations/fontfaceobserver-font-manager/fontfaceobserver.js',
      '../../newIDE/app/resources/GDJS/Runtime/Managers/Implementations/fontfaceobserver-font-manager/fontfaceobserver-font-manager.js',
      '../../newIDE/app/resources/GDJS/Runtime/Core/jsonmanager.js',
      '../../newIDE/app/resources/GDJS/Runtime/Core/timemanager.js',
      '../../newIDE/app/resources/GDJS/Runtime/Core/timemanager.js',
      '../../newIDE/app/resources/GDJS/Runtime/Core/runtimeobject.js',
      '../../newIDE/app/resources/GDJS/Runtime/Core/runtimescene.js',
      '../../newIDE/app/resources/GDJS/Runtime/Core/scenestack.js',
      '../../newIDE/app/resources/GDJS/Runtime/Core/profiler.js',
      '../../newIDE/app/resources/GDJS/Runtime/Core/polygon.js',
      '../../newIDE/app/resources/GDJS/Runtime/Core/force.js',
      '../../newIDE/app/resources/GDJS/Runtime/Core/layer.js',
      '../../newIDE/app/resources/GDJS/Runtime/Core/timer.js',
      '../../newIDE/app/resources/GDJS/Runtime/Core/inputmanager.js',
      '../../newIDE/app/resources/GDJS/Runtime/Core/runtimegame.js',
      '../../newIDE/app/resources/GDJS/Runtime/Core/variable.js',
      '../../newIDE/app/resources/GDJS/Runtime/Core/variablescontainer.js',
      '../../newIDE/app/resources/GDJS/Runtime/Core/oncetriggers.js',
      '../../newIDE/app/resources/GDJS/Runtime/Core/runtimebehavior.js',
      '../../newIDE/app/resources/GDJS/Runtime/Core/spriteruntimeobject.js',
      '../../newIDE/app/resources/GDJS/Runtime/Core/events-tools/commontools.js',
      '../../newIDE/app/resources/GDJS/Runtime/Core/events-tools/runtimescenetools.js',
      '../../newIDE/app/resources/GDJS/Runtime/Core/events-tools/inputtools.js',
      '../../newIDE/app/resources/GDJS/Runtime/Core/events-tools/networktools.js',
      '../../newIDE/app/resources/GDJS/Runtime/Core/events-tools/objecttools.js',
      '../../newIDE/app/resources/GDJS/Runtime/Core/events-tools/cameratools.js',
      '../../newIDE/app/resources/GDJS/Runtime/Core/events-tools/soundtools.js',
      '../../newIDE/app/resources/GDJS/Runtime/Core/events-tools/storagetools.js',
      '../../newIDE/app/resources/GDJS/Runtime/Core/events-tools/stringtools.js',
      '../../newIDE/app/resources/GDJS/Runtime/Core/events-tools/windowtools.js',
      '../../newIDE/app/resources/GDJS/Runtime/Managers/Interfaces/debugger-client/hot-reloader.js',

      //Extensions:
      '../../newIDE/app/resources/GDJS/Runtime/Extensions/DraggableBehavior/draggableruntimebehavior.js',
      '../../newIDE/app/resources/GDJS/Runtime/Extensions/PlatformBehavior/platformerobjectruntimebehavior.js',
      '../../newIDE/app/resources/GDJS/Runtime/Extensions/PlatformBehavior/platformruntimebehavior.js',
      '../../newIDE/app/resources/GDJS/Runtime/Extensions/LinkedObjects/linkedobjects.js',
      '../../newIDE/app/resources/GDJS/Runtime/Extensions/Inventory/inventory.js',
      '../../newIDE/app/resources/GDJS/Runtime/Extensions/Inventory/inventorytools.js',
      '../../newIDE/app/resources/GDJS/Runtime/Extensions/Leaderboards/leaderboardstools.js',
      '../../newIDE/app/resources/GDJS/Runtime/Extensions/Lighting/lightruntimeobject.js',
      '../../newIDE/app/resources/GDJS/Runtime/Extensions/Lighting/lightruntimeobject-pixi-renderer.js',
      '../../newIDE/app/resources/GDJS/Runtime/Extensions/Lighting/lightobstacleruntimebehavior.js',
      '../../newIDE/app/resources/GDJS/Runtime/Extensions/PathfindingBehavior/pathfindingobstacleruntimebehavior.js',
      '../../newIDE/app/resources/GDJS/Runtime/Extensions/PathfindingBehavior/pathfindingruntimebehavior.js',
      '../../newIDE/app/resources/GDJS/Runtime/Extensions/PrimitiveDrawing/shapepainterruntimeobject.js',
      '../../newIDE/app/resources/GDJS/Runtime/Extensions/PrimitiveDrawing/shapepainterruntimeobject-pixi-renderer.js',
      '../../newIDE/app/resources/GDJS/Runtime/Extensions/TextInput/textinputruntimeobject.js',
      '../../newIDE/app/resources/GDJS/Runtime/Extensions/TextInput/textinputruntimeobject-pixi-renderer.js',
      '../../newIDE/app/resources/GDJS/Runtime/Extensions/TopDownMovementBehavior/topdownmovementruntimebehavior.js',
      '../../newIDE/app/resources/GDJS/Runtime/Extensions/Firebase/A_firebasejs/*.js',
      '../../newIDE/app/resources/GDJS/Runtime/Extensions/Firebase/B_firebasetools/*.js',
      '../../newIDE/app/resources/GDJS/Runtime/Extensions/Effects/kawase-blur-pixi-filter.js',
      '../../newIDE/app/resources/GDJS/Runtime/Extensions/Effects/pixi-filters/filter-kawase-blur.js',

      // Test extensions:
      './tests/Extensions/**.js',

      // Other test initialization files:
      './tests-utils/init.js',
      './tests-utils/init.pixiruntimegamewithassets.js',

      // Test helpers
      '../../Extensions/PlatformBehavior/tests/PlatformerTestHelper.js',

      // Assets
      {
        pattern: './tests-utils/assets/*.jpg',
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
