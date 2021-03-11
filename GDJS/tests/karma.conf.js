module.exports = function(config) {
  config.set({
    frameworks: ['mocha'],
    browserNoActivityTimeout: 400000,
    files: [
      'node_modules/expect.js/index.js',

      //GDJS game engine files: (Order is important)
      '../Runtime-dist/libs/jshashtable.js',
      '../Runtime-dist/gd.js',
      '../Runtime-dist/libs/rbush.js',
      '../Runtime-dist/cocos-renderers/cocos-director-manager.js',
      '../Runtime-dist/pixi-renderers/pixi.js',
      '../Runtime-dist/pixi-renderers/*.js',
      '../Runtime-dist/howler-sound-manager/howler.min.js',
      '../Runtime-dist/howler-sound-manager/howler-sound-manager.js',
      '../Runtime-dist/fontfaceobserver-font-manager/fontfaceobserver.js',
      '../Runtime-dist/fontfaceobserver-font-manager/fontfaceobserver-font-manager.js',
      '../Runtime-dist/jsonmanager.js',
      '../Runtime-dist/timemanager.js',
      '../Runtime-dist/timemanager.js',
      '../Runtime-dist/bitmapfontmanager.js',
      '../Runtime-dist/runtimeobject.js',
      '../Runtime-dist/runtimescene.js',
      '../Runtime-dist/scenestack.js',
      '../Runtime-dist/profiler.js',
      '../Runtime-dist/polygon.js',
      '../Runtime-dist/force.js',
      '../Runtime-dist/layer.js',
      '../Runtime-dist/timer.js',
      '../Runtime-dist/inputmanager.js',
      '../Runtime-dist/runtimegame.js',
      '../Runtime-dist/variable.js',
      '../Runtime-dist/variablescontainer.js',
      '../Runtime-dist/oncetriggers.js',
      '../Runtime-dist/runtimebehavior.js',
      '../Runtime-dist/spriteruntimeobject.js',
      '../Runtime-dist/events-tools/commontools.js',
      '../Runtime-dist/events-tools/runtimescenetools.js',
      '../Runtime-dist/events-tools/inputtools.js',
      '../Runtime-dist/events-tools/networktools.js',
      '../Runtime-dist/events-tools/objecttools.js',
      '../Runtime-dist/events-tools/cameratools.js',
      '../Runtime-dist/events-tools/soundtools.js',
      '../Runtime-dist/events-tools/storagetools.js',
      '../Runtime-dist/events-tools/stringtools.js',
      '../Runtime-dist/events-tools/windowtools.js',
      '../Runtime-dist/websocket-debugger-client/hot-reloader.js',

      //Extensions:
      '../Runtime-dist/Extensions/DraggableBehavior/draggableruntimebehavior.js',
      '../Runtime-dist/Extensions/PlatformBehavior/platformerobjectruntimebehavior.js',
      '../Runtime-dist/Extensions/PlatformBehavior/platformruntimebehavior.js',
      '../Runtime-dist/Extensions/LinkedObjects/linkedobjects.js',
      '../Runtime-dist/Extensions/Inventory/inventory.js',
      '../Runtime-dist/Extensions/Inventory/inventorytools.js',
      '../Runtime-dist/Extensions/Lighting/lightruntimeobject.js',
      '../Runtime-dist/Extensions/Lighting/lightruntimeobject-pixi-renderer.js',
      '../Runtime-dist/Extensions/Lighting/lightobstacleruntimebehavior.js',
      '../Runtime-dist/Extensions/PathfindingBehavior/pathfindingobstacleruntimebehavior.js',
      '../Runtime-dist/Extensions/PathfindingBehavior/pathfindingruntimebehavior.js',

      // Test extensions:
      './tests/Extensions/**.js',

      //All tests files:
      './tests-utils/init.pixiruntimegamewithassets.js',
      '../../Extensions/**/tests/**.spec.js',
      './tests/**/*.js',

      //All benchmark files:
      './benchmarks/init.js',
      './benchmarks/**/*.js',

      // Assets
      {pattern: './tests-utils/assets/*.jpg', watched: false, included: false, served: true, nocache: false}
    ]
  });
};
